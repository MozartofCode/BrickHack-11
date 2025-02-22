#
#
#
#
#

import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from crewai import Agent, Task, Crew
from crewai_tools import ScrapeWebsiteTool, SerperDevTool
import warnings
from google.cloud import texttospeech

warnings.filterwarnings('ignore')
openai_api_key = os.getenv('OPENAI_API_KEY')
os.environ["OPENAI_MODEL_NAME"] = 'gpt-3.5-turbo'


def generate_response(user_response, possible_questions):
    
    # Agents
    responding_agent = Agent(
        role= "Interviewer Agent",
        goal= f"Your goal is to respond to the {user_response} by either asking a follow-up question or by continuing to ask one of the 
         questions in the list of {possible_questions}",
        backstory="You are a professional interviewer who have done this for the last 30 years. You interview candidates for prestigious jobs\
            and you are known for asking very thoughtful questions that get incredibly inside into who the candidates are and how qualified they are\
            for the job. ",
        verbose=False,
        allow_delegation=False,
    )

    # TASKS    
    respond = Task(
        description=(
            "Analyze the candidate's answer provided in {user_response} and consider the list of available questions in {possible_questions}. "
            "Then, craft a single, insightful follow-up question that either dives deeper into the candidate's response or selects the most appropriate question from the list. "
            "Your question should reflect your extensive 30-year experience in interviewing, be engaging, and maintain a professional tone throughout the conversation."
        ),
        expected_output=(
            "A single, well-formulated interview question in plain text. This question should either follow up on the candidate's previous answer or be chosen from the provided list of possible questions, ensuring clarity, engagement, and a professional tone."
        ),
        agent=responding_agent
    )

    # Define the crew with agents and tasks
    respond_crew = Crew(
        agents=[responding_agent],
        tasks=[respond],
        manager_llm=ChatOpenAI(model="gpt-3.5-turbo", temperature=0.6),
        verbose=False
    )

    # RUN
    result = respond_crew.kickoff()
    return result.raw



# Use Google Cloud Text-to-Speech to generate an MP3 file from the given text
def synthesize_speech(text, filename):
    
    client = texttospeech.TextToSpeechClient()

    synthesis_input = texttospeech.SynthesisInput(text=text)
    voice = texttospeech.VoiceSelectionParams(
        language_code="en-US",
        ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL
    )
    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3
    )

    response = client.synthesize_speech(
        input=synthesis_input,
        voice=voice,
        audio_config=audio_config
    )

    # Save the audio to a file
    with open(filename, "wb") as out:
        out.write(response.audio_content)
    return filename
