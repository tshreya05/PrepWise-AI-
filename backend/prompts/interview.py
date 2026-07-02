INTERVIEW_TYPES = {
    "technical": "Technical Interview",
    "behavioral": "Behavioral Interview",
    "projects": "Projects Interview",
    "hr": "HR Interview",
}

GENERATE_QUESTION_PROMPT = """You are an expert interview coach conducting a {interview_type} mock interview.

Context from candidate's resume and job description:
{context}

Previous Q&A in this session:
{history}

Current difficulty level: {difficulty}/5 (1=easy, 5=expert)

Generate the next interview question. Rules:
- Question must be relevant to the retrieved context
- For technical: focus on skills matching the JD
- For behavioral: use STAR method scenarios
- For projects: ask about specific projects from resume
- For HR: culture fit, career goals, motivation
- Difficulty level determines complexity: 1-2 basic, 3 intermediate, 4-5 advanced deep-dive
- Ask only ONE clear question
- Be conversational and professional
- Do NOT include the answer

Return ONLY the question text, nothing else."""

EVALUATE_ANSWER_PROMPT = """You are an expert interview evaluator.

Interview Type: {interview_type}
Question: {question}
Candidate Answer: {answer}

Context from resume/JD:
{context}

Evaluate the answer on these criteria (score 0-100 each):
1. Technical Accuracy - correctness and depth of knowledge
2. Communication - clarity, structure, articulation
3. Confidence - assertiveness without arrogance
4. Completeness - covers all aspects of the question

Also provide:
- Detailed feedback (2-3 sentences)
- An ideal answer summary (3-4 sentences)

Respond in this exact JSON format:
{{
  "technical_accuracy": <float 0-100>,
  "communication": <float 0-100>,
  "confidence": <float 0-100>,
  "completeness": <float 0-100>,
  "feedback": "<string>",
  "ideal_answer": "<string>",
  "suggested_difficulty_change": <int -1, 0, or 1>
}}"""

FINAL_REPORT_PROMPT = """You are an expert interview coach generating a final interview report.

Interview Type: {interview_type}
All Q&A:
{qa_pairs}

Individual scores:
{scores}

Generate a comprehensive final report in JSON:
{{
  "overall_score": <float 0-100>,
  "strengths": ["<strength1>", "<strength2>", ...],
  "weaknesses": ["<weakness1>", "<weakness2>", ...],
  "topics_to_improve": ["<topic1>", "<topic2>", ...],
  "learning_recommendations": ["<rec1>", "<rec2>", ...]
}}"""

RESUME_ANALYSIS_PROMPT = """Analyze this resume against the job description (if provided).

Resume:
{resume}

Job Description:
{jd}

Provide analysis in JSON:
{{
  "missing_keywords": ["keywords from JD missing in resume"],
  "weak_bullet_points": ["specific weak bullets with suggestions"],
  "grammar_suggestions": ["grammar improvements"],
  "missing_measurable_impact": ["bullets lacking metrics/impact"],
  "missing_links": ["missing GitHub/Portfolio/LinkedIn links"],
  "overall_score": <float 0-100>,
  "summary": "<2-3 sentence summary>"
}}"""

LEARNING_CARDS_PROMPT = """Based on interview performance and resume gaps, generate personalized learning cards.

Weak topics: {weak_topics}
Resume skills: {skills}
JD requirements: {jd_snippet}

Generate 5 learning cards in JSON array:
[
  {{
    "topic": "<topic name>",
    "reason": "<why this matters for the candidate>",
    "estimated_time": "<e.g. 2 weeks>",
    "resources": [{{"title": "<resource>", "url": "https://example.com", "type": "article"}}],
    "quiz": [{{"question": "<q>", "options": ["A","B","C","D"], "correct": 0}}]
  }}
]"""

PRACTICE_QUIZ_PROMPT = """Generate {num_questions} multiple choice questions on topic: {topic}
Difficulty: {difficulty}

Return JSON array:
[
  {{
    "question": "<question text>",
    "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
    "correct_index": <0-3>,
    "explanation": "<why correct>"
  }}
]"""
