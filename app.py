import os
import logging
from flask import Flask, render_template, request, jsonify
from code_executor import execute_python_code

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Create Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "default_secret_key_for_development")

@app.route('/')
def index():
    """Render the main page with the Python practice interface"""
    return render_template('index.html')

@app.route('/execute', methods=['POST'])
def execute():
    """Execute Python code and return the result"""
    code = request.json.get('code', '')
    
    if not code:
        return jsonify({'output': '', 'error': 'No code provided'})
    
    # Execute the Python code
    output, error = execute_python_code(code)
    
    return jsonify({
        'output': output,
        'error': error
    })

@app.errorhandler(404)
def page_not_found(e):
    """Handle 404 errors"""
    return render_template('index.html'), 404

@app.errorhandler(500)
def server_error(e):
    """Handle 500 errors"""
    logging.error(f"Server error: {e}")
    return jsonify({'output': '', 'error': 'Internal server error'}), 500
