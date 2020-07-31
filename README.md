# browser-multiplayer-demo

A small demo project for browser-based multiplayer board games.
Written as tutorial material for a hackathon during the online-only SoAk 2020.


## Goals

For this hackathon, we want to implement online multiplayer games,
e.g. classical board games or new inventions so that multiple players
can play together.

This example project, to simplify the game logic but still show
all the needed technologies, implements connect4.


## Overview

Developing something for the web always needs multiple technologies,
so the beginning will have a rather steep learning curve.

For this tutorial, we shall get to know:

* Some basic HTML for the web pages
* CSS for styling
* JavaScript to implement the client side logic
* Python using the Flask framework for the server logic
* socketio websockets to communicate state changes between players and the server
* HTML canvas and its JavaScript API to draw the playing field

While using NodeJS on the server side would reduce the number of
languages by 1, this tutorial is aimed at physicists who are already familiar
with python, so implementing the server side game logic should be easier using
flask/python than an unknown framework in an unfamiliar language.


## Tutorial steps

1. Intro to HTML
1. Short intro to JavaScript and the DOM API
1. Drawing on the HTML canvas
1. Intro to CSS
1. The browser debugging tools
1. Adding server side logic using flask
1. Bidirectional communication using websockets/socketio


## Resources

The tutorial will only give an overview over the needed technologies and
a bare minimum of their usage.

More Material will be needed to program another functional game.

### Documentation of the used packages

* [socketio JS docs](https://socket.io/docs/client-api/)
* [flask](https://flask.palletsprojects.com/en/1.1.x/)
* [flask-socketio](https://flask-socketio.readthedocs.io/en/latest/)
* [python-dotenv](https://pypi.org/project/python-dotenv/)
* [secrets (python std lib)](https://docs.python.org/3/library/secrets.html)


### Mozilla Developer Network

<https://developer.mozilla.org/en-US/>

A vast amount of documentation and tutorials about all topics concerning
the basic web technologies: HTML, CSS and JavaScript.

Especially:

* The [Canvas Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial)
    and the [Canvas Reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas)
* The [Document Object Model (DOM) API](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction)
    for manipulating the HTML code of a webpage with JavaScript


### YouTube Tutorials

Tutorials on exactly what we are trying to do here (only using NodeJS on the server instead of Flask):

* <https://youtu.be/xVcVbCLmKew>
* <https://youtu.be/PfSwUOBL1YQ>

