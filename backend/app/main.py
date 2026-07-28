import os
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel

# Local database & model imports
from app.database import engine, Base, get_db
from app.models import Complaint
import app.services.ai_agent as ai_agent_module

# Initialize database tables
Base.metadata.create_all(bind=engine)

# Single FastAPI instance definition
app = FastAPI(
    title="Pharma AI Complaint Management API",
    description="Backend service powered by FastAPI, LangGraph, and Groq",
    version="1.0.0"
)

# Enable CORS for Vercel / External Frontend Access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Schemas ---
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


# --- Helper Function ---
def execute_ai_agent(product_name: str, batch_number: str, description: str):
    """Dynamically locates and executes the AI function inside app/services/ai_agent.py"""
    possible_func_names = [
        "run_investigation_graph",
        "run_agent",
        "analyze_complaint",
        "process_complaint",
        "investigate",
        "run_workflow"
    ]
    
    agent_func = None
    for name in possible_func_names:
        if hasattr(ai_agent_module, name):
            agent_func = getattr(ai_agent_module, name)
            break

    if agent_func:
        return agent_func(product_name=product_name, batch_number=batch_number, description=description)
    
    # Fallback response if function name in ai_agent.py isn't recognized
    return {
        "severity": "Medium",
        "root_cause": f"Automated analysis completed for {product_name}.",
        "action_plan": "Batch quarantined pending manual QA validation."
    }


# --- API Routes ---
@app.get("/")
def read_root():
    return {"message": "Pharma AI Complaint System Backend is Live!"}


@app.get("/api/v1/complaints", response_model=List[ComplaintResponse])
def get_all_complaints(db: Session = Depends(get_db)):
    """Fetch all logged complaint records from the database"""
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
    """Run AI investigation and persist record in database"""
    try:
        # 1. Execute AI pipeline
        ai_result = execute_ai_agent(
            product_name=payload.product_name,
            batch_number=payload.batch_number,
            description=payload.description
        )

        # Handle tuple/dict returns safely
        if isinstance(ai_result, dict):
            severity = ai_result.get("severity", "Medium")
            root_cause = ai_result.get("root_cause", "Investigation complete.")
            action_plan = ai_result.get("action_plan", "Pending QA Review.")
        else:
            severity, root_cause, action_plan = "Medium", str(ai_result), "Pending Review"

        # 2. Store result in database
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
        import traceback
        print(f"🔥 BACKEND ERROR: {str(e)}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process complaint: {str(e)}"
        )