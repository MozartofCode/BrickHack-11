# @Author: Bertan Berker
# @Language: Python (Flask)
# This file is the main API file for the backend
# It is responsible for handling all the requests and responses and interacting with the AI agents

from flask import Flask, request, jsonify
from agents import resume_agent
import os
from flask_cors import CORS
from flask_pymongo import PyMongo
from bson import ObjectId


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

app.config["MONGO_URI"] = os.getenv("MONGO_URI")
mongo = PyMongo(app)


@app.route('/store_user_info', methods=['POST'])
def store_user_info():

    try:
        # Parse JSON from request
        form_data = request.get_json()

        # Ensure required fields exist
        company_name = form_data.get("companyName", "").strip()
        year = form_data.get("year", "").strip()
        
        data = request.get_json()  # Get data from the request body
        result = mongo.db.myCollection.insert_one(data)
        return jsonify({"inserted_id": str(result.inserted_id)}), 201

        if not company_name or not year:
            return jsonify({"error": "companyName and year are required"}), 400




        return jsonify({"message": f"Balance sheet stored successfully"}), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500




@app.route('/', methods=['GET'])
def resume_analytics():
    return False


