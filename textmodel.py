import torch
from transformers import (
    AutoTokenizer, 
    AutoModelForSeq2SeqLM, 
    AutoModelForQuestionAnswering, 
    T5ForConditionalGeneration
)
import re
import logging
import streamlit as st
from PIL import Image, ImageOps
import pytesseract
import cv2
import numpy as np
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

# Question Answering model
qa_model_name = "distilbert-base-cased-distilled-squad"
qa_tokenizer = AutoTokenizer.from_pretrained(qa_model_name)
qa_model = AutoModelForQuestionAnswering.from_pretrained(qa_model_name)

# Device setup
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
sum_model.to(device)
qa_model.to(device)

# Utility functions
def is_question(text: str) -> bool:
    return text.strip().endswith("?") or text.lower().startswith(("who", "what", "when", "where", "why", "how"))

def clean_text(text: str) -> str:
    text = re.sub(r'[^\x00-\x7F]+', ' ', text)  # remove non-ascii
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def summarize(text: str) -> str:
    try:
        input_text = "summarize: " + clean_text(text)
        inputs = sum_tokenizer.encode(input_text, return_tensors="pt", max_length=512, truncation=True).to(device)
        summary_ids = sum_model.generate(inputs, max_length=150, min_length=40, length_penalty=2.0, num_beams=4, early_stopping=True)
        return sum_tokenizer.decode(summary_ids[0], skip_special_tokens=True)
    except Exception as e:
        logger.warning(f"Summarization failed: {e}")
        return "Sorry, I couldn't generate a summary. Try providing a more detailed paragraph."

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

def extract_text_from_ui_image(image: Image.Image) -> str:
    try:
        # Convert image to OpenCV format
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
            image.save(tmp.name)
            img_cv = cv2.imread(tmp.name)
        gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
        gray = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
        scale_percent = 150
        width = int(gray.shape[1] * scale_percent / 100)
        height = int(gray.shape[0] * scale_percent / 100)
        gray = cv2.resize(gray, (width, height), interpolation=cv2.INTER_LINEAR)
        custom_config = r'--oem 3 --psm 6'
        text = pytesseract.image_to_string(gray, config=custom_config)
        return clean_text(text)
    except Exception as e:
        logger.warning(f"Image text extraction failed: {e}")
        return "Could not extract text from image."

# Initialize session state keys
def init_session_states():
    keys = [
        'mode', 'sum_text', 'sum_summary', 'qa_context', 'qa_question', 'qa_answer',
        'prompt_qa_context', 'prompt_qa_prompts', 'prompt_qa_answers', 'prompt_qa_input',
        'image_text', 'uploaded_image'
    ]
    for key in keys:
        if key not in st.session_state:
            if key == "mode":
                st.session_state[key] = "Summarization"
            elif "prompts" not in key and "answers" not in key:
                st.session_state[key] = ""
            else:
                st.session_state[key] = []

def main():
    st.title("Intelligent Text Processor")
    init_session_states()

    mode = st.selectbox("Choose an option:", ["Summarization", "Question Answering", "Prompt Q&A", "Image Upload"],
                        index=["Summarization", "Question Answering", "Prompt Q&A", "Image Upload"].index(st.session_state.mode))

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

    elif mode == "Question Answering":
        st.header("Question Answering")
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

    elif mode == "Prompt Q&A":
        st.header("Prompt Q&A (Multiple Prompts)")
        context = st.text_area("Enter context for Q&A:", value=st.session_state.prompt_qa_context, height=200)
        st.session_state.prompt_qa_context = context

        prompt = st.text_input("Enter prompt/question:", value=st.session_state.prompt_qa_input)
        submitted = st.button("Get Answer from Prompt")

        if submitted:
            if context.strip() and prompt.strip():
                answer = answer_question(prompt, context)
                st.session_state.prompt_qa_prompts.append(prompt)
                st.session_state.prompt_qa_answers.append(answer)
                st.session_state.prompt_qa_input = ""
            else:
                st.warning("Please provide both context and a prompt/question.")

        if st.session_state.prompt_qa_prompts:
            st.markdown("### Conversation History")
            for i in range(len(st.session_state.prompt_qa_prompts)):
                st.markdown(f"**Prompt:** {st.session_state.prompt_qa_prompts[i]}")
                st.markdown(f"**Answer:** {st.session_state.prompt_qa_answers[i]}")
                st.markdown("---")

    elif mode == "Image Upload":
        st.header("Image Upload and Text Extraction")
        uploaded_image = st.file_uploader("Upload an image:", type=["png", "jpg", "jpeg"])
        if uploaded_image is not None:
            image = Image.open(uploaded_image)
            st.image(image, caption="Uploaded Image", use_container_width=True)
            text = extract_text_from_ui_image(image)
            st.session_state.image_text = text

        if st.session_state.image_text:
            st.subheader("Extracted Text:")
            st.write(st.session_state.image_text)

if __name__ == "__main__":
    main()
