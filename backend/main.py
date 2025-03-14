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
from interviewer import generate_response, feedback_agent, interview_agent
from pydantic import BaseModel

# Defining local folders for storage
BASE_DIR = os.getcwd()
RESUME_FOLDER = os.path.join(BASE_DIR, '../database', 'resumes')
DATA_FOLDER = os.path.join(BASE_DIR, '../database', 'data')
INTERVIEWS_FOLDER = os.path.join(BASE_DIR, '../database', 'interviews')
QUESTIONS_FOLDER = os.path.join(BASE_DIR, '../database', 'questions')

# Ensuring the folders exist
os.makedirs(INTERVIEWS_FOLDER, exist_ok=True)
os.makedirs(RESUME_FOLDER, exist_ok=True)
os.makedirs(DATA_FOLDER, exist_ok=True)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


# The output Schema for the Feedback Agent
class OutputPydantic(BaseModel):
    communication: int
    content: int
    confidence: int
    feedback: str 


# This function is responsible for storing user information from the survey
# It stores the desiredJob, questionCount, difficulty, company as well as the
# resume of the user.
# Naming is based on the timestamp for every data folder
@app.route('/store_user_info', methods=['POST'])
def store_user_info():
    # Retrieve form data and file from the multipart request
    form_data = request.form.to_dict()
    resume_file = request.files.get("resume")

    required_fields = ["desiredJob", "questionCount", "difficulty", "company"]
    missing = [field for field in required_fields if field not in form_data]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    # Generate timestamp for file naming
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")

    # If a resume file was provided, store it locally with only timestamp as the filename
    resume_path = ""
    if resume_file:
        extension = os.path.splitext(secure_filename(resume_file.filename))[-1]
        new_filename = f"{timestamp}{extension}"
        resume_path = os.path.join(RESUME_FOLDER, new_filename)
        resume_file.save(resume_path)

    form_data["resume_path"] = resume_path
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
# This function creates the possible question that the interviewer can use
# by calling the interview agent to generate 10 good personalized questions based on the user
@app.route('/create_interviewer', methods=['GET'])
def create_interviewer():

    user_session_id = request.args.get("userSessionId")
    
    if not user_session_id:
        return jsonify({"error": "Missing userSessionId"}), 400

    try:
        
        possible_questions = interview_agent(user_session_id)

        filename = f"{user_session_id}"
        filepath = os.path.join(QUESTIONS_FOLDER, filename)

        crew_data = json.loads(json.dumps(possible_questions, default=str))

        try:
            with open(filepath, "w") as f:
                json.dump(crew_data, f, indent=4)

        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
        return jsonify({
            "message": "Successfully created the interviewer and questions!",
            "questions": crew_data
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# This function is used for responding to the user input
# Response generation is accomplished by the response creating agent
# that creates responses based on the user's context and their answers
@app.route('/process', methods=['POST'])
def process_user_response():
    try:
        data = request.get_json()
        user_message = data.get('message', '')
        filename = data.get('userSessionId')
        reply = generate_response(user_message, filename)
        return jsonify({'reply': reply})

    except:
        return jsonify({"error": "Error in generating a response"}), 400


# This function stores the transcription of the interview
@app.route('/store_interview', methods=['POST'])
def store_interview():
    data = request.get_json()
    conversation = data.get('conversation')
    user_session_id = data.get('userSessionId')
    
    if not user_session_id:
        return jsonify({"error": "Missing userSessionId"}), 400
    if not conversation:
        return jsonify({"error": "Missing conversation data"}), 400

    filename = f"{user_session_id}"
    filepath = os.path.join(INTERVIEWS_FOLDER, filename)
    
    try:
        with open(filepath, "w") as f:
            json.dump(data, f)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    return jsonify({"message": "Interview stored successfully", "filename": filename}), 200


# This function gets personalized feedback for the interview
# by calling the feedback agent that gives feedback on communication,
# content, confidence as well as generalized feedback
@app.route('/get_feedback', methods=["GET"])
def get_feedback():
    user_session_id = request.args.get("userSessionId")  # Get from query params
    if not user_session_id:
        return jsonify({"error": "Missing 'userSessionId' in request"}), 400

    # Ensure the filename does not contain double .json
    if not user_session_id.endswith(".json"):
        filename = f"{user_session_id}.json"
    else:
        filename = user_session_id 

    filepath = os.path.join(INTERVIEWS_FOLDER, filename)

    if not os.path.exists(filepath):
        return jsonify({"error": "Feedback not found"}), 404

    try:
        output = feedback_agent(filepath)

        validated_output = OutputPydantic(**output).model_dump()
        return jsonify(validated_output), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)