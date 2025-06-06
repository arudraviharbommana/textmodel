import streamlit as st
import io
from nlp import (
    summarize_with_bart,
    generate_questions_t5,
    answer_question,
)

def init_session_states():
    keys = [
        "mode",
        "sum_text",
        "sum_summary",
        "summary_type",
        "quiz_questions",
        "qa_context",
        "qa_question",
        "qa_answer",
    ]
    for key in keys:
        if key not in st.session_state:
            if key == "mode":
                st.session_state[key] = "Summarization"
            elif key == "summary_type":
                st.session_state[key] = "Short Summary"
            else:
                st.session_state[key] = ""

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
    st.set_page_config(page_title="IntelliNLP - Intelligent Text Processor", layout="wide")
    init_session_states()

    # Load CSS styles
    with open("styles.css") as f:
        st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)

    # Sticky Header
    st.markdown(
        """
    <header class="header">
      <div class="container header-container">
        <div class="logo">IntelliNLP</div>
        <nav>
          <button id="sumBtn" class="nav-btn">Summarization</button>
          <button id="qaBtn" class="nav-btn">Prompt Q&A</button>
        </nav>
      </div>
    </header>

    <script>
      const sumBtn = window.parent.document.querySelector("#sumBtn");
      const qaBtn = window.parent.document.querySelector("#qaBtn");

      function updateModeBtns(mode) {
        if (mode === 'Summarization') {
          sumBtn.classList.add('active');
          qaBtn.classList.remove('active');
        } else {
          sumBtn.classList.remove('active');
          qaBtn.classList.add('active');
        }
      }
      sumBtn.onclick = () => {
        window.dispatchEvent(new CustomEvent('setMode', {detail: 'Summarization'}));
        updateModeBtns('Summarization');
      };
      qaBtn.onclick = () => {
        window.dispatchEvent(new CustomEvent('setMode', {detail: 'Prompt Q&A'}));
        updateModeBtns('Prompt Q&A');
      };
      updateModeBtns("""" + st.session_state.mode + """");
    </script>
    """,
        unsafe_allow_html=True,
    )

    mode = st.selectbox(
        "Choose an option:",
        ["Summarization", "Prompt Q&A"],
        index=["Summarization", "Prompt Q&A"].index(st.session_state.mode),
        label_visibility="collapsed",
    )
    st.session_state.mode = mode

    if mode == "Summarization":
        st.header("Summarization & Quiz Generation")

        uploaded_file = st.file_uploader("Upload a text file (optional):", type=["txt"])
        if uploaded_file is not None:
            file_text = uploaded_file.read().decode("utf-8")
            st.session_state.sum_text = file_text

        text = st.text_area(
            "Enter the paragraph to summarize:", value=st.session_state.sum_text, height=200
        )
        st.session_state.sum_text = text

        summary_type = st.selectbox(
            "Summary length/type:",
            ["Short Summary", "Detailed Bullet-Point Summary"],
            index=["Short Summary", "Detailed Bullet-Point Summary"].index(
                st.session_state.summary_type
            ),
        )
        st.session_state.summary_type = summary_type

        if st.button("Summarize"):
            if text.strip():
                with st.spinner("Generating summary..."):
                    detailed = summary_type == "Detailed Bullet-Point Summary"
                    summary = summarize_with_bart(text, detailed=detailed)
                st.session_state.sum_summary = summary
            else:
                st.warning("Please enter a paragraph to summarize.")

        if st.session_state.sum_summary:
            st.subheader("Summary:")
            st.markdown(f'<div class="card summary">{st.session_state.sum_summary}</div>', unsafe_allow_html=True)
            st.download_button(
                "Download Summary",
                data=st.session_state.sum_summary,
                file_name="summary.txt",
                mime="text/plain",
            )

        if st.button("Generate Quiz"):
            if text.strip():
                with st.spinner("Generating quiz questions..."):
                    quiz_questions = generate_questions_t5(text)
                st.session_state.quiz_questions = quiz_questions

                for i, q in enumerate(quiz_questions, 1):
                    st.markdown(
                        f'<div class="card question-block"><strong>Q{i}:</strong> {q["question"]}</div>',
                        unsafe_allow_html=True,
                    )
                    options_html = "".join(
                        [f"<div>{chr(65+idx)}. {opt}</div>" for idx, opt in enumerate(q["options"])]
                    )
                    st.markdown(f'<div class="card options-block">{options_html}</div>', unsafe_allow_html=True)

                quiz_txt = quiz_to_text(quiz_questions)
                answers_txt = answers_to_text(quiz_questions)
                col1, col2 = st.columns(2)
                with col1:
                    st.download_button(
                        label="Download Quiz as Text",
                        data=quiz_txt,
                        file_name="quiz.txt",
                        mime="text/plain",
                    )
                with col2:
                    st.download_button(
                        label="Download Answers as Text",
                        data=answers_txt,
                        file_name="answers.txt",
                        mime="text/plain",
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
                with st.spinner("Finding answer..."):
                    answer = answer_question(question, context)
                st.session_state.qa_answer = answer
            else:
                st.warning("Please provide both context and a question.")

        if st.session_state.qa_answer:
            st.subheader("Answer:")
            st.markdown(f'<div class="card answer-block">{st.session_state.qa_answer}</div>', unsafe_allow_html=True)


if __name__ == "__main__":
    main()
