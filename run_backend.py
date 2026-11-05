import sys
import os
import uvicorn

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    is_dev = os.environ.get("ENVIRONMENT", "development") == "development"
    print(f"Starting ProposalGen AI Backend on http://0.0.0.0:{port} ...")
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=port, reload=is_dev)
