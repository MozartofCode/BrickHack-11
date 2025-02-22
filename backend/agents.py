# @Author: Bertan Berker
# @Language: Python
# This is a file with AI agents

from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from crewai import Agent, Task, Crew
from crewai_tools import ScrapeWebsiteTool, SerperDevTool
import warnings
warnings.filterwarnings('ignore')
import os
from flask import Flask, request, jsonify

load_dotenv()
openai_api_key = os.getenv('OPENAI_API_KEY')
serper_api_key = os.getenv('SERPER_API_KEY')
os.environ["OPENAI_MODEL_NAME"] = 'gpt-3.5-turbo'

from pydantic import BaseModel

# Define output schema
class OutputPydantic(BaseModel):
    approved: bool

def resume_agent():
    
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