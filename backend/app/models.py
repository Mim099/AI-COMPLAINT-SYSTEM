from sqlalchemy import Column, Integer, String, Text
from app.database import Base


class Complaint(Base):
  __tablename__ = "complaints"

  id = Column(Integer, primary_key=True, index=True)
  product_name = Column(String, nullable=False)
  batch_number = Column(String, nullable=False)
  description = Column(Text, nullable=False)
  severity = Column(String, nullable=True)
  root_cause = Column(Text, nullable=True)
  action_plan = Column(
      Text, nullable=True
  )  # <--- Add or fix this column name!
  status = Column(String, default="Processed")