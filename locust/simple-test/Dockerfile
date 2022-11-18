FROM python:3.10

WORKDIR /app/

COPY requirements.* /app/

RUN pip install -r requirements.txt

COPY . /app/

ENTRYPOINT ["/app/entrypoint.sh"]
