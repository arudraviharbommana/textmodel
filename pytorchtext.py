import torch
from transformers import (
    AutoTokenizer, 
    T5ForConditionalGeneration, 
    pipeline
)
import re
import logging
import streamlit as st
from PIL import Image, ImageFilter, ImageOps
import pytesseract
import random
import io
import tempfile

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

# Device setup
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
sum_model.to(device)

# Utility functions
def clean_text(text: str) -> str:
    text = re.sub(r'[^\x00-\x7F]+', ' ', text)  # remove non-ascii
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def summarize(text: str) -> str:
    try:
        input_text = "summarize: " + clean_text(text)
        inputs = sum_tokenizer.encode(input_text, return_tensors="pt", max_length=512, truncation=True).to(device)
        summary_ids = sum_model.generate(inputs, max_length=len(text.split()) // 2, min_length=40, length_penalty=2.0, num_beams=4, early_stopping=True)
        return sum_tokenizer.decode(summary_ids[0], skip_special_tokens=True)
    except Exception as e:
        logger.warning(f"Summarization failed: {e}")
        return "Sorry, I couldn't generate a summary. Try providing a more detailed paragraph."

def extract_text_from_image(image: Image.Image) -> str:
    preprocessed = preprocess_image(image)
    text = pytesseract.image_to_string(preprocessed)
    return clean_text(text)

def preprocess_image(image):
    gray = image.convert("L")
    gray = ImageOps.autocontrast(gray)
    threshold = 140
    bw = gray.point(lambda x: 255 if x > threshold else 0, mode='1')
    bw = bw.filter(ImageFilter.MedianFilter(size=3))
    if bw.width < 300:
        new_size = (bw.width * 2, bw.height * 2)
        bw = bw.resize(new_size, Image.Resampling.LANCZOS)
    return bw

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

# Initialize session state keys
def init_session_states():
    keys = [
        'mode', 'sum_text', 'sum_summary', 'quiz_questions', 'image_text'
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

    mode = st.selectbox("Choose an option:", ["Summarization", "Image Upload"],
                        index=["Summarization", "Image Upload"].index(st.session_state.mode))

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

    elif mode == "Image Upload":
        st.header("Image Upload and Text Extraction")
        uploaded_image = st.file_uploader("Upload an image:", type=["png", "jpg", "jpeg"])
        if uploaded_image is not None:
            image = Image.open(uploaded_image)
            st.image(image, caption="Uploaded Image", use_container_width=True)
            text = extract_text_from_image(image)
            st.session_state.image_text = text

        if st.session_state.image_text:
            st.subheader("Extracted Text:")
            st.write(st.session_state.image_text)

if __name__ == "__main__":
    main()
