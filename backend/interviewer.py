# @ Author: Bertan Berker
# @ Language: Python
# This is the file that contains functions about question generating, feedback giving
# and response from an interviewer

import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from crewai import Agent, Task, Crew
from crewai_tools import ScrapeWebsiteTool, SerperDevTool
import warnings
from pydantic import BaseModel
warnings.filterwarnings('ignore')
import json
import PyPDF2

openai_api_key = os.getenv('OPENAI_API_KEY')
os.environ["OPENAI_MODEL_NAME"] = 'gpt-3.5-turbo'
load_dotenv()

# Define output schema
class OutputPydantic(BaseModel):
    communication: int
    content: int
    confidence: int
    feedback: str 


# This function is used for generating a response to a user's response
# based on the possible questions and their response
# :param user_response: User's Response
# :param possible_questions: Possible questions to ask the user
# :return: a question
def generate_response(user_response, filename):
    
    try:
        with open(filename, "r", encoding="utf-8") as f:
            possible_questions = json.load(f)
    except Exception as e:
        return {"error": f"Failed to load interview data: {e}"}
    
    # Convert the interview data into a text format for the agent prompt
    possible_questions = json.dumps(possible_questions, indent=2)

    # Agents
    responding_agent = Agent(
        role= "Interviewer Agent",
        goal= f"Your goal is to respond to the {user_response} by either asking a follow-up question or by continuing to ask one of the \
         questions in the list of {possible_questions}",
        backstory="You are a professional interviewer who have done this for the last 30 years. You interview candidates for prestigious jobs\
            and you are known for asking very thoughtful questions that get incredibly inside into who the candidates are and how qualified they are\
            for the job. ",
        verbose=False,
        allow_delegation=False,
    )

    # Tasks  
    respond = Task(
        description=(
            f"Analyze the candidate's answer provided in {user_response} and consider the list of available questions in {possible_questions}. "
            "Then, craft a single, insightful follow-up question that either dives deeper into the candidate's response or selects the most appropriate question from the list. "
            "Your question should reflect your extensive 30-year experience in interviewing, be engaging, and maintain a professional tone throughout the conversation."
        ),
        expected_output=(
            "A single, well-formulated interview question in plain text. This question should either follow up on the candidate's previous answer or be chosen from the provided \
             list of possible questions, ensuring clarity, engagement, and a professional tone. ONLY OUTPUT THE QUESTION ITSELF! NOTHING BEFORE OR AFTER IT! ONLY THE QUESTION!"
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


def load_and_analyze_pdf(filename: str):
    
    if not os.path.exists(filename):
        return {"error": f"File '{filename}' not found."}
    
    try:
        with open(filename, "rb") as file:
            reader = PyPDF2.PdfReader(file)
            text = ""
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        return {"error": f"Error reading PDF: {e}"}
    
    return text


# Interview agent synthesizes the information given by the user,
# creates 10 questions for the AI clone to use! 
# :return: 10 Questions the AI Clone should use
def interview_agent(filename):

    try:
        with open(filename, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        return {"error": f"Failed to load interview data: {e}"}
    
    # Extract values from the loaded JSON data
    difficulty = data.get("difficulty")
    company = data.get("company")
    job_position = data.get("job_position")
    resume = load_and_analyze_pdf(filename)
    
    # Defining the Tools
    search_tool = SerperDevTool()
    scrape_tool = ScrapeWebsiteTool()

    # Agents
    analyze_resume = Agent(
        role="Resume Analyzer Agent",
        goal=f"Extract and summarize the candidate's strengths, skills, and relevant experiences from their resume: {resume}.",
        backstory="You are an expert resume analyst who can quickly identify key insights from a candidate's resume.",
        verbose=False,
        allow_delegation=False,
        tools=[]
    )

    analyze_company = Agent(
        role="Company and Job Position Analyzer Agent",
        goal="Analyze the company profile, job position details, and interview difficulty to generate targeted interview questions.",
        backstory="You have extensive experience in understanding company cultures and job requirements to craft insightful interview questions.",
        verbose=False,
        allow_delegation=False,
        tools=[scrape_tool, search_tool]
    )
   
    # TASKS    
    analyze = Task(
        description=(
            f"Analyze the following resume content: {resume}. "
            f"Extract the candidate's key strengths, skills, and experiences relevant to the {job_position} position at {company}."
        ),
        expected_output=(
            "Return a concise summary of the resume, highlighting key strengths, skills, and experiences."
        ),
        agent=analyze_resume
    )

    find_company = Task(
        description=(
            f"Using the resume analysis and {resume} along with the information that the candidate is applying for the {job_position} role at {company} "
            f"with a difficulty level of {difficulty}, generate 10 targeted interview questions that assess the candidate's fit and readiness for the role."
        ),
        expected_output=(
            "Return a list of 10 interview questions."
        ),
        agent=analyze_company
    )

    # Define the crew with agents and tasks
    resume_crew = Crew(
        agents=[analyze_resume, analyze_company],
        tasks=[analyze, find_company],
        manager_llm=ChatOpenAI(model="gpt-3.5-turbo", temperature=0.6),
        verbose=False
    )

    # Running the crew to get possible interview questions
    possible_questions = resume_crew.kickoff()
    return possible_questions


def feedback_agent(filename):

    try:
        with open(filename, "r", encoding="utf-8") as f:
            interview_data = json.load(f)
    except Exception as e:
        return {"error": f"Failed to load interview data: {e}"}
    
    # Convert the interview data into a text format for the agent prompt
    interview_text = json.dumps(interview_data, indent=2)
    
    # Define Agents
    feedbacker = Agent(
        role="Feedback Giver Agent",
        goal="Provide detailed and constructive feedback on the candidate's interview performance.",
        backstory="You are an expert interviewer who can analyze and critique the candidate's communication, content, and confidence and give great feedback.",
        verbose=False,
        allow_delegation=False,
    )

    scorer = Agent(
        role="Company and Job Position Analyzer Agent",
        goal="Assess and score the candidate's performance during the interview.",
        backstory="You have extensive experience in evaluating technical and behavioral interviews.",
        verbose=False,
        allow_delegation=False,
    )
   
    # Define TASKS    
    give_feedback = Task(
        description=(
            "Analyze the following interview data and provide detailed feedback on the candidate's performance. "
            "Focus on communication clarity, the depth and relevance of content, and the candidate's confidence. "
        ),
        expected_output=(
           f"Give an extensive paragraph about the user's performance. Interview Data is given as {interview_text}"
        ),
        agent=feedbacker
    )

    give_score = Task(
        description=(
            "Based on the interview data below, assign scores to the candidate's performance in communication, content, and confidence out of 100."
            f"Interview Data is given as:\n{interview_text}"
        ),
        expected_output=(
            "A JSON object containing 'communication' (int), 'content' (int), 'confidence' (int), and 'feedback' (str)."
        ),
        agent=scorer
    )

    resume_crew = Crew(
        agents=[feedbacker, scorer],
        tasks=[give_feedback, give_score],
        manager_llm=ChatOpenAI(model="gpt-3.5-turbo", temperature=0.6),
        verbose=False
    )

    results = resume_crew.kickoff()
     
    # Convert results into the desired Pydantic format.
    try:
        output = OutputPydantic(**results)
        return output
    except Exception as e:
        return {"error": f"Failed to parse results into schema: {e}"}