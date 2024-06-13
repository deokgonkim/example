import os
from dotenv import load_dotenv
load_dotenv(os.path.join('..', '.env'))

import streamlit

from langchain import globals
globals.set_verbose(True)

# from langchain import LLMChain
from langchain.chains.llm import LLMChain
from langchain.agents import Tool, ConversationalAgent, AgentExecutor
# from langchain.chat_models import ChatOpenAI
# from langchain_community.chat_models import ChatOpenAI
from langchain_openai import ChatOpenAI
from langchain.memory import ConversationBufferMemory
# from langchain.memory.chat_message_histories import StreamlitChatMessageHistory
from langchain_community.chat_message_histories import StreamlitChatMessageHistory
# from langchain.utilities import OpenWeatherMapAPIWrapper
from langchain_community.utilities import OpenWeatherMapAPIWrapper

streamlit.title('Day Planer')

# openweathermap api requires api key
weather = OpenWeatherMapAPIWrapper(openweathermap_api_key=os.getenv('OPENWEATHERMAP_API_KEY'))

tools = [
    Tool(
        name="Weather",
        func=weather.run,
        description="Useful for when you need to know the weather in a specific location.",
        verbose=True
    )
]

msgs = StreamlitChatMessageHistory()

# prefix = """You are a friendly, modern day planner. You help users find activities in a given city based on their preferences and the weather.
# You have access to tools:

# {tools}

# Use the following format:

# Question: the input question you must answer
# Thought: you should always think about what to do
# Action: the action to take, should be one of [{tool_names}]
# Action Input: the input to the action
# Obersvation: the result of the action
# ... (this Thought-Action-Observation cycle can repeat multiple times)
# Thought: I now know the final answer
# Final Answer: the final answer to the original input question
# """

prefix = """You are a friendly, modern day planner. You help users find activities in a given city based on their preferences and the weather.
You have access to tools:
"""

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
