from flask import Flask


app = Flask(__name__)


@app.route("/")
def welcome():
    return "Welcome"


@app.route("/hello")
def default_hello():
    return "Hello"


@app.route("/hello/<id>")
def hello(id):
    return f"Hello {id}"
