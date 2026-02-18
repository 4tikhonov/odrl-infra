import subprocess
import json
from fastapi import HTTPException

def run_oydid_command(args, input_data=None):
    """Helper to run oydid commands"""
    cmd = ["oydid"] + args
    
    input_str = None
    if input_data:
        if isinstance(input_data, dict):
            input_str = json.dumps(input_data)
        else:
            input_str = str(input_data)

    try:
        process = subprocess.run(
            cmd,
            input=input_str,
            capture_output=True,
            text=True
        )
        return process
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Command execution failed: {str(e)}")
