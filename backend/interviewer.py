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
from pathlib import Path
import openai
from openai import OpenAI
import warnings
from pydantic import BaseModel
warnings.filterwarnings('ignore')

openai_api_key = os.getenv('OPENAI_API_KEY')
os.environ["OPENAI_MODEL_NAME"] = 'gpt-3.5-turbo'
load_dotenv()

# Define output schema
class OutputPydantic(BaseModel):
    approved: bool


# This function is used for generating a response to a user's response
# based on the possible questions and their response
# :param user_response: User's Response
# :param possible_questions: Possible questions to ask the user
# :return: a question
def generate_response(user_response, possible_questions):
    
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
            "Analyze the candidate's answer provided in {user_response} and consider the list of available questions in {possible_questions}. "
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


# Interview agent synthesizes the information given by the user,
# creates 10 questions for the AI clone to use! 
# :return: 10 Questions the AI Clone should use
def interview_agent(difficulty, company, job_position, user_session_id):

    # Resume agent -> Paragraph about person
    # Company & Job Title -> Paragraph about previous questions (web search)
    # 

    
    # Defining the Tools
    search_tool = SerperDevTool()
    scrape_tool = ScrapeWebsiteTool()

    # Agents
    analyze_resume = Agent(
        role="",
        goal="",
        backstory="",
        verbose=False,
        allow_delegation=False,
        tools =[scrape_tool, search_tool]
    )

   
    # TASKS    
    analyze = Task(
        description=(
            ""
        ),
        expected_output=(
            ""
        ),
        agent= analyze_resume
    )

    # Define the crew with agents and tasks
    resume_crew = Crew(
        agents=[analyze_resume],
        tasks=[analyze],
        manager_llm=ChatOpenAI(model="gpt-3.5-turbo", temperature=0.6),
        verbose=False
    )

    # RUN
    result = resume_crew.kickoff()
    return result.raw
    return possible_questions






def feedback_agent():
    return


def scoring_agent():
    return