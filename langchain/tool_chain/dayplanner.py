import os
from dotenv import load_dotenv
load_dotenv(os.path.join('..', '.env'))

import streamlit

from langchain import LLMChain
from langchain.agents import Tool, ConversationalAgent, AgentExecutor
from langchain.chat_models import ChatOpenAI
from langchain.llms import OpenAI
from langchain.memory import ConversationBufferMemory
from langchain.memory.chat_message_histories import StreamlitChatMessageHistory
from langchain.utilities import OpenWeatherMapAPIWrapper

streamlit.title('Day Planer')

AI = OpenAI(temperature=0.7)

weather = OpenWeatherMapAPIWrapper()

tools = [
    Tool(
        name="Weather",
        func=weather.run,
        description="Useful for when you need to know the weather in a specific location."
    )
]

msgs = StreamlitChatMessageHistory()

prefix = """You are a friendly, mdern day planner. You help users find activities in a given city based on their preferences and the weather.
You have access to tools:"""
suffix = """Begin!

Chat History:
{chat_history}
Latest Question: {input}
{agent_scratchpad}"""

prompt = ConversationalAgent.create_prompt(
    tools,
    prefix=prefix,
    suffix=suffix,
    input_variables=['input', 'chat_history', 'agent_scratchpad']
)
memory = ConversationBufferMemory(messages=msgs, memory_key='chat_history', return_messages=True)
if 'memory' not in streamlit.session_state:
    streamlit.session_state.memory = memory

llm_chain = LLMChain(
    llm=ChatOpenAI(
        temperature=0.8, model_name='gpt-3.5-turbo'
    ),
    prompt=prompt
)

agent = ConversationalAgent(llm_chain=llm_chain, tools=tools, verbose=True, memory=memory, max_iterations=3)

agent_chain = AgentExecutor.from_agent_and_tools(
    agent=agent,
    tools=tools,
    verbose=True,
    memory=memory
)

query = streamlit.text_input(
    'What are you in the mood for?',
    placeholder='I can help!'
)

if query:
    with streamlit.spinner('Thinking...'):
        response = agent_chain.run(query)
        streamlit.info(response, icon='🤖')
        # streamlit.write(response)

with streamlit.expander('My thinking'):
    streamlit.session_state.memory.return_messages
