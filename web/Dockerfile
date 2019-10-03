FROM python:3.6
ENV PYTHONUNBUFFERED 1


RUN mkdir /leonardoAnnotator
WORKDIR /leonardoAnnotator

ADD requirements.txt /leonardoAnnotator/
RUN pip install -r requirements.txt
ADD . /leonardoAnnotator/
RUN mkdir /tmp/ffmpeg
WORKDIR /tmp/ffmpeg
COPY ./install/ffmpeg/ffmpeg-release-64bit-static.tar.xz ./
RUN tar xf ffmpeg-release-64bit-static.tar.xz
RUN mv ./ffmpeg-3.4.2-64bit-static/ffmpeg /usr/bin/ffmpeg
RUN rm -R /tmp/ffmpeg
WORKDIR /leonardoAnnotator
