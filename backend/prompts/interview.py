INTERVIEW_TYPES = {
    "technical": "Technical Interview",
    "behavioral": "Behavioral Interview",
    "projects": "Projects Interview",
    "hr": "HR Interview",
    "system_design": "System Design Interview",
}

GENERATE_QUESTION_PROMPT = """You are an expert interview coach conducting a {interview_type} mock interview.

Target Role: {role}

Retrieved Context (resume, job description, knowledge base):
{context}

Previous Q&A in this session:
{history}

Questions already asked (DO NOT repeat):
{previous_questions}

Current difficulty level: {difficulty}/5 (1=easy, 5=expert)

Generate the next interview question. Rules:
- MUST be grounded in the retrieved context above
- Never repeat a previous question
- For technical: focus on skills matching the JD and role
- For behavioral: use STAR method scenarios relevant to the role
- For projects: deep dive into specific projects from resume
- For HR: culture fit, career goals, motivation
- For system_design: scalability, trade-offs, architecture decisions
- Difficulty {difficulty}: 1-2 basic, 3 intermediate, 4-5 advanced deep-dive
- Ask intelligent follow-ups based on previous answers when applicable
- Ask only ONE clear, conversational question
- Do NOT include the answer

Return ONLY the question text."""

EVALUATE_ANSWER_PROMPT = """You are an expert interview evaluator.

Interview Type: {interview_type}
Question: {question}
Candidate Answer: {answer}

Retrieved Context:
{context}

Previous Evaluation History:
{evaluation_history}

Evaluate the answer on these criteria (score 0-100 each):
1. Technical Accuracy - correctness and depth
2. Communication - clarity, structure, articulation
3. Confidence - assertiveness without arrogance
4. Completeness - covers all aspects of the question

Also provide:
- Detailed feedback (2-3 sentences)
- An ideal answer summary (3-4 sentences)
- suggested_difficulty_change: -1 (weaker answer), 0 (same), 1 (strong answer)

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
  "strengths": ["<strength1>", "<strength2>"],
  "weaknesses": ["<weakness1>", "<weakness2>"],
  "topics_to_improve": ["<topic1>", "<topic2>"],
  "learning_recommendations": ["<rec1>", "<rec2>"]
}}"""

RESUME_ANALYSIS_PROMPT = """Analyze this resume against the job description and knowledge base context.

Resume:
{resume}

Job Description:
{jd}

Knowledge Base Context:
{kb_context}

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

LEARNING_CARDS_PROMPT = """Based on interview performance, resume gaps, and knowledge base context, generate personalized learning cards.

Weak topics: {weak_topics}
Resume skills: {skills}
JD requirements: {jd_snippet}
Knowledge Base Context: {kb_context}

Generate 5 learning cards in JSON array:
[
  {{
    "topic": "<topic name>",
    "reason": "<why this matters for the candidate>",
    "estimated_time": "<e.g. 2 weeks>",
    "resources": [{{"title": "<resource>", "url": "https://example.com", "type": "article"}}],
    "quiz": [{{"question": "<q>", "options": ["A","B","C","D"], "correct_index": 0}}]
  }}
]"""

PRACTICE_QUIZ_PROMPT = """Generate {num_questions} {quiz_type} questions on topic: {topic}
Difficulty: {difficulty}

Use this retrieved context as the primary knowledge source:
{context}

Return JSON array. Each question must include:
[
  {{
    "question": "<question text>",
    "question_type": "{quiz_type}",
    "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
    "correct_index": <0-3>,
    "correct_indices": [<for multiple correct>],
    "explanation": "<why correct>",
    "difficulty": "{difficulty}",
    "topic": "{topic}",
    "knowledge_source": "<source from context>"
  }}
]

Supported question_type values: mcq, multiple_correct, true_false, scenario, coding_theory
Do NOT repeat questions from previous sessions."""
