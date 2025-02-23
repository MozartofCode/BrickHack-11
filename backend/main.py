# # @Author: Bertan Berker
# # @Language: Python (Flask)
# # This file is the main API file for the backend
# # It is responsible for handling all the requests and responses and interacting with the AI agents

from flask import Flask, request, jsonify
import os
from flask_cors import CORS
from datetime import datetime
from werkzeug.utils import secure_filename
import json
from interviewer import generate_response


# Define local folders for storage
BASE_DIR = os.getcwd()
RESUME_FOLDER = os.path.join(BASE_DIR, '../database', 'resumes')
DATA_FOLDER = os.path.join(BASE_DIR, '../database', 'data')

# Ensure the folders exist
os.makedirs(RESUME_FOLDER, exist_ok=True)
os.makedirs(DATA_FOLDER, exist_ok=True)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


@app.route('/store_user_info', methods=['POST'])
def store_user_info():
    # Retrieve form data and file from the multipart request
    form_data = request.form.to_dict()
    resume_file = request.files.get("resume")

    # Basic validation: ensure required fields exist
    required_fields = ["desiredJob", "questionCount", "difficulty", "company"]
    missing = [field for field in required_fields if field not in form_data]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400


    # If a resume file was provided, store it locally
    resume_path = ""
    if resume_file:
        # Secure the filename and add a timestamp for uniqueness
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        filename = secure_filename(resume_file.filename)
        new_filename = f"{timestamp}_{filename}"
        resume_path = os.path.join(RESUME_FOLDER, new_filename)
        resume_file.save(resume_path)
    
    # Add the resume file path to the data (even if blank)
    form_data["resume_path"] = resume_path

    # Optionally include additional info (like submission time)
    form_data["submitted_at"] = datetime.now().isoformat()

    # Save all the form info to a JSON file in the data folder
    json_filename = f"{timestamp}.json"
    json_filepath = os.path.join(DATA_FOLDER, json_filename)
    try:
        with open(json_filepath, "w") as f:
            json.dump(form_data, f)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    return jsonify({
        "message": "Data stored successfully",
        "data_file": json_filename,
        "resume_file": os.path.basename(resume_path) if resume_path else ""
    }), 200


# Updated endpoint for creating the interviewer session
@app.route('/create_interviewer', methods=['GET'])
def create_interviewer():
    user_session_id = request.args.get("userSessionId")
    if not user_session_id:
        return jsonify({"error": "Missing userSessionId"}), 400

    json_filepath = os.path.join(DATA_FOLDER, user_session_id)
    if not os.path.exists(json_filepath):
        return jsonify({"error": "Session not found"}), 404

    try:
        with open(json_filepath, "r") as f:
            session_data = json.load(f)
        # Return the stored session data; your InterviewPage can use fields like questionCount
        return jsonify(session_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/process', methods=['POST'])
def process_user_response():
    data = request.get_json()
    user_message = data.get('message', '')
    
    reply = (generate_response(user_message, "What do you do for a living? What is your age?"))

    return jsonify({'reply': reply})


if __name__ == "__main__":
    app.run(debug=True, port=5000)