# PrepWise AI – Version 1 (MVP)

An AI-powered **Voice Mock Interview Platform** that helps users prepare for interviews through personalized voice-based mock interviews.

## Features

- **Authentication** – Register, login, JWT-based sessions
- **Resume Upload** – PDF/DOCX parsing with skills, education, projects, experience extraction
- **Job Description** – Paste text or upload PDF
- **RAG Pipeline** – FAISS vector store with resume + JD context for personalized questions
- **Voice Interview** – AI speaks questions (TTS), user answers via microphone (STT), adaptive difficulty
- **Evaluation** – Scores on technical accuracy, communication, confidence, completeness
- **Final Report** – Overall score, strengths, weaknesses, learning recommendations, transcript
- **Resume Analysis** – Missing keywords, weak bullets, grammar, measurable impact, links
- **Learn Page** – Personalized learning cards with resources and mini quizzes
- **Practice Page** – AI-generated MCQs with easy/medium/hard difficulty

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, Vite, TypeScript, TailwindCSS, Framer Motion, React Router, Axios |
| Backend | FastAPI, LangChain, FAISS, SQLAlchemy, Pydantic, JWT |
| Database | SQLite |
| LLM | OpenAI (configurable) |
| Speech | OpenAI Whisper (STT), OpenAI TTS (abstracted services) |

## Project Structure

```
interviewer/
├── frontend/          # React + Vite app
├── backend/           # FastAPI app
├── uploads/           # Uploaded resumes and JDs
├── vector_store/      # FAISS indexes per user
├── data/              # SQLite database
└── docs/              # Documentation
```

## Prerequisites

- Python 3.10+
- Node.js 18+
- OpenAI API key (optional for development – mock services available)

## Installation

### Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env and set OPENAI_API_KEY
```

### Frontend

```bash
cd frontend
npm install
```

## Running the Application

### Start Backend (port 8000)

```bash
cd backend
venv\Scripts\activate        # Windows
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### Start Frontend (port 5173)

```bash
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Create account |
| POST | `/login` | Authenticate |
| POST | `/resume` | Upload resume |
| GET | `/resume/analysis` | Analyze resume |
| POST | `/job-description` | Upload/paste JD |
| POST | `/interview/start` | Start voice interview |
| POST | `/interview/answer` | Submit voice answer |
| GET | `/report/{id}` | Get interview report |
| GET | `/history` | Interview history |
| GET | `/dashboard` | Dashboard data |
| GET | `/learn` | Learning cards |
| POST | `/practice` | Generate MCQ quiz |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | — | OpenAI API key |
| `SECRET_KEY` | dev key | JWT signing secret |
| `LLM_MODEL` | gpt-4o-mini | LLM model |
| `EMBEDDING_MODEL` | text-embedding-3-small | Embedding model |
| `STT_PROVIDER` | openai | Speech-to-text provider |
| `TTS_PROVIDER` | openai | Text-to-speech provider |

## Voice Interview Flow

1. AI generates a contextual question using RAG (resume + JD)
2. Question is spoken via Text-to-Speech
3. User records answer through microphone
4. Speech-to-Text converts audio to text
5. LLM evaluates the answer and adjusts difficulty
6. AI speaks the next question
7. After all questions, a final report is generated

## License

Proprietary – PrepWise AI © 2026
