# backend_api.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import torch
from transformers import (
    AutoTokenizer, 
    T5ForConditionalGeneration, 
    pipeline
)
import random
import re

app = FastAPI()
# Load models and tokenizers once when server starts
sum_model_name = "t5-small"
sum_tokenizer = AutoTokenizer.from_pretrained(sum_model_name)
sum_model = T5ForConditionalGeneration.from_pretrained(sum_model_name)

qa_model_name = "distilbert-base-cased-distilled-squad"
qa_tokenizer = AutoTokenizer.from_pretrained(qa_model_name)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
sum_model.to(device)

try:
    question_gen_pipeline = pipeline("e2e-qg")
except Exception:
    question_gen_pipeline = None

# Input models
class TextInput(BaseModel):
    text: str

class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    answer: str

# Utility functions for quiz generation
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

def generate_quiz_internal(text, min_questions=5):
    if question_gen_pipeline:
        try:
            generated = question_gen_pipeline(text)
            questions = []
            for item in generated[:min_questions]:
                question_text = item['question']
                answer_text = item['answer']
                keywords = extract_keywords(text)
                distractors = [k for k in keywords if k.lower() != answer_text.lower()]
                distractors = distractors[:3] if len(distractors) >= 3 else distractors + ["option1", "option2"]
                options = [answer_text] + distractors
                random.shuffle(options)
                questions.append({
                    "question": question_text,
                    "options": options,
                    "answer": answer_text
                })
            if questions:
                return questions
        except Exception:
            pass

    # Fallback fill-in-the-blank
    sentences = [s.strip() for s in re.split(r'[.?!]', text) if len(s.split()) > 5]
    keywords = extract_keywords(text)
    questions = []
    used_sentences = set()
    random.shuffle(sentences)
    for sentence in sentences:
        for keyword in keywords:
            if keyword in sentence.lower() and sentence not in used_sentences:
                pattern = re.compile(re.escape(keyword), re.IGNORECASE)
                question_text = pattern.sub("______", sentence, count=1)
                correct_answer = keyword
                options = random.sample([k for k in keywords if k != correct_answer], k=3) + [correct_answer]
                random.shuffle(options)
                questions.append({
                    "question": question_text,
                    "options": options,
                    "answer": correct_answer
                })
                used_sentences.add(sentence)
                if len(questions) >= min_questions:
                    break
        if len(questions) >= min_questions:
            break
    return questions[:min_questions]

@app.post("/summarize")
def summarize_endpoint(payload: TextInput):
    text = payload.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Input text is empty")
    input_text = "summarize: " + text
    inputs = sum_tokenizer.encode(input_text, return_tensors="pt", max_length=1024, truncation=True).to(device)
    input_word_len = len(text.split())
    max_length = max(50, int(input_word_len * 0.4))
    min_length = max(30, int(max_length * 0.9))

    summary_ids = sum_model.generate(
        inputs,
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
    return {"summary": summary}

@app.post("/generate_quiz", response_model=List[QuizQuestion])
def generate_quiz_endpoint(payload: TextInput):
    text = payload.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Input text is empty")
    questions = generate_quiz_internal(text)
    return questions
