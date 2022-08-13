from fastapi import FastAPI
from pydantic import BaseModel


app = FastAPI()


class GeneralResponse(BaseModel):
    code :int
    message :str


@app.get('/', response_model=GeneralResponse)
def index():
    return GeneralResponse(
        code = 200,
        message = 'Hello'
    )
