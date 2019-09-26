import os
import requests
from datetime import datetime

from flask import Flask, jsonify, render_template, request, session, redirect, url_for, jsonify
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

_channels = [

]

_messages = {

}

@app.route("/", methods=["POST", "GET"])
def index():
    if request.method == 'POST':
        displayname = request.form.get('displayname')
        session['displayname'] = displayname
        print(displayname)
        return redirect(url_for('index'))
    else:
        return render_template("index.html", channels = _channels)

@app.route("/channels", methods=["POST", "GET"])
def channels():
    if request.method == 'POST':
        channel = request.form.get('channel')
        _channels.append(channel)
        return redirect(url_for('channels'))
    else:
        return render_template("channels.html", channels = _channels)

@app.route("/channels/<channel>", methods=["POST", "GET"])
def channel(channel):
    if channel in _messages:
        messages = _messages[channel]
        return jsonify(messages=messages)
    return 'None'

@socketio.on("send msg")
def send_message(data):
    print(f"Data received:{data}")
    timestamp = datetime.now()
    timestampStr = timestamp.strftime("%d-%b-%Y %H:%M:%S")
    data['msg'] = f"{session['displayname']} ({timestampStr}): {data['msg']}"
    channel = data['channel']
    if channel in _messages:
        _messages[channel].append(data['msg'])
    emit("announce msg", data, broadcast=True)

@socketio.on("add channel")
def add_channel(data):
    print(f"Data received:{data}")
    _channels.append(data['channel'])
    channel =data['channel']
    _messages[channel] = []
    emit("announce channel", channel, broadcast=True)

if __name__ == '__main__':
    socketio.run(app)