from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

from app.database import Base, engine, get_db
from app.models import Complaint
from app.schemas import ComplaintCreate, ComplaintResponse
from app.services.ai_agent import complaint_ai_workflow

app = FastAPI(title="AI Complaint Management API")

# Enable CORS for React frontend (allowing both localhost and 127.0.0.1)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auto-create DB tables
Base.metadata.create_all(bind=engine)

@app.get("/")
def home():
    return {"message": "Backend Running Successfully 🚀"}

# Endpoint 1: Process new complaint using AI & save to DB
@app.post("/api/v1/complaints/process", response_model=ComplaintResponse)
def process_complaint(data: ComplaintCreate, db: Session = Depends(get_db)):
    try:
        # 1. Run AI LangGraph Workflow
        ai_result = complaint_ai_workflow.invoke({
            "product_name": data.product_name,
            "description": data.description,
            "severity": "",
            "summary": "",
            "root_cause": ""
        })

        complaint_no = f"CMP-2026-{int(datetime.now().timestamp())}"

        # 2. Save into DB
        db_complaint = Complaint(
            complaint_number=complaint_no,
            product_name=data.product_name,
            batch_number=data.batch_number,
            description=data.description,
            severity=ai_result.get("severity"),
            ai_summary=ai_result.get("summary"),
            root_cause=ai_result.get("root_cause")
        )
        db.add(db_complaint)
        db.commit()
        db.refresh(db_complaint)

        # 3. Return response
        return {
            "status": "success",
            "complaint_number": complaint_no,
            "summary": ai_result.get("summary"),
            "severity": ai_result.get("severity"),
            "root_cause": ai_result.get("root_cause")
        }
    except Exception as e:
        db.rollback()
        print("\n" + "="*50)
        print("REAL PYTHON ERROR CATCH:")
        print(e)
        print("="*50 + "\n")
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint 2: Fetch all historical complaints for the React table
@app.get("/api/v1/complaints")
def get_all_complaints(db: Session = Depends(get_db)):
    complaints = db.query(Complaint).order_by(Complaint.created_at.desc()).all()
    return complaints