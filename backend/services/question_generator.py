import os
import json
import re
from difflib import SequenceMatcher
from groq import Groq


def _is_similar(a: str, b: str, threshold: float = 0.75) -> bool:
    """Returns True if two question strings are near-duplicates of each other."""
    return SequenceMatcher(None, a.lower().strip(), b.lower().strip()).ratio() >= threshold


def clean_and_parse_questions_json(content: str) -> list[dict]:
    """
    Safely parse and normalize the LLM response into a list of question dictionaries.
    Also removes near-duplicate questions so the candidate never gets asked
    the same thing twice in different wording.
    """
    cleaned = re.sub(r"^```(?:json)?\s*", "", content, flags=re.MULTILINE)
    cleaned = re.sub(r"\s*```$", "", cleaned, flags=re.MULTILINE).strip()

    data = None
    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError:
        match_arr = re.search(r"\[.*\]", content, re.DOTALL)
        if match_arr:
            try:
                data = json.loads(match_arr.group(0))
            except json.JSONDecodeError:
                pass

        if data is None:
            match_obj = re.search(r"\{.*\}", content, re.DOTALL)
            if match_obj:
                try:
                    data = json.loads(match_obj.group(0))
                except json.JSONDecodeError as err:
                    raise ValueError(f"Failed to decode LLM response into valid JSON: {str(err)}")
            else:
                raise ValueError("LLM response did not contain a valid JSON object or array.")

    if isinstance(data, dict):
        data = data.get("questions", [])

    if not isinstance(data, list):
        raise ValueError("Parsed questions response must be a list of question items.")

    valid_types = {"technical", "behavioral", "resume-specific"}
    valid_difficulties = {"easy", "medium", "hard"}

    normalized = []
    for item in data:
        if not isinstance(item, dict):
            continue

        q_text = str(item.get("question", "")).strip()
        q_type = str(item.get("type", "technical")).lower().strip()
        q_diff = str(item.get("difficulty", "medium")).lower().strip()

        if not q_text:
            continue
        if q_type not in valid_types:
            q_type = "technical"
        if q_diff not in valid_difficulties:
            q_diff = "medium"

        # Skip this question if it's a near-duplicate of one we already kept
        is_duplicate = any(_is_similar(q_text, existing["question"]) for existing in normalized)
        if is_duplicate:
            continue

        normalized.append({
            "question": q_text,
            "type": q_type,
            "difficulty": q_diff
        })

    if not normalized:
        raise ValueError("No valid questions could be extracted from LLM response.")

    return normalized


def generate_interview_questions(parsed_resume_json: dict, target_role: str) -> list[dict]:
    """
    Generate 8-10 tailored interview questions based on candidate resume data and target role
    using Groq LLM (openai/gpt-oss-120b).
    """
    if not target_role or not target_role.strip():
        raise ValueError("Target role cannot be empty.")

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY environment variable is missing or empty.")

    client = Groq(api_key=api_key)

    resume_data = parsed_resume_json if isinstance(parsed_resume_json, dict) else {}
    skills = resume_data.get("skills", [])
    projects = resume_data.get("projects", [])
    years_exp = resume_data.get("years_of_experience", 0)
    candidate_name = resume_data.get("name", "Candidate")

    prompt = f"""You are an expert technical interviewer creating a customized interview question set.

Target Role: {target_role.strip()}
Candidate Name: {candidate_name}
Years of Experience: {years_exp}
Listed Skills: {json.dumps(skills)}
Projects: {json.dumps(projects)}

Task:
Generate 8 to 10 interview questions tailored specifically for this candidate and target role.

Requirements:
- Include "technical" questions testing their listed skills.
- Include "resume-specific" questions asking about their actual projects.
- Include "behavioral" questions relevant to the target role ({target_role}).
- Assign difficulty level to each question: "easy", "medium", or "hard".
- Ensure no two questions test the same specific concept or overlap significantly in topic or wording.
- Return ONLY a valid JSON object containing a "questions" key with an array of objects.

JSON Output Format:
{{
  "questions": [
    {{
      "question": "Question string",
      "type": "technical",
      "difficulty": "medium"
    }},
    {{
      "question": "Question string",
      "type": "resume-specific",
      "difficulty": "hard"
    }},
    {{
      "question": "Question string",
      "type": "behavioral",
      "difficulty": "easy"
    }}
  ]
}}
"""

    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional hiring manager that generates precise structured JSON interview questions."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )

        content = response.choices[0].message.content.strip()
    except Exception as e:
        raise RuntimeError(f"Groq API error during question generation: {str(e)}")

    return clean_and_parse_questions_json(content)