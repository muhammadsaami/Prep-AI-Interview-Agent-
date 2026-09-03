import os
import json
import re
from groq import Groq
from sqlalchemy.orm import Session
from backend.models import Message, FeedbackReport, InterviewSession

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def _extract_json(text: str) -> dict:
    text = text.strip()
    text = re.sub(r"^```(json)?", "", text)
    text = re.sub(r"```$", "", text)
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        raise ValueError("No JSON object found in LLM response.")
    return json.loads(match.group(0))


def generate_feedback_report(session_id: int, db: Session) -> FeedbackReport:
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise ValueError(f"Session with id {session_id} not found.")

    messages = (
        db.query(Message)
        .filter(Message.session_id == session_id)
        .order_by(Message.created_at.asc())
        .all()
    )
    if not messages:
        raise ValueError("No messages found for this session.")

    transcript = "\n".join(
        f"{'Interviewer' if m.sender == 'agent' else 'Candidate'}: {m.content}"
        for m in messages
    )

    prompt = f"""You are an expert technical interview coach. Analyze the following
mock interview transcript for the role "{session.target_role}" and produce a
feedback report as ONLY valid JSON (no extra text) with this exact structure:

{{
  "technical_score": <integer 0-100>,
  "communication_score": <integer 0-100>,
  "summary": "<2-3 sentence overall summary>",
  "improvement_areas": [
    {{
      "title": "<short issue title>",
      "description": "<1-2 sentence description of the gap>",
      "suggested_answer": "<a concise example of a better answer>",
      "severity": "<high|medium|low>"
    }}
  ]
}}

Include 3-5 improvement_areas. Be specific and reference actual moments from
the transcript where possible.

Transcript:
{transcript}
"""

    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4,
        )
        raw_output = response.choices[0].message.content
    except Exception as err:
        raise RuntimeError(f"Groq API error during feedback generation: {err}")

    try:
        parsed = _extract_json(raw_output)
    except (ValueError, json.JSONDecodeError) as err:
        raise ValueError(f"Failed to parse LLM feedback JSON: {err}")

    existing = db.query(FeedbackReport).filter(FeedbackReport.session_id == session_id).first()
    if existing:
        existing.technical_score = parsed.get("technical_score", 0)
        existing.communication_score = parsed.get("communication_score", 0)
        existing.summary = parsed.get("summary", "")
        existing.improvement_areas = parsed.get("improvement_areas", [])
        db.commit()
        db.refresh(existing)
        return existing

    report = FeedbackReport(
        session_id=session_id,
        technical_score=parsed.get("technical_score", 0),
        communication_score=parsed.get("communication_score", 0),
        summary=parsed.get("summary", ""),
        improvement_areas=parsed.get("improvement_areas", []),
    )
    db.add(report)
    session.status = "completed"
    db.commit()
    db.refresh(report)
    return report