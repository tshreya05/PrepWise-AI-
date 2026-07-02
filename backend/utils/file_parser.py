import re
from pathlib import Path
from typing import Any

from docx import Document
from pypdf import PdfReader

from utils.logging_config import get_logger

logger = get_logger(__name__)


def extract_text_from_pdf(file_path: str) -> str:
    reader = PdfReader(file_path)
    pages = [page.extract_text() or "" for page in reader.pages]
    return "\n".join(pages).strip()


def extract_text_from_docx(file_path: str) -> str:
    doc = Document(file_path)
    return "\n".join(p.text for p in doc.paragraphs if p.text.strip()).strip()


def extract_text_from_file(file_path: str) -> str:
    path = Path(file_path)
    suffix = path.suffix.lower()
    if suffix == ".pdf":
        return extract_text_from_pdf(file_path)
    if suffix in (".docx", ".doc"):
        return extract_text_from_docx(file_path)
    if suffix == ".txt":
        return path.read_text(encoding="utf-8", errors="ignore").strip()
    raise ValueError(f"Unsupported file type: {suffix}")


def parse_resume_sections(text: str) -> dict[str, Any]:
    """Extract structured resume sections from raw text."""
    sections: dict[str, Any] = {
        "skills": [],
        "education": [],
        "projects": [],
        "experience": [],
        "raw_text": text,
    }

    skill_patterns = [
        r"(?i)(?:skills|technical skills|core competencies)[:\s]*(.+?)(?:\n\n|\n[A-Z])",
        r"(?i)(?:proficient in|expertise in)[:\s]*(.+)",
    ]
    for pattern in skill_patterns:
        match = re.search(pattern, text, re.DOTALL)
        if match:
            skills_text = match.group(1)
            skills = re.split(r"[,;•|\n]", skills_text)
            sections["skills"] = [s.strip() for s in skills if s.strip() and len(s.strip()) > 1]
            break

    edu_pattern = r"(?i)(?:education|academic)[:\s]*(.+?)(?:\n\n|\n(?:experience|projects|skills))"
    edu_match = re.search(edu_pattern, text, re.DOTALL)
    if edu_match:
        edu_lines = [l.strip() for l in edu_match.group(1).split("\n") if l.strip()]
        sections["education"] = edu_lines[:10]

    exp_pattern = r"(?i)(?:experience|work experience|employment)[:\s]*(.+?)(?:\n\n|\n(?:projects|education|skills))"
    exp_match = re.search(exp_pattern, text, re.DOTALL)
    if exp_match:
        exp_lines = [l.strip() for l in exp_match.group(1).split("\n") if l.strip()]
        sections["experience"] = exp_lines[:20]

    proj_pattern = r"(?i)(?:projects|personal projects)[:\s]*(.+?)(?:\n\n|\n(?:education|experience|skills))"
    proj_match = re.search(proj_pattern, text, re.DOTALL)
    if proj_match:
        proj_lines = [l.strip() for l in proj_match.group(1).split("\n") if l.strip()]
        sections["projects"] = proj_lines[:15]

    if not sections["skills"]:
        common_skills = [
            "Python", "Java", "JavaScript", "TypeScript", "React", "Node.js",
            "SQL", "AWS", "Docker", "Kubernetes", "FastAPI", "Django",
            "Machine Learning", "Data Science", "Git", "REST API", "GraphQL",
            "MongoDB", "PostgreSQL", "Redis", "CI/CD", "Agile", "Scrum",
        ]
        found = [s for s in common_skills if s.lower() in text.lower()]
        sections["skills"] = found

    return sections
