import json
import re
from typing import List, Dict, Any, Optional, Literal
from groq import Groq
from app.core.config import settings
from app.models.question import (
    MCQuestion,
    FillBlankQuestion,
    ShortQuestion,
    LongQuestion,
    GeneratedQuestions,
)
from app.services.rag_service import search_similar_chunks

# Lazy initialization of Groq client
_groq_client = None


def get_groq_client():
    """Get or initialize the Groq client."""
    global _groq_client
    if _groq_client is None:
        if not settings.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY is not set in environment variables")
        _groq_client = Groq(api_key=settings.GROQ_API_KEY)
    return _groq_client


def build_difficulty_guidance(difficulty: Literal["easy", "medium", "hard"]) -> str:
    """Get difficulty-specific guidance for question generation."""
    guidance = {
        "easy": "Focus on fundamental concepts, definitions, and basic understanding. Questions should be straightforward and test recall.",
        "medium": "Include a mix of conceptual understanding and application. Some questions should require critical thinking while others test foundational knowledge.",
        "hard": "Focus on complex problem-solving, analysis, and synthesis. Questions should test deep understanding and the ability to apply concepts in novel scenarios.",
    }
    return guidance.get(difficulty, guidance["medium"])


def build_system_prompt(
    subject_name: str,
    units: List[int],
    difficulty: str,
    custom_instructions: Optional[str] = None,
    context: str = "",
) -> str:
    """Build the system prompt for question generation."""

    unit_str = ", ".join(f"Unit {u}" for u in units)

    valid_difficulty: Literal["easy", "medium", "hard"] = "medium"
    if difficulty in ["easy", "medium", "hard"]:
        valid_difficulty = difficulty  # type: ignore

    difficulty_guidance = build_difficulty_guidance(valid_difficulty)

    prompt = f"""You are an expert question paper generator for educational institutions. Your task is to create high-quality, relevant examination questions.

SUBJECT: {subject_name}
UNITS: {unit_str}
DIFFICULTY: {difficulty.upper()}

Difficulty Guidelines: {difficulty_guidance}

{"REFERENCE CONTENT: " + context if context else ""}

{f"ADDITIONAL INSTRUCTIONS: {custom_instructions}" if custom_instructions else ""}

IMPORTANT REQUIREMENTS:
1. All questions MUST be based on the provided reference content above
2. Questions should test understanding, not just recall (unless difficulty is "easy")
3. Ensure questions are clear, unambiguous, and academically appropriate
4. Distribute questions proportionally across the selected units
5. Avoid creating repetitive or similar questions
6. Output MUST be valid JSON only, no markdown formatting
7. For MCQs: provide 4 distinct options (a, b, c, d) with only one correct answer
8. For fill-in-the-blanks: use exactly one blank (___) per question
9. For short answers: provide 3-5 key points expected in the answer
10. For long answers: provide 6-10 key points expected in the answer

Return ONLY a valid JSON object with this exact structure:
{{
    "mcqs": [
        {{
            "question": "question text here",
            "options": ["option a", "option b", "option c", "option d"],
            "correct_answer": "the correct option text",
            "explanation": "brief explanation of why this is correct",
            "unit": {units[0] if units else 1}
        }}
    ],
    "fill_blanks": [
        {{
            "question": "The ___ is a key concept in...",
            "answer": "answer text",
            "unit": {units[0] if units else 1}
        }}
    ],
    "short": [
        {{
            "question": "Explain the concept of...",
            "expected_points": ["point 1", "point 2", "point 3"],
            "marks": 3,
            "unit": {units[0] if units else 1}
        }}
    ],
    "long": [
        {{
            "question": "Discuss in detail the...",
            "expected_points": ["point 1", "point 2", "point 3", "point 4", "point 5"],
            "marks": 10,
            "unit": {units[0] if units else 1}
        }}
    ]
}}"""

    return prompt


def build_context_from_chunks(
    chunks: List[Dict[str, Any]], max_context_length: int = 8000
) -> str:
    """Build context string from retrieved chunks."""
    if not chunks:
        return ""

    # Sort chunks by similarity and combine them
    sorted_chunks = sorted(chunks, key=lambda x: x.get("similarity", 0), reverse=True)

    context_parts = []
    total_length = 0

    for chunk in sorted_chunks:
        content = chunk.get("content", "")
        metadata = chunk.get("metadata", {})
        unit = metadata.get("unit", "Unknown")

        chunk_text = f"[Unit {unit}] {content}"

        if total_length + len(chunk_text) > max_context_length:
            # Truncate the last chunk if needed
            remaining = max_context_length - total_length
            if remaining > 100:  # Only add if we have meaningful space
                context_parts.append(chunk_text[:remaining] + "...")
            break

        context_parts.append(chunk_text)
        total_length += len(chunk_text)

    return "\n\n".join(context_parts)


def clean_json_response(response_text: str) -> str:
    """Clean and extract JSON from LLM response."""
    # Remove markdown code blocks if present
    response_text = response_text.strip()
    if response_text.startswith("```json"):
        response_text = response_text[7:]
    elif response_text.startswith("```"):
        response_text = response_text[3:]
    if response_text.endswith("```"):
        response_text = response_text[:-3]

    response_text = response_text.strip()

    # Try to extract JSON object using regex
    json_match = re.search(r"\{[\s\S]*\}", response_text)
    if json_match:
        response_text = json_match.group(0)

    return response_text


async def generate_mcqs(
    count: int,
    subject_name: str,
    units: List[int],
    difficulty: str,
    context: str,
    custom_instructions: Optional[str] = None,
) -> List[MCQuestion]:
    """Generate multiple choice questions."""
    if count <= 0:
        return []

    prompt = build_system_prompt(
        subject_name, units, difficulty, custom_instructions, context
    )
    prompt += f"\n\nGenerate exactly {count} multiple choice questions in the 'mcqs' array. Other arrays should be empty."

    client = get_groq_client()

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert educational question generator. Always output valid JSON only.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=4000,
            response_format={"type": "json_object"},
        )

        response_text = response.choices[0].message.content or ""
        cleaned_response = clean_json_response(response_text)
        data = json.loads(cleaned_response)

        mcqs = []
        for item in data.get("mcqs", []):
            # Ensure we have exactly 4 options
            if len(item.get("options", [])) == 4:
                mcqs.append(MCQuestion(**item))

        return mcqs[:count]

    except Exception as e:
        print(f"Error generating MCQs: {e}")
        return []


async def generate_fill_blanks(
    count: int,
    subject_name: str,
    units: List[int],
    difficulty: str,
    context: str,
    custom_instructions: Optional[str] = None,
) -> List[FillBlankQuestion]:
    """Generate fill in the blanks questions."""
    if count <= 0:
        return []

    prompt = build_system_prompt(
        subject_name, units, difficulty, custom_instructions, context
    )
    prompt += f"\n\nGenerate exactly {count} fill in the blank questions in the 'fill_blanks' array. Other arrays should be empty."

    client = get_groq_client()

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert educational question generator. Always output valid JSON only.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=2000,
            response_format={"type": "json_object"},
        )

        response_text = response.choices[0].message.content or ""
        cleaned_response = clean_json_response(response_text)
        data = json.loads(cleaned_response)

        blanks = []
        for item in data.get("fill_blanks", []):
            blanks.append(FillBlankQuestion(**item))

        return blanks[:count]

    except Exception as e:
        print(f"Error generating fill blanks: {e}")
        return []


async def generate_short_questions(
    count: int,
    subject_name: str,
    units: List[int],
    difficulty: str,
    context: str,
    custom_instructions: Optional[str] = None,
) -> List[ShortQuestion]:
    """Generate short answer questions."""
    if count <= 0:
        return []

    prompt = build_system_prompt(
        subject_name, units, difficulty, custom_instructions, context
    )
    prompt += f"\n\nGenerate exactly {count} short answer questions in the 'short' array. Each should have 3-5 marks and 3-5 expected points. Other arrays should be empty."

    client = get_groq_client()

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert educational question generator. Always output valid JSON only.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=3000,
            response_format={"type": "json_object"},
        )

        response_text = response.choices[0].message.content or ""
        cleaned_response = clean_json_response(response_text)
        data = json.loads(cleaned_response)

        shorts = []
        for item in data.get("short", []):
            shorts.append(ShortQuestion(**item))

        return shorts[:count]

    except Exception as e:
        print(f"Error generating short questions: {e}")
        return []


async def generate_long_questions(
    count: int,
    subject_name: str,
    units: List[int],
    difficulty: str,
    context: str,
    custom_instructions: Optional[str] = None,
) -> List[LongQuestion]:
    """Generate long answer questions."""
    if count <= 0:
        return []

    prompt = build_system_prompt(
        subject_name, units, difficulty, custom_instructions, context
    )
    prompt += f"\n\nGenerate exactly {count} long answer questions in the 'long' array. Each should have 10 marks and 6-10 expected points. Other arrays should be empty."

    client = get_groq_client()

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert educational question generator. Always output valid JSON only.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=3000,
            response_format={"type": "json_object"},
        )

        response_text = response.choices[0].message.content or ""
        cleaned_response = clean_json_response(response_text)
        data = json.loads(cleaned_response)

        longs = []
        for item in data.get("long", []):
            longs.append(LongQuestion(**item))

        return longs[:count]

    except Exception as e:
        print(f"Error generating long questions: {e}")
        return []


async def generate_questions(
    subject_id: str,
    subject_name: str,
    units: List[int],
    difficulty: str,
    question_config: Dict[str, int],
    custom_instructions: Optional[str] = None,
) -> GeneratedQuestions:
    """
    Main function to generate all types of questions for a paper.

    Args:
        subject_id: ID of the subject
        subject_name: Name of the subject
        units: List of unit numbers to generate questions from
        difficulty: Difficulty level (easy, medium, hard)
        question_config: Dict with mcq, fill_blanks, short, long counts
        custom_instructions: Optional custom instructions

    Returns:
        GeneratedQuestions object with all generated questions
    """

    # Build search query for RAG
    search_query = f"key concepts definitions important topics from {subject_name}"
    context = ""

    try:
        # Retrieve relevant chunks using RAG
        chunks = await search_similar_chunks(
            query=search_query, subject_id=subject_id, limit=20, threshold=0.3
        )

        if chunks:
            context = build_context_from_chunks(chunks)
            print(f"Retrieved {len(chunks)} chunks, context length: {len(context)}")
        else:
            print(
                f"No chunks found for subject {subject_id}, proceeding without context"
            )

    except Exception as e:
        print(f"Error retrieving context via RAG: {e}")
        print("Proceeding without RAG context")

    # Generate all question types concurrently
    import asyncio

    mcq_count = question_config.get("mcq", 0)
    fill_blanks_count = question_config.get("fill_blanks", 0)
    short_count = question_config.get("short", 0)
    long_count = question_config.get("long", 0)

    results = await asyncio.gather(
        generate_mcqs(
            mcq_count, subject_name, units, difficulty, context, custom_instructions
        ),
        generate_fill_blanks(
            fill_blanks_count,
            subject_name,
            units,
            difficulty,
            context,
            custom_instructions,
        ),
        generate_short_questions(
            short_count, subject_name, units, difficulty, context, custom_instructions
        ),
        generate_long_questions(
            long_count, subject_name, units, difficulty, context, custom_instructions
        ),
        return_exceptions=True,
    )

    # Handle results (some may be exceptions)
    mcqs = results[0] if not isinstance(results[0], Exception) else []
    fill_blanks = results[1] if not isinstance(results[1], Exception) else []
    shorts = results[2] if not isinstance(results[2], Exception) else []
    longs = results[3] if not isinstance(results[3], Exception) else []

    return GeneratedQuestions(
        mcqs=mcqs,  # type: ignore
        fill_blanks=fill_blanks,  # type: ignore
        short=shorts,  # type: ignore
        long=longs,  # type: ignore
    )
