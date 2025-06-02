import torch
from transformers import (
    AutoTokenizer, 
    T5ForConditionalGeneration, 
    pipeline,
    AutoModelForQuestionAnswering
)
import re
import logging
import streamlit as st
import random
import io

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load models and tokenizers
logger.info("Loading models...")

# Summarization model
sum_model_name = "t5-small"
sum_tokenizer = AutoTokenizer.from_pretrained(sum_model_name)
sum_model = T5ForConditionalGeneration.from_pretrained(sum_model_name)

# Question generation pipeline
try:
    question_gen_pipeline = pipeline("e2e-qg")
except Exception:
    question_gen_pipeline = None

# Question Answering model
qa_model_name = "distilbert-base-cased-distilled-squad"
qa_tokenizer = AutoTokenizer.from_pretrained(qa_model_name)
qa_model = AutoModelForQuestionAnswering.from_pretrained(qa_model_name)

# Device setup
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
sum_model.to(device)
qa_model.to(device)

# Utility functions
def clean_text(text: str) -> str:
    text = re.sub(r'[^\x00-\x7F]+', ' ', text)  # remove non-ascii
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def summarize(text: str) -> str:
    try:
        input_text = "summarize: " + clean_text(text)
        input_tokens = sum_tokenizer.encode(input_text, return_tensors="pt", max_length=1024, truncation=True).to(device)

        # Calculate max and min length for summary (2/5 of input word count)
        input_word_len = len(text.split())
        max_length = max(50, int(input_word_len * 0.4))  # slightly less than 2/5 to allow model to output nicely
        min_length = max(30, int(max_length * 0.9))  # ensure summary isn't too short
        
        # Generation with sampling for dynamic outputs
        summary_ids = sum_model.generate(
            input_tokens,
            max_length=max_length,
            min_length=min_length,
            do_sample=True,
            top_k=50,
            top_p=0.95,
            temperature=0.85,
            num_return_sequences=1,
            length_penalty=1.0,
            early_stopping=True
        )

        summary = sum_tokenizer.decode(summary_ids[0], skip_special_tokens=True)
        return summary

    except Exception as e:
        logger.warning(f"Summarization failed: {e}")
        return "Sorry, I couldn't generate a summary. Try providing a more detailed paragraph."

def generate_quiz(text, min_questions=5):
    if question_gen_pipeline:
        try:
            generated = question_gen_pipeline(text)
            questions = []
            for item in generated[:min_questions]:
                question_text = item['question']
                answer_text = item['answer']
                options = [answer_text] + random.sample([k for k in extract_keywords(text) if k != answer_text], k=3)
                random.shuffle(options)
                questions.append({
                    "question": question_text,
                    "options": options,
                    "answer": answer_text
                })
            return questions
        except Exception:
            pass  # fall back if model fails

    # Fallback fill-in-the-blank keyword based question generation
    sentences = [s.strip() for s in re.split(r'[.?!]', text) if len(s.split()) > 5]
    keywords = extract_keywords(text)
    questions = []
    used_sentences = set()
    random.shuffle(sentences)
    for sentence in sentences:
        for keyword in keywords:
            if keyword in sentence.lower() and sentence not in used_sentences:
                pattern = re.compile(re.escape(keyword), re.IGNORECASE)
                question_text = pattern.sub('______', sentence, count=1)
                correct_answer = keyword
                options = random.sample([k for k in keywords if k != correct_answer], k=3) + [correct_answer]
                random.shuffle(options)
                questions.append({
                    "question": f"Fill in the blank: {question_text}",
                    "options": options,
                    "answer": correct_answer
                })
                used_sentences.add(sentence)
                if len(questions) >= min_questions:
                    break
        if len(questions) >= min_questions:
            break
    return questions[:min_questions]

def extract_keywords(text, num_keywords=20):
    stopwords = set([
        "the", "and", "is", "in", "to", "of", "a", "for", "on",
        "with", "as", "by", "an", "be", "at", "from", "that",
        "this", "it", "are", "was", "or", "but", "if", "or"
    ])
    words = re.findall(r'\b\w+\b', text.lower())
    freq = {}
    for word in words:
        if word not in stopwords and len(word) > 2:
            freq[word] = freq.get(word, 0) + 1
    sorted_keywords = sorted(freq, key=freq.get, reverse=True)
    return sorted_keywords[:num_keywords]

def quiz_to_text(quiz_questions):
    output = io.StringIO()
    for i, q in enumerate(quiz_questions, 1):
        output.write(f"Q{i}: {q['question']}\n")
        for idx, opt in enumerate(q['options']):
            output.write(f"   {chr(65+idx)}. {opt}\n")
        output.write("\n")
    return output.getvalue()

def answers_to_text(quiz_questions):
    output = io.StringIO()
    for i, q in enumerate(quiz_questions, 1):
        correct_idx = q['options'].index(q['answer'])
        output.write(f"Q{i}: {chr(65+correct_idx)}. {q['answer']}\n")
    return output.getvalue()

def answer_question(question: str, context: str) -> str:
    try:
        inputs = qa_tokenizer.encode_plus(question, context, return_tensors="pt", truncation=True, max_length=512).to(device)
        with torch.no_grad():
            outputs = qa_model(**inputs)
        answer_start = torch.argmax(outputs.start_logits)
        answer_end = torch.argmax(outputs.end_logits) + 1
        answer = qa_tokenizer.convert_tokens_to_string(qa_tokenizer.convert_ids_to_tokens(inputs["input_ids"][0][answer_start:answer_end]))
        if answer.strip() == "":
            return "Sorry, I couldn't find an answer in the given text."
        return answer
    except Exception as e:
        logger.warning(f"QA failed: {e}")
        return "Sorry, I couldn't answer the question. Try rephrasing or simplifying it."

# Initialize session state keys
def init_session_states():
    keys = [
        'mode', 'sum_text', 'sum_summary', 'quiz_questions', 
        'qa_context', 'qa_question', 'qa_answer'
    ]
    for key in keys:
        if key not in st.session_state:
            if key == "mode":
                st.session_state[key] = "Summarization"
            else:
                st.session_state[key] = ""

def main():
    st.title("Intelligent Text Processor with Quiz Generation")
    init_session_states()

    mode = st.selectbox("Choose an option:", ["Summarization", "Prompt Q&A"],
                        index=["Summarization", "Prompt Q&A"].index(st.session_state.mode))

    if mode != st.session_state.mode:
        st.session_state.mode = mode

    if mode == "Summarization":
        st.header("Summarization")
        text = st.text_area("Enter the paragraph to summarize:", value=st.session_state.sum_text, height=200)
        st.session_state.sum_text = text

        if st.button("Summarize"):
            if text.strip():
                summary = summarize(text)
                st.session_state.sum_summary = summary
            else:
                st.warning("Please enter a paragraph to summarize.")

        if st.session_state.sum_summary:
            st.subheader("Summary:")
            st.write(st.session_state.sum_summary)
            st.download_button("Download Summary", data=st.session_state.sum_summary, file_name="summary.txt", mime="text/plain")

        if st.button("Generate Quiz"):
            if text.strip():
                quiz_questions = generate_quiz(text)
                st.session_state.quiz_questions = quiz_questions
                for i, q in enumerate(quiz_questions, 1):
                    st.markdown(f"**Q{i}:** {q['question']}")
                    for idx, opt in enumerate(q['options']):
                        st.write(f"{chr(65+idx)}. {opt}")
                    st.markdown("---")

                quiz_txt = quiz_to_text(quiz_questions)
                answers_txt = answers_to_text(quiz_questions)

                st.download_button(
                    label="Download Quiz as Text",
                    data=quiz_txt,
                    file_name="quiz.txt",
                    mime="text/plain"
                )
                st.download_button(
                    label="Download Answers as Text",
                    data=answers_txt,
                    file_name="answers.txt",
                    mime="text/plain"
                )
            else:
                st.warning("Please enter a paragraph to generate a quiz.")

    elif mode == "Prompt Q&A":
        st.header("Prompt Q&A")
        context = st.text_area("Enter context:", value=st.session_state.qa_context, height=200)
        st.session_state.qa_context = context

        question = st.text_input("Enter your question:", value=st.session_state.qa_question)
        st.session_state.qa_question = question

        if st.button("Get Answer"):
            if context.strip() and question.strip():
                answer = answer_question(question, context)
                st.session_state.qa_answer = answer
            else:
                st.warning("Please provide both context and a question.")

        if st.session_state.qa_answer:
            st.subheader("Answer:")
            st.write(st.session_state.qa_answer)

if __name__ == "__main__":
    main()

