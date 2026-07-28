from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from app.database import Base

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    complaint_number = Column(String, unique=True, index=True)
    product_name = Column(String, nullable=False)
    batch_number = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String, nullable=True)
    ai_summary = Column(Text, nullable=True)
    root_cause = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)