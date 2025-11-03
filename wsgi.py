import os
from dotenv import load_dotenv

load_dotenv()

# Import your Flask app
from app import app, socketio

if __name__ == "__main__":
    socketio.run(app, debug=False)
