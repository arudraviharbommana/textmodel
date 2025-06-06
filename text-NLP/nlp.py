import torch
import re
import logging
import random
from transformers import (
    BartTokenizer,
    BartForConditionalGeneration,
    T5Tokenizer,
    T5ForConditionalGeneration,
    pipeline,
    AutoTokenizer,
    AutoModelForQuestionAnswering
)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load Models

bart_model_name = "facebook/bart-large-cnn"
bart_tokenizer = BartTokenizer.from_pretrained(bart_model_name)
bart_model = BartForConditionalGeneration.from_pretrained(bart_model_name)
bart_model.to(device)

t5_model_name = "t5-base"
t5_tokenizer = T5Tokenizer.from_pretrained(t5_model_name)
t5_model = T5ForConditionalGeneration.from_pretrained(t5_model_name)
t5_model.to(device)

qa_model_name = "distilbert-base-cased-distilled-squad"
qa_tokenizer = AutoTokenizer.from_pretrained(qa_model_name)
qa_model = AutoModelForQuestionAnswering.from_pretrained(qa_model_name)
qa_model.to(device)

try:
    question_gen_pipeline = pipeline("e2e-qg")
except Exception:
    question_gen_pipeline = None


def clean_text(text: str) -> str:
    text = re.sub(r"[^\x00-\x7F]+", " ", text)  # remove non-ascii
    text = re.sub(r"\s+", " ", text).strip()
    return text


def summarize_with_bart(text: str, detailed=False) -> str:
    try:
        cleaned_text = clean_text(text)
        if detailed:
            prompt = f"Summarize the following text into detailed, clear, bullet points:\n{cleaned_text}"
            max_len = 250
            min_len = 100
            num_beams = 6
        else:
            prompt = cleaned_text
            max_len = 150
            min_len = 40
            num_beams = 4

        input_tokens = bart_tokenizer.encode(prompt, return_tensors="pt", max_length=1024, truncation=True).to(device)
        summary_ids = bart_model.generate(
            input_tokens,
            max_length=max_len,
            min_length=min_len,
            length_penalty=2.0,
            num_beams=num_beams,
            early_stopping=True,
            no_repeat_ngram_size=3,
            do_sample=detailed,
            top_k=50 if detailed else None,
            top_p=0.95 if detailed else None,
            temperature=0.7 if detailed else None,
        )
        summary = bart_tokenizer.decode(summary_ids[0], skip_special_tokens=True)
        if detailed:
            lines = summary.split("\n")
            bullet_lines = []
            for line in lines:
                line = line.strip()
                if line and not line.startswith(("•", "*", "-")):
                    line = "• " + line
                bullet_lines.append(line)
            summary = "\n".join(bullet_lines)
        return summary
    except Exception as e:
        logger.warning(f"BART Summarization failed: {e}")
        return "Sorry, I couldn't generate a summary."


def extract_keywords(text, num_keywords=30):
    stopwords = set([
        "the", "and", "is", "in", "to", "of", "a", "for", "on",
        "with", "as", "by", "an", "be", "at", "from", "that",
        "this", "it", "are", "was", "or", "but", "if", "or",
        "using", "used", "use", "also", "however", "many", "other", "some",
        # Add any other generic terms you want to exclude
    ])
    words = re.findall(r'\b\w+\b', text.lower())
    freq = {}
    for w in words:
        if w not in stopwords and len(w) > 3:
            freq[w] = freq.get(w, 0) + 1
    sorted_keywords = sorted(freq, key=freq.get, reverse=True)
    return sorted_keywords[:num_keywords]


def parse_mcq(text):
    """
    Basic method to parse question and four options from model-generated text.
    Expects something like:
    "Question text? Options: A) opt1 B) opt2 C) opt3 D) opt4"
    Returns tuple (question, options list).
    """
    try:
        # Split question and options
        q_parts = re.split(r'Options?:|A\)', text, flags=re.I)
        question = q_parts[0].strip()
        options_text = text[text.lower().find("options") + 7:] if "options" in text.lower() else ""
        # Extract options A) B) C) D)
        options = re.findall(r'[ABCD]\)\s*([^ABCD]+)', options_text)
        options = [opt.strip(' .-') for opt in options if len(opt.strip()) > 0]
        if len(options) != 4:
            return question, []
        return question, options
    except Exception:
        return text, []


def generate_questions_t5(text: str, num_questions=5):
    try:
        prompt = (
            "generate multiple choice questions with 4 answer options, "
            "the first option is correct answer, based on the text:\n"
            + text
        )
        input_tokens = t5_tokenizer.encode(prompt, return_tensors='pt', max_length=512, truncation=True).to(device)

        question_outputs = t5_model.generate(
            input_tokens,
            max_length=150,
            num_return_sequences=num_questions*2,  # generate more to filter quality
            do_sample=True,
            top_p=0.95,
            top_k=50,
            temperature=0.9,
            no_repeat_ngram_size=3
        )
        questions_raw = [t5_tokenizer.decode(q, skip_special_tokens=True) for q in question_outputs]

        parsed_questions = []
        keywords = extract_keywords(text, num_keywords=30)

        for raw_q in questions_raw:
            question, options = parse_mcq(raw_q)
            if len(question) < 15 or len(options) != 4:
                continue
            correct_answer = options[0]
            opts_pool = [k for k in keywords if k.lower() != correct_answer.lower()]
            # Fill options with distractors if invalid options from parse
            if len(options) != 4 or any(len(o.strip()) == 0 for o in options):
                distractors = random.sample(opts_pool, min(3, len(opts_pool)))
                options = [correct_answer] + distractors
            combined = list(zip(options, [opt == correct_answer for opt in options]))
            random.shuffle(combined)
            options_shuffled, is_correct_flag = zip(*combined)
            parsed_questions.append({
                "question": question,
                "options": list(options_shuffled),
                "answer": correct_answer,
                "correct_index": is_correct_flag.index(True)
            })
            if len(parsed_questions) >= num_questions:
                break

        if len(parsed_questions) < num_questions:
            # Fallback to simpler keyword-based questions if not enough good generated
            return generate_quiz_fallback(text, num_questions)
        return parsed_questions

    except Exception as e:
        logger.warning(f"Enhanced question generation failed: {e}")
        return generate_quiz_fallback(text, num_questions)


def generate_quiz_fallback(text, min_questions=5):
    # Simple fallback: fill in blank style questions with extracted keywords
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
            pass

    sentences = [s.strip() for s in re.split(r'[.?!]', text) if len(s.split()) > 5]
    keywords = extract_keywords(text)
    random.shuffle(sentences)
    questions = []
    used_sentences = set()
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


def answer_question(question: str, context: str) -> str:
    try:
        inputs = qa_tokenizer.encode_plus(question, context, return_tensors="pt", truncation=True, max_length=512).to(device)
        with torch.no_grad():
            outputs = qa_model(**inputs)
        answer_start = torch.argmax(outputs.start_logits)
        answer_end = torch.argmax(outputs.end_logits) + 1
        answer = qa_tokenizer.convert_tokens_to_string(
            qa_tokenizer.convert_ids_to_tokens(inputs["input_ids"][0][answer_start:answer_end])
        )
        if not answer.strip():
            return "Sorry, I couldn't find an answer in the given text."
        return answer
    except Exception as e:
        logger.warning(f"QA failed: {e}")
        return "Sorry, I couldn't answer the question. Try rephrasing or simplifying it."
