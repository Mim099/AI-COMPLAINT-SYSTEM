import os
from typing import TypedDict
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langgraph.graph import StateGraph, END

load_dotenv()

# Define LangGraph State Schema
class ComplaintState(TypedDict):
    product_name: str
    description: str
    severity: str
    summary: str
    root_cause: str

# 1. Initialize Groq LLM with supported active model
llm = ChatGroq(
    model_name="llama-3.3-70b-versatile",
    temperature=0.2,
    groq_api_key=os.getenv("GROQ_API_KEY")
)

# 2. Node 1: Triage & Severity Classification
def triage_node(state: ComplaintState) -> ComplaintState:
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert Quality Assurance & Regulatory Compliance Specialist in the pharmaceutical industry."),
        ("user", "Analyze this product defect complaint for product '{product_name}':\n\nComplaint: {description}\n\nClassify the severity as 'High', 'Medium', or 'Low' based on patient risk and GMP compliance. Provide ONLY the severity level word (High, Medium, or Low).")
    ])
    
    chain = prompt | llm
    response = chain.invoke({
        "product_name": state["product_name"],
        "description": state["description"]
    })
    
    severity_text = response.content.strip()
    if "High" in severity_text:
        severity = "High"
    elif "Medium" in severity_text:
        severity = "Medium"
    else:
        severity = "Low"
        
    return {**state, "severity": severity}

# 3. Node 2: Concise Executive Summary
def summary_node(state: ComplaintState) -> ComplaintState:
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a Pharma Quality Management Systems (QMS) auditor."),
        ("user", "Summarize the following product defect complaint into a concise 2-sentence executive summary:\n\nProduct: {product_name}\nDefect: {description}")
    ])
    
    chain = prompt | llm
    response = chain.invoke({
        "product_name": state["product_name"],
        "description": state["description"]
    })
    
    return {**state, "summary": response.content.strip()}

# 4. Node 3: 5-Whys Root Cause Analysis (RCA)
def rca_node(state: ComplaintState) -> ComplaintState:
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a CAPA (Corrective and Preventive Action) Root Cause Specialist in pharmaceutical manufacturing."),
        ("user", "Perform a 5-Whys Root Cause Analysis (RCA) for this product complaint:\n\nProduct: {product_name}\nDefect Description: {description}\nSeverity: {severity}\n\nFormat the response clearly with steps: Why 1, Why 2, Why 3, Why 4, Why 5, and a brief Root Cause Conclusion.")
    ])
    
    chain = prompt | llm
    response = chain.invoke({
        "product_name": state["product_name"],
        "description": state["description"],
        "severity": state["severity"]
    })
    
    return {**state, "root_cause": response.content.strip()}

# 5. Build LangGraph Workflow
workflow = StateGraph(ComplaintState)

# Add Nodes
workflow.add_node("triage", triage_node)
workflow.add_node("summarize", summary_node)
workflow.add_node("rca", rca_node)

# Set Entry Point and Edges
workflow.set_entry_point("triage")
workflow.add_edge("triage", "summarize")
workflow.add_edge("summarize", "rca")
workflow.add_edge("rca", END)

# Compile Workflow
complaint_ai_workflow = workflow.compile()