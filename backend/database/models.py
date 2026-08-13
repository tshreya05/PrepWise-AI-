from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship

from database.db import Base


def utcnow():
    return datetime.now(timezone.utc)


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    raw_text = Column(Text, nullable=False)
    skills = Column(JSON, default=list)
    education = Column(JSON, default=list)
    projects = Column(JSON, default=list)
    experience = Column(JSON, default=list)
    analysis = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=utcnow)


class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    filename = Column(String(255), nullable=True)
    file_path = Column(String(500), nullable=True)
    raw_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=utcnow)


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    interview_type = Column(String(50), nullable=False)
    status = Column(String(50), default="in_progress")
    difficulty_level = Column(Integer, default=1)
    current_question_index = Column(Integer, default=0)
    total_questions = Column(Integer, default=5)
    overall_score = Column(Float, nullable=True)
    strengths = Column(JSON, default=list)
    weaknesses = Column(JSON, default=list)
    topics_to_improve = Column(JSON, default=list)
    learning_recommendations = Column(JSON, default=list)
    transcript = Column(JSON, default=list)
    report = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=utcnow)
    completed_at = Column(DateTime, nullable=True)

    questions = relationship("InterviewQuestion", back_populates="interview", cascade="all, delete-orphan")


class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id"), nullable=False)
    question_index = Column(Integer, nullable=False)
    question_text = Column(Text, nullable=False)
    answer_text = Column(Text, nullable=True)
    audio_path = Column(String(500), nullable=True)
    technical_accuracy = Column(Float, nullable=True)
    communication = Column(Float, nullable=True)
    confidence = Column(Float, nullable=True)
    completeness = Column(Float, nullable=True)
    feedback = Column(Text, nullable=True)
    ideal_answer = Column(Text, nullable=True)
    difficulty = Column(Integer, default=1)
    created_at = Column(DateTime, default=utcnow)

    interview = relationship("Interview", back_populates="questions")


class LearningCard(Base):
    __tablename__ = "learning_cards"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    topic = Column(String(255), nullable=False)
    reason = Column(Text, nullable=False)
    estimated_time = Column(String(50), nullable=False)
    resources = Column(JSON, default=list)
    quiz = Column(JSON, default=list)
    created_at = Column(DateTime, default=utcnow)


class PracticeQuiz(Base):
    __tablename__ = "practice_quizzes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    topic = Column(String(255), nullable=False)
    difficulty = Column(String(20), nullable=False)
    questions = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=utcnow)
