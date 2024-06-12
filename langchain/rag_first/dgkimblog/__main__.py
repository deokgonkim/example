import os
import sys
import time

import bs4
from langchain import hub
from langchain_chroma import Chroma
from langchain_community.document_loaders import WebBaseLoader
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

blog_urls = [
    'https://www.dgkim.net/pages/this-year',
    'https://www.dgkim.net/pages/year-2023',
    'https://www.dgkim.net/pages/year-2022',
    'https://www.dgkim.net/pages/year-2021',
    'https://www.dgkim.net/pages/year-2020',
]
    

llm = ChatOpenAI(model='gpt-3.5-turbo', api_key=OPENAI_API_KEY)

loader = WebBaseLoader(
    web_paths=blog_urls,
    bs_kwargs=dict(
        parse_only=bs4.SoupStrainer(
            # class_=('gblog-post',)
            class_=('gblog-markdown', )
        )
    )
)
docs = loader.load()
# print('Page content')
# print(len(docs[0].page_content))
# print(docs[0].page_content)
# sys.exit(0)

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=100,
    add_start_index=True
)
splits = text_splitter.split_documents(docs)
# print('splits')
# print(len(splits[0].page_content))
# print(splits[0].page_content)
# print(splits[0].metadata)
# sys.exit(0)

vectorstore = Chroma.from_documents(
    documents=splits,
    embedding=OpenAIEmbeddings()
)

retriever = vectorstore.as_retriever()
prompt = hub.pull('rlm/rag-prompt')

def format_docs(docs):
    return '\n\n'.join(doc.page_content for doc in docs)

rag_chain = (
    {'context': retriever | format_docs, 'question': RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

questions = [
    'What has he done this year?',
    'What has he done in 2020?',
    'Does he knows about Raspberry Pi or ESP32?',
    'Does he mentions where he lives?',
]

for question in questions:
    print('Question:', question)
    result = rag_chain.invoke(question)
    print(result)
    time.sleep(3)

vectorstore.delete_collection()
