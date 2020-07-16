# create a build stage
# see https://stackoverflow.com/a/54763270/3838691
FROM python:3.8-slim

# we always want to serve the member_database app
ENV FLASK_APP=connect4 \
	PORT=5000 \
	PIP_NO_CACHE_DIR=1 \
	PIP_DISABLE_PIP_VERSION_CHECK=1 \
	PYTHONUNBUFFERED=1

# everything should run as the memberdb user (not root, best practice)
RUN useradd --system --user-group connect4

RUN pip install poetry==1.0.9
WORKDIR /home/connect4/

# copy relevant files
COPY pyproject.toml poetry.lock ./

# install production dependencies
RUN poetry config virtualenvs.create false \
	&& poetry install --no-dev

COPY connect4 ./connect4

# switch to our production user
USER connect4
CMD gunicorn --bind 0.0.0.0:$PORT -k eventlet "connect4:app"
