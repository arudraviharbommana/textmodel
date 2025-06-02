# streamlit_app.py
import requests
import streamlit as st
import logging
import re
import io

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Backend API URL
BACKEND_URL = "http://127.0.0.1:8000"  # Change if backend hosted elsewhere

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

def summarize(text: str) -> str:
    try:
        response = requests.post(f"{BACKEND_URL}/summarize", json={"text": text})
        response.raise_for_status()
        return response.json().get("summary", "")
    except Exception as e:
        logger.warning(f"Error in summarization: {e}")
        return "Error communicating with backend summarizer."

def generate_quiz(text, min_questions=5):
    try:
        response = requests.post(f"{BACKEND_URL}/generate_quiz", json={"text": text})
        response.raise_for_status()
        return response.json()  # List of quiz questions with options and answers
    except Exception as e:
        logger.warning(f"Error in quiz generation: {e}")
        return "Error communicating with backend quiz generator."

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

def main():
    st.title("Intelligent Text Processor with Quiz Generation")
    init_session_states()

    mode = st.selectbox("Choose an option:", ["Summarization", "Prompt Q&A"],
                        index=["Summarization", "Prompt Q&A"].index(st.session_state.mode))

    if mode != st.session_state.mode:
        st.session_state.mode = mode

    if mode == "Summarization":
        st.header("Summarization")

        # File uploader - if uploaded, overwrite text area content
        uploaded_file = st.file_uploader("Upload a text file (optional):", type=["txt"])
        if uploaded_file is not None:
            file_text = uploaded_file.read().decode("utf-8")
            st.session_state.sum_text = file_text

        # Text area - user can edit or input text directly
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
