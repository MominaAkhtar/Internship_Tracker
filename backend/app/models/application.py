from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func

from app.core.database import Base


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    company_name = Column(String, nullable=False)
    position = Column(String, nullable=False)

    status = Column(String, nullable=False)

    notes = Column(Text)
    resume_version = Column(String)

    interview_date = Column(DateTime, nullable=True)

    reminder_sent = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())