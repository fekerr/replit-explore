import os
import logging
import sys
from flask import Flask, render_template, request, jsonify, request_started, g
from code_executor import execute_python_code

# Configure more detailed logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

# Create Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "default_secret_key_for_development")

# Log all requests for debugging
@app.before_request
def log_request_info():
    logger.debug('Headers: %s', request.headers)
    logger.debug('Body: %s', request.get_data())
    logger.debug('Environment: %s', request.environ)

# Log all responses for debugging
@app.after_request
def log_response_info(response):
    logger.debug('Response Status: %s', response.status)
    logger.debug('Response Headers: %s', response.headers)
    return response

# Configure for Replit environment
app.config['PREFERRED_URL_SCHEME'] = 'https'

# Log all environment variables related to Replit
logger.debug("--- REPLIT ENVIRONMENT VARIABLES ---")
for key, value in os.environ.items():
    if 'REPL' in key:
        logger.debug(f"{key}: {value}")

@app.route('/')
def index():
    """Render the main page with the Python practice interface"""
    logger.debug('Rendering index.html')
    return render_template('index.html')

@app.route('/test')
def test():
    """Simple test page to verify server is running"""
    logger.debug('Rendering test.html')
    return render_template('test.html')

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
