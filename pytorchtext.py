
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

# Streamlit UI
def main():
    st.title("Intelligent Text Processor")
    
    mode = st.selectbox("Choose an option:", ["Summarization", "Question Answering", "Prompt Q&A"])
    
    if mode == "Summarization":
        text = st.text_area("Enter the paragraph to summarize:")
        if st.button("Summarize"):
            if text:
                summary = summarize(text)
                st.write("Summary:")
                st.write(summary)
                
                # Download button for summary
                st.download_button(
                    label="Download Summary",
                    data=summary,
                    file_name="summary.txt",
                    mime="text/plain"
                )
            else:
                st.warning("Please enter a paragraph to summarize.")
    
    elif mode == "Question Answering":
        context = st.text_area("Enter context:")
        question = st.text_input("Enter your question:")
        if st.button("Get Answer"):
            if context and question:
                answer = answer_question(question, context)
                st.write("Answer:")
                st.write(answer)
            else:
                st.warning("Please provide both context and a question.")
    
    elif mode == "Prompt Q&A":
        context = st.text_area("Enter context for Q&A:")
        prompt = st.text_input("Enter your prompt/question:")
        if st.button("Get Answer from Prompt"):
            if context and prompt:
                answer = answer_question(prompt, context)
                st.write("Answer:")
                st.write(answer)
            else:
                st.warning("Please provide both context and a prompt.")

if __name__ == "__main__":
    main()
