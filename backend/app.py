from flask import Flask, jsonify, request, redirect, flash, make_response, session



app = Flask(__name__)

@app.route("/")
def test():
    return "Backend is working"


@app.route("/login")
def login():
    return redirect ("/")

@app.route("/focus")
def focus():
    return "tasks and timer"

@app.route("/settings")
def settings():
    return "settings"

@app.route("/stats")
def stats():
    return "stats"



if __name__ == "__main__":
    app.run(use_reloader=True, debug=True)

    