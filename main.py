from app import app
import os
import logging
import sys

# Set up more detailed logging for main.py
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s [%(levelname)s] [main.py] %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    # Get port from environment variable or use 5000 as default
    port = int(os.environ.get("PORT", 5000))
    
    # Log important information
    logger.debug("======= APPLICATION STARTUP =======")
    logger.debug(f"Starting app on host=0.0.0.0, port={port}, debug=True")
    logger.debug(f"Python version: {sys.version}")
    
    # Log all environment variables
    logger.debug("--- ENVIRONMENT VARIABLES ---")
    for key, value in sorted(os.environ.items()):
        logger.debug(f"{key}: {value}")
    
    # Run the application
    app.run(host="0.0.0.0", port=port, debug=True)
