from app.services.ai_agent import complaint_ai_workflow

try:
    res = complaint_ai_workflow.invoke({
        "product_name": "Test Med",
        "description": "Packaging broken",
        "severity": "",
        "summary": "",
        "root_cause": ""
    })
    print(" AI WORKFLOW SUCCESS! Output:")
    print(res)
except Exception as e:
    print("❌ AI WORKFLOW FAILED! Reason:")
    print(e)