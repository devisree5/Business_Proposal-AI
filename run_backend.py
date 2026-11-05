import sys
import os
import uvicorn

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

if __name__ == "__main__":
    print("Starting Nexura Sales AI Backend on http://localhost:8000 ...")
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
