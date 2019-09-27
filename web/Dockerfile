FROM python:3.6
ENV PYTHONUNBUFFERED 1
RUN mkdir /leonardoAnnotator
WORKDIR /leonardoAnnotator
ADD requirements.txt /leonardoAnnotator/
RUN pip install -r requirements.txt
ADD . /leonardoAnnotator/



