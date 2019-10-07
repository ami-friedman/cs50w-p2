import os
import requests
from datetime import datetime

from flask import Flask, jsonify, render_template, request, session, redirect, url_for, jsonify, make_response, flash
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

_channels = [

]

_messages = {

}

@app.route("/", methods=["GET"])
def index():
    if authenticated():
        return redirect(url_for('chat'))
    return render_template('welcome.html')

@app.route("/logout", methods=["POST"])
def logout():
    if authenticated():
        print('popping')
        session.pop('displayname')
    return redirect(url_for('index'))

@app.route("/login", methods=["POST"])
def login():
    displayname = request.form.get('displayname')
    if displayname:
        session['displayname'] = displayname
        return redirect(url_for('chat'))
    else:
        flash('No display name provided')
        return redirect(url_for('index'))
   

@app.route("/chat", methods=["GET"])
def chat():
    if authenticated():
        return render_template('chat.html', channels = _channels)
    return redirect(url_for('index'))

@app.route("/messages/<channel>", methods=["GET"])
def messages(channel):
    if authenticated():
        if channel in _messages:
            return jsonify(messages=_messages[channel])
        else:
            return make_response(jsonify(messages=[]), 404)
    return redirect(url_for('index'))

@socketio.on("add channel")
def add_channel(data):
    print(f'{add_channel.__name__:} data = {data}')
    channel=data['channel'] 
    if channel in _channels:
        emit("announce channel fail", channel, broadcast=False)
        return
    _channels.append(data['channel'])
    channel=data['channel']
    _messages[channel] = []
    emit("announce channel", channel, broadcast=True)


@socketio.on("send msg")
def send_message(data):
    print(f'{send_message.__name__:} data = {data}')
    timestamp = datetime.now()
    timestampStr = timestamp.strftime("%d-%b-%Y %H:%M:%S")
    data['msg'] = f"{session['displayname']} ({timestampStr}): {data['msg']}"
    channel = data['channel']
    if channel in _messages:
        _messages[channel].append(data['msg'])
    print(f'{send_message.__name__:} data = {data}')
    emit("announce msg", data, broadcast=True)


def authenticated():
    return 'displayname' in session

# @app.route("/", methods=["POST", "GET"])
# def index1():
#     if request.method == 'POST':
#         displayname = request.form.get('displayname')
#         session['displayname'] = displayname
#         print(displayname)
#         return redirect(url_for('index'))
#     else:
#         return render_template("index.html", channels = _channels)

# @app.route("/login", methods=["POST", "GET"])
# def login():
#     if request.method == 'POST':
#         displayname = request.form.get('displayname')
#         if displayname:
#             session['displayname'] = displayname
#             print(displayname)
#         return redirect(url_for('index'))
#     else:
#         return render_template("index.html", channels = _channels)

# @app.route("/logout", methods=["GET"])
# def logout():
#     session.pop('displayname', None)
#     return redirect(url_for('index'))

# @app.route("/channels", methods=["POST", "GET"])
# def channels():
#     if request.method == 'POST':
#         channel = request.form.get('channel')
#         _channels.append(channel)
#         return redirect(url_for('channels'))
#     else:
#         return render_template("channels.html", channels = _channels)

# @app.route("/channels/<channel>", methods=["POST", "GET"])
# def channel(channel):
#     if channel in _messages:
#         messages = _messages[channel]
#         return jsonify(messages=messages)
#     return jsonify(messages=[])

# @socketio.on("send msg")
# def send_message(data):
#     print(f"Data received:{data}")
#     timestamp = datetime.now()
#     timestampStr = timestamp.strftime("%d-%b-%Y %H:%M:%S")
#     data['msg'] = f"{session['displayname']} ({timestampStr}): {data['msg']}"
#     channel = data['channel']
#     if channel in _messages:
#         _messages[channel].append(data['msg'])
#     emit("announce msg", data, broadcast=True)

# @socketio.on("add channel")
# def add_channel(data):
#     print(f"Data received:{data}")
#     _channels.append(data['channel'])
#     channel =data['channel']
#     _messages[channel] = []
#     emit("announce channel", channel, broadcast=True)

if __name__ == '__main__':
    socketio.run(app)