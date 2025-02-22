# @Author: Bertan Berker
# @Language: Python (Flask)
# This file is the main API file for the backend
# It is responsible for handling all the requests and responses and interacting with the AI agents

from flask import Flask, request, jsonify
from agents import 
import os

app = Flask(__name__)

@app.route('/', methods=['GET'])
def resume_analytics():
    return False