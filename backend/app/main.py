import os
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

# Local imports
from app.database import engine, Base, get_db
# Assuming your models, schemas, and langgraph flow are defined in your app module:
from app.models import Complaint
# NEW (Line 12):
from app.services.ai_agent import run_investigation_graph

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Pharma AI Complaint Management API",
    description="Backend service powered by FastAPI, LangGraph, and Groq",
    version="1.0.0"
)

# Enable CORS for Vercel / External Frontend Access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows requests from Vercel deployment and local testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas for Request / Response
class ComplaintCreate(BaseModel):
    product_name: str
    batch_number: str
    description: str

class ComplaintResponse(BaseModel):
    id: int
    product_name: str
    batch_number: str
    description: str
    severity: Optional[str] = None
    root_cause: Optional[str] = None
    action_plan: Optional[str] = None
    status: Optional[str] = "Processed"

    class Config:
        from_attributes = True


@app.get("/")
def read_root():
    return {"message": "Pharma AI Complaint System Backend is Live!"}


@app.get("/api/v1/complaints", response_model=List[ComplaintResponse])
def get_all_complaints(db: Session = Depends(get_db)):
    """Fetch all logged complaint records from database"""
    try:
        complaints = db.query(Complaint).order_by(Complaint.id.desc()).all()
        return complaints
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )


@app.post("/api/v1/complaints/process", response_model=ComplaintResponse)
def process_complaint(payload: ComplaintCreate, db: Session = Depends(get_db)):
    """Run AI investigation via LangGraph/Groq and save result to database"""
    try:
        # 1. Trigger AI Root Cause Analysis pipeline
        ai_result = run_investigation_graph(
            product_name=payload.product_name,
            batch_number=payload.batch_number,
            description=payload.description
        )

        # 2. Extract results from AI pipeline (with safe fallbacks)
        severity = ai_result.get("severity", "Medium")
        root_cause = ai_result.get("root_cause", "Investigation incomplete")
        action_plan = ai_result.get("action_plan", "Pending QA Review")

        # 3. Save entry to database
        new_complaint = Complaint(
            product_name=payload.product_name,
            batch_number=payload.batch_number,
            description=payload.description,
            severity=severity,
            root_cause=root_cause,
            action_plan=action_plan,
            status="Completed"
        )
        
        db.add(new_complaint)
        db.commit()
        db.refresh(new_complaint)

        return new_complaint

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process complaint: {str(e)}"
        )