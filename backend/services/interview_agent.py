import os
import json
import re
import random
from datetime import datetime, timezone
from typing import TypedDict, List, Dict, Any, Optional
from sqlalchemy.orm import Session
from langgraph.graph import StateGraph, END
from groq import Groq

from backend.models import InterviewSession, Message
from backend.services.question_generator import generate_interview_questions


class InterviewState(TypedDict):
    session_id: int
    target_role: str
    current_stage: str
    questions: List[Dict[str, Any]]
    current_question_index: int
    conversation_history: List[Dict[str, str]]
    last_answer_quality: str
    explicit_dont_know: bool
    acknowledgment: str
    stage_time_expired: bool
    next_agent_response: str


def get_groq_client() -> Groq:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY environment variable is missing or empty.")
    return Groq(api_key=api_key)


STAGE_TIME_LIMITS_SECONDS = {
    "intro": 5 * 60,
    "technical": 20 * 60,
    "behavioral": 15 * 60,
    "closing": 5 * 60,
}


def is_stage_time_expired(stage: str, stage_started_at) -> bool:
    if stage_started_at is None:
        return False
    limit = STAGE_TIME_LIMITS_SECONDS.get(stage)
    if limit is None:
        return False
    now = datetime.now(timezone.utc)
    started = stage_started_at
    if started.tzinfo is None:
        started = started.replace(tzinfo=timezone.utc)
    elapsed = (now - started).total_seconds()
    return elapsed > limit


def normalize_stage(q_type: str) -> str:
    q_type = (q_type or "").lower().strip()
    if q_type in ["technical", "resume-specific"]:
        return "technical"
    if q_type == "behavioral":
        return "behavioral"
    return "technical"


def find_next_stage_start_index(questions: List[Dict[str, Any]], current_idx: int, current_stage: str) -> int:
    for i in range(current_idx + 1, len(questions)):
        if normalize_stage(questions[i].get("type", "technical")) != current_stage:
            return i
    return len(questions)


DONT_KNOW_PATTERNS = [
    r"don'?t\s*know",
    r"do\s*not\s*know",
    r"no\s*idea",
    r"not\s*sure",
    r"have\s*no\s*idea",
    r"i'?m\s*not\s*sure",
    r"^idk$",
    r"^skip$",
    r"^pass$",
]


def is_explicit_dont_know(text: str) -> bool:
    normalized = text.strip().lower()
    if not normalized:
        return True
    if len(normalized.split()) > 10:
        return False
    for pattern in DONT_KNOW_PATTERNS:
        if re.search(pattern, normalized):
            return True
    return False


def evaluate_answer(state: InterviewState) -> dict:
    """
    Node A: Judge quality AND generate a specific one-sentence spoken
    acknowledgment based on what the candidate actually said.
    """
    questions = state.get("questions", [])
    idx = state.get("current_question_index", 0)
    history = state.get("conversation_history", [])

    if not questions or idx >= len(questions):
        return {"last_answer_quality": "sufficient", "explicit_dont_know": False, "acknowledgment": ""}

    current_q = questions[idx]
    question_text = current_q.get("question", "")

    last_user_answer = ""
    for msg in reversed(history):
        if msg.get("sender") == "user":
            last_user_answer = msg.get("content", "")
            break

    if not last_user_answer.strip():
        return {"last_answer_quality": "weak", "explicit_dont_know": True, "acknowledgment": ""}

    if is_explicit_dont_know(last_user_answer):
        print(f"[EVALUATION] Session {state.get('session_id')} | Q[{idx}] Explicit 'don't know'.")
        return {"last_answer_quality": "weak", "explicit_dont_know": True, "acknowledgment": ""}

    client = get_groq_client()
    prompt = f"""You are an encouraging, fair, and professional technical interviewer evaluating a candidate's response.

Current Interview Question: "{question_text}"
Question Category: {current_q.get("type", "technical")}
Target Role: {state.get("target_role", "Candidate")}

Candidate's Answer:
"{last_user_answer}"

Evaluation Criteria:
- Mark as "sufficient" if the candidate provides a reasonable, relevant, or thoughtful response that attempts to address the question (even if brief or imperfect).
- Mark as "weak" ONLY if the answer is extremely vague, completely off-topic, evasive, or lacks any real substance.

Also write a ONE-SENTENCE spoken acknowledgment (under 15 words) you would say out loud right after they answer, before moving to the next question. Make it SPECIFIC to what they actually said, not generic. Examples of tone:
- If good: "Perfect, that's a clear explanation of how batch norm stabilizes training."
- If weak: "That's not quite the right approach — batch norm doesn't work that way."

Return ONLY a JSON object:
{{
  "quality": "sufficient" or "weak",
  "acknowledgment": "your one-sentence spoken reaction here"
}}
"""
    quality = "sufficient"
    acknowledgment = ""
    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {"role": "system", "content": "You are a fair, warm interview evaluator outputting valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.4,
            response_format={"type": "json_object"}
        )
        content = response.choices[0].message.content.strip()
        cleaned = re.sub(r"^```(?:json)?\s*", "", content, flags=re.MULTILINE)
        cleaned = re.sub(r"\s*```$", "", cleaned, flags=re.MULTILINE).strip()
        parsed = json.loads(cleaned)
        quality = str(parsed.get("quality", "sufficient")).lower().strip()
        if quality not in ["weak", "sufficient"]:
            quality = "sufficient"
        acknowledgment = str(parsed.get("acknowledgment", "")).strip()
    except Exception as err:
        print(f"[EVALUATION WARNING] {err}. Defaulting to 'sufficient'.")
        quality = "sufficient"
        acknowledgment = ""

    return {"last_answer_quality": quality, "explicit_dont_know": False, "acknowledgment": acknowledgment}


ACKNOWLEDGMENTS_WEAK_FALLBACK = [
    "Hmm, that's not quite clear enough — let's move on.",
    "That could use more detail, but let's keep going.",
]

ACKNOWLEDGMENTS_GOOD_FALLBACK = [
    "Great answer!",
    "Nice, that's a solid explanation.",
]

ACKNOWLEDGMENTS_DONT_KNOW = [
    "Okay, no problem — let's move to the next question.",
    "No worries at all, that one can be tricky — let's move on.",
    "That's alright, not everyone knows every answer — here's the next one.",
]


def next_question(state: InterviewState) -> dict:
    """
    Node B: Use the specific LLM-generated acknowledgment when available,
    then move straight to the NEXT question (never repeats). Falls back to
    a generic phrase only if the LLM acknowledgment is missing.
    """
    questions = state.get("questions", [])
    current_idx = state.get("current_question_index", 0)
    current_stage = state.get("current_stage", "technical")
    quality = state.get("last_answer_quality", "sufficient")
    was_dont_know = state.get("explicit_dont_know", False)
    time_expired = state.get("stage_time_expired", False)
    llm_acknowledgment = state.get("acknowledgment", "").strip()

    if time_expired:
        next_idx = find_next_stage_start_index(questions, current_idx, current_stage)
        transition_prefix = "Time's up for this stage! Let's move on —"
    elif was_dont_know:
        next_idx = current_idx + 1
        transition_prefix = random.choice(ACKNOWLEDGMENTS_DONT_KNOW)
    elif llm_acknowledgment:
        next_idx = current_idx + 1
        transition_prefix = llm_acknowledgment
    elif quality == "weak":
        next_idx = current_idx + 1
        transition_prefix = random.choice(ACKNOWLEDGMENTS_WEAK_FALLBACK)
    else:
        next_idx = current_idx + 1
        transition_prefix = random.choice(ACKNOWLEDGMENTS_GOOD_FALLBACK)

    if next_idx < len(questions):
        next_q = questions[next_idx]
        new_stage = normalize_stage(next_q.get("type", "technical"))
        stage_changed = new_stage != current_stage

        response_text = f"{transition_prefix}\n\n{next_q['question']}"

        return {
            "current_question_index": next_idx,
            "current_stage": new_stage,
            "explicit_dont_know": False,
            "stage_time_expired": False,
            "next_agent_response": response_text,
            "_stage_changed": stage_changed,
        }
    else:
        closing_msg = (
            f"{transition_prefix}\n\n"
            "That wraps up all the questions in this mock interview session! "
            "Thank you for your answers — I'm now ready to compile your detailed feedback report."
        )
        return {
            "current_question_index": next_idx,
            "current_stage": "closing",
            "explicit_dont_know": False,
            "stage_time_expired": False,
            "next_agent_response": closing_msg,
            "_stage_changed": True,
        }


builder = StateGraph(InterviewState)
builder.add_node("evaluate_answer", evaluate_answer)
builder.add_node("next_question", next_question)

builder.set_entry_point("evaluate_answer")
builder.add_edge("evaluate_answer", "next_question")
builder.add_edge("next_question", END)

interview_graph = builder.compile()


def process_user_response(session_id: int, user_message: str, db: Session) -> dict:
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise ValueError(f"Session with id {session_id} not found.")

    if session.status == "completed":
        return {
            "reply": "This interview session has already been completed.",
            "stage": "closing",
            "status": "completed"
        }

    db.add(Message(session_id=session_id, sender="user", content=user_message, stage=session.stage))
    db.commit()

    all_messages = db.query(Message).filter(Message.session_id == session_id).order_by(Message.created_at.asc()).all()

    system_msg = None
    questions = []
    current_idx = 0

    for m in all_messages:
        if m.sender == "system":
            system_msg = m
            try:
                state_data = json.loads(m.content)
                if isinstance(state_data, dict):
                    questions = state_data.get("questions", [])
                    current_idx = state_data.get("current_question_index", 0)
                elif isinstance(state_data, list):
                    questions = state_data
            except Exception:
                pass
            break

    if not questions and session.resume and session.resume.parsed_json:
        try:
            questions = generate_interview_questions(session.resume.parsed_json, session.target_role)
        except Exception:
            questions = []

    history = [{"sender": m.sender, "content": m.content} for m in all_messages if m.sender != "system"]

    if session.current_stage_started_at is None:
        session.current_stage_started_at = datetime.now(timezone.utc)
        db.commit()

    stage_expired = is_stage_time_expired(session.stage, session.current_stage_started_at)

    initial_state: InterviewState = {
        "session_id": session_id,
        "target_role": session.target_role,
        "current_stage": session.stage,
        "questions": questions,
        "current_question_index": current_idx,
        "conversation_history": history,
        "last_answer_quality": "sufficient",
        "explicit_dont_know": False,
        "acknowledgment": "",
        "stage_time_expired": stage_expired,
        "next_agent_response": ""
    }

    final_state = interview_graph.invoke(initial_state)

    agent_reply = final_state.get("next_agent_response", "Thank you for your response.")
    new_stage = final_state.get("current_stage", session.stage)
    new_idx = final_state.get("current_question_index", current_idx)
    stage_changed = final_state.get("_stage_changed", False)

    updated_metadata = {
        "questions": questions,
        "current_question_index": new_idx,
    }

    if system_msg:
        system_msg.content = json.dumps(updated_metadata)
    else:
        db.add(Message(session_id=session_id, sender="system", content=json.dumps(updated_metadata), stage=session.stage))

    if new_stage == "closing" or new_idx >= len(questions):
        session.status = "completed"
        session.stage = "closing"
        session.ended_at = datetime.now(timezone.utc)
    else:
        session.stage = new_stage
        if stage_changed:
            session.current_stage_started_at = datetime.now(timezone.utc)

    db.add(Message(session_id=session_id, sender="agent", content=agent_reply, stage=session.stage))
    db.commit()
    db.refresh(session)

    return {
        "reply": agent_reply,
        "stage": session.stage,
        "status": session.status,
        "stage_started_at": session.current_stage_started_at.isoformat() if session.current_stage_started_at else None,
        "stage_time_limit_seconds": STAGE_TIME_LIMITS_SECONDS.get(session.stage),
    }