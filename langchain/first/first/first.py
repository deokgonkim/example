import os
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.output_parsers import StrOutputParser

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

model = ChatOpenAI(model='gpt-4o', openai_api_key=OPENAI_API_KEY)
parser = StrOutputParser()

messages = [
    SystemMessage(content='Translate the following from English into Korean'),
    HumanMessage(content='Hello, how are you?'),
]

# result = model.invoke(messages)
# result2 = parser.invoke(result)
# print(result2)

chain = model | parser
result = chain.invoke(messages)

print(result)
