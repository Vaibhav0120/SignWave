import subprocess
import os
from flask import Flask, jsonify
from flask_cors import CORS
import logging
import signal

app = Flask(__name__)
CORS(app)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variable to store the subprocess
global_process = None

@app.route('/start-translation', methods=['POST'])
def start_translation():
    global global_process
    logger.info("Received request to start translation")
    try:
        if global_process is None or global_process.poll() is not None:
            # Get the directory of the current script
            current_dir = os.path.dirname(os.path.abspath(__file__))
            # Construct the path to final_pred.py
            final_pred_path = os.path.join(current_dir, 'final_pred.py')
            
            # Start the Tkinter application as a separate process
            global_process = subprocess.Popen(['python', final_pred_path])
            
            return jsonify({'status': 'success', 'message': 'Translation started successfully'}), 200
        else:
            return jsonify({'status': 'error', 'message': 'Translation is already running'}), 400
    except Exception as e:
        logger.exception(f"Exception occurred: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/stop-translation', methods=['POST'])
def stop_translation():
    global global_process
    if global_process and global_process.poll() is None:
        # Send a termination signal to the process
        os.kill(global_process.pid, signal.SIGTERM)
        global_process = None
        return jsonify({'status': 'success', 'message': 'Translation stopped successfully'}), 200
    else:
        return jsonify({'status': 'error', 'message': 'No active translation to stop'}), 400

if __name__ == '__main__':
    logger.info("Starting Flask server")
    app.run(debug=True)

