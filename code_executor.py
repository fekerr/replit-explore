import subprocess
import tempfile
import os
import logging
from io import StringIO
import sys
import traceback

def execute_python_code(code):
    """
    Execute Python code in a safe manner and return the output and any errors.
    
    Args:
        code (str): Python code to execute
        
    Returns:
        tuple: (output, error)
    """
    # For safety, we'll use a subprocess to execute the code
    # This provides better isolation than exec() or eval()
    
    # Create a temporary file to store the code
    with tempfile.NamedTemporaryFile(suffix='.py', delete=False) as temp_file:
        temp_filename = temp_file.name
        try:
            # Write the code to the temporary file
            temp_file.write(code.encode('utf-8'))
            temp_file.flush()
            
            # Execute the code as a subprocess with a timeout
            process = subprocess.Popen(
                [sys.executable, temp_filename],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            # Set a reasonable timeout (e.g., 5 seconds)
            try:
                stdout, stderr = process.communicate(timeout=5)
                return stdout, stderr
            except subprocess.TimeoutExpired:
                process.kill()
                return "", "Execution timed out after 5 seconds"
                
        except Exception as e:
            logging.error(f"Error executing code: {e}")
            return "", f"Error: {str(e)}"
        finally:
            # Clean up the temporary file
            try:
                os.unlink(temp_filename)
            except:
                pass
