from app import app
import os
import logging

if __name__ == "__main__":
    # Get port from environment variable or use 5000 as default
    port = int(os.environ.get("PORT", 5000))
    logging.debug(f"Starting app on port {port}")
    app.run(host="0.0.0.0", port=port, debug=True)
