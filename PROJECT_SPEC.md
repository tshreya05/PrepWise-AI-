# CURSOR RULES

This document is the single source of truth.

You must obey every requirement in this file.

Do not ask the user what to build next.

Build the application incrementally.

Fix bugs immediately.

Never generate placeholder code.

Never skip features.

Do not change architecture without updating this document.

Always keep the project production-ready.

Every feature should be fully functional before moving to the next one.

The project should look like a commercial SaaS application.

The interview must always be voice-based.

When the entire specification is completed, perform a complete project review and fix remaining issues automatically.

# PrepWise AI – Version 1 (MVP)

## ROLE

You are a Senior Full Stack AI Engineer.

Build this project **inside my currently opened workspace**.
Do NOT create another root folder.
Do NOT ask for the next step unless you are blocked.
Build one module at a time, verify it works, then continue.

---

# PROJECT

**PrepWise AI**

An AI-powered **Voice Mock Interview Platform** that helps users:

- Upload a Resume
- Upload a Job Description
- Conduct a personalized **voice interview** (NOT text chat)
- Evaluate answers
- Suggest resume improvements
- Recommend what to learn next

This is Version 1 only. Do NOT build advanced multi-agent features yet.

---

# TECH STACK

Frontend
- React + Vite
- TailwindCSS
- shadcn/ui
- Framer Motion
- React Router
- Axios

Backend
- FastAPI
- LangChain
- FAISS
- Pydantic
- SQLAlchemy
- JWT Authentication

Database
- SQLite

LLM
- Configurable (OpenAI)

Embeddings
- text-embedding-3-small (configurable)

Speech

IMPORTANT:
This is a **VOICE INTERVIEW**.

Use:

Speech-to-Text
Text-to-Speech

Create abstraction classes:

backend/services/stt_service.py
backend/services/tts_service.py

The rest of the application must never depend on a specific provider.

---

# FOLDER STRUCTURE

frontend/
backend/
uploads/
vector_store/
data/
docs/

Backend folders:

api/
services/
rag/
database/
models/
schemas/
utils/
prompts/

---

# FEATURES

## Authentication

- Register
- Login
- JWT

---

## Dashboard

Show:

Resume uploaded

JD uploaded

Interview history

Resume analysis

Start Interview

Learn

Practice

---

## Resume Upload

Support:

PDF

DOCX

Extract:

Skills

Education

Projects

Experience

Store extracted text.

---

## Job Description Upload

Paste text

OR

Upload PDF

Store extracted text.

---

# RAG

Use ONLY

Resume

Job Description

Flow

Documents

↓

Chunk

↓

Embeddings

↓

FAISS

↓

Retriever

↓

LLM

Questions must always use retrieved context.

---

# VOICE INTERVIEW

NO text chatting.

Flow

AI speaks question

↓

User answers using microphone

↓

Speech-to-Text

↓

LLM Evaluation

↓

AI speaks next question

Interface should resemble a modern AI voice assistant with waveform, timer, transcript, and controls.

---

# INTERVIEW TYPES

Technical

Behavioral

Projects

HR

---

# ADAPTIVE QUESTIONS

Increase difficulty if answers are good.
Ask simpler follow-up questions if answers are weak.

---

# EVALUATION

Score:

Technical Accuracy

Communication

Confidence

Completeness

Provide written feedback and ideal answer summary.

---

# FINAL REPORT

Overall Score

Strengths

Weaknesses

Topics to Improve

Learning Recommendations

Interview Transcript

---

# RESUME ANALYSIS

Highlight:

Missing keywords

Weak bullet points

Grammar suggestions

Missing measurable impact

Missing links (GitHub/Portfolio)

---

# LEARN PAGE

Generate personalized learning cards.

Each card contains:

Topic

Reason it matters

Estimated learning time

Suggested resources placeholder

Mini quiz placeholder

---

# PRACTICE PAGE

Generate AI MCQs on weak topics.

Difficulty:

Easy

Medium

Hard

---

# FRONTEND

Dark theme

Glassmorphism

Responsive

Modern animations

Pages:

Landing

Login

Register

Dashboard

Interview

Resume Analysis

Learn

Practice

History

Report

Use reusable components.

---

# API

POST /register

POST /login

POST /resume

POST /job-description

POST /interview/start

POST /interview/answer

GET /report/{id}

GET /history

---

# DEVELOPMENT RULES

1. Build backend first.
2. Test endpoints.
3. Build frontend.
4. Connect frontend.
5. Fix bugs immediately.
6. Never leave TODO placeholders.
7. Use clean architecture.
8. Use environment variables.
9. Add logging.
10. Comment important logic.

When finished, generate a README with installation and run commands.
