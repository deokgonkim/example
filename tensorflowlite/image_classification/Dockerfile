FROM python:3.9

RUN apt update && apt install -y libgl1

COPY ./requirements.txt /app/
RUN pip install -r /app/requirements.txt

RUN apt install libusb-1.0-0

WORKDIR /app/
COPY ./ /app/

ENTRYPOINT ["/app/run.sh"]

