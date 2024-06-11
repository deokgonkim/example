import os
from fastapi import FastAPI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI
from langserve import add_routes
import uvicorn

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

system_template = "Translate the following into {language}:"
prompt_template = ChatPromptTemplate.from_messages([
    ('system', system_template),
    ('user', '{text}')
])

model = ChatOpenAI(openai_api_key=OPENAI_API_KEY)

parser = StrOutputParser()

chain = prompt_template | model | parser

app = FastAPI(
    title="LangChain server",
    version="0.1",
    description="A simple API server using LangChain's Runnable interface"
)

add_routes(
    app,
    chain
)

uvicorn.run(app, host='0.0.0.0', port=8000)
