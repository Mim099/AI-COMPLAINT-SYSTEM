from pydantic import BaseModel
from typing import Optional

# Request schema for creating a new complaint
class ComplaintCreate(BaseModel):
    product_name: str
    batch_number: str
    description: str

# Response schema returned to the React frontend
class ComplaintResponse(BaseModel):
    status: str
    complaint_number: str
    summary: str
    severity: str
    root_cause: str

    class Config:
        from_attributes = True