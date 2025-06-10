import nltk
from transformers import pipeline, T5ForConditionalGeneration, T5Tokenizer
from summa.summarizer import summarize as summa_summarize
import random

# Download NLTK data if not already present
nltk.download('punkt', quiet=True)

# Load models once
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
t5_model_name = "valhalla/t5-base-qg-hl"
t5_tokenizer = T5Tokenizer.from_pretrained(t5_model_name)
t5_model = T5ForConditionalGeneration.from_pretrained(t5_model_name)
qa_pipeline = pipeline("question-answering")

def summarize_with_bart(text, detailed=False, method="abstractive"):
    if method == "extractive":
        try:
            # Gensim extractive summarization
            summary = gensim_summarize(text, word_count=80 if not detailed else 150)
            if not summary.strip():
                raise ValueError("Gensim summary empty, fallback to abstractive.")
            return summary
        except Exception:
            pass  # fallback to abstractive

    # Abstractive summarization (default)
    max_length = 130 if not detailed else 250
    min_length = 30 if not detailed else 80
    summary = summarizer(text, max_length=max_length, min_length=min_length, do_sample=False)[0]["summary_text"]
    if detailed:
        # Try to split into bullet points
        sentences = nltk.sent_tokenize(summary)
        return "\n".join(f"- {s}" for s in sentences)
    return summary

def generate_questions_t5(text, num_questions=5):
    # Use T5 for question generation
    input_text = "generate questions: " + text.strip().replace("\n", " ")
    input_ids = t5_tokenizer.encode(input_text, return_tensors="pt")
    outputs = t5_model.generate(input_ids, max_length=256, num_return_sequences=num_questions, do_sample=True)
    questions = [t5_tokenizer.decode(o, skip_special_tokens=True) for o in outputs]
    # Generate dummy options for each question (for demo)
    quiz = []
    for q in questions:
        options = [q + f" Option {i}" for i in range(1, 5)]
        answer = random.choice(options)
        quiz.append({"question": q, "options": options, "answer": answer})
    return quiz

def answer_question(question, context):
    result = qa_pipeline(question=question, context=context)
    return result["answer"]

# Fallback: NLTK-based simple question generator (extracts sentences and turns them into questions)
def generate_questions_nltk(text, num_questions=5):
    sentences = nltk.sent_tokenize(text)
    questions = []
    for s in sentences[:num_questions]:
        q = s.replace(".", "?")
        options = [q + f" Option {i}" for i in range(1, 5)]
        answer = options[0]
        questions.append({"question": q, "options": options, "answer": answer})
    return questions