from flask import Flask, jsonify, request, redirect, flash, make_response, session
from flask_session import Session

from flask import g
from werkzeug.security import check_password_hash, generate_password_hash
import sqlite3
import secrets
from flask_cors import CORS
from datetime import datetime, timedelta, date
import os




app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "http://127.0.0.1:5173"}}, supports_credentials=True)

app.secret_key = secrets.token_hex(16)

app.config["SESSION_TYPE"] = "filesystem"
app.config['SESSION_PERMANENT'] = True 
app.config["SESSION_COOKIE_SECURE"] = False
app.permanent_session_lifetime = timedelta(days=7) 
Session(app)





DATABASE='app.db'

def get_db():
    db=getattr(g,"_database", None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()



@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://127.0.0.1:5173')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')  # for using sessions?
    return response


@app.route("/")
def home():
    return "Backend is working"

@app.route("/register", methods=["POST"])
def register():
    db=get_db()
    cur=db.cursor()
    data=request.get_json()
    username=data.get('username')
    email = data.get('email')
    password = data.get('password')
    confirmation=data.get('confirmation')
    
    if password!=confirmation:
            return jsonify({'message':"Password and confirmation do not match"}),400
    if not username or not password or not confirmation:
            return jsonify({'message':"Please fill the fields"}),400
    if '@' not in email:
        return jsonify({'message': 'Invalid email address'}), 400

    if len(username) < 3:
        return jsonify({'message': 'Username must be at least 3 characters long'}), 400
    
    

    cur.execute('SELECT * FROM users WHERE username = ?', (username,))
    user = cur.fetchone()  #to get 1 result
        
    if user:
        return jsonify({'message':"Username already exist. Choose a different one or log in to your existing account"}), 400
    else: #if all good
        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
        print(username, hashed_password)
        cur.execute("INSERT INTO users (username, hash, email) VALUES (?, ?, ?)", (username, hashed_password, email))
        db.commit()
        cur.execute("SELECT id FROM users WHERE username = ?",(username,))
        session_id=cur.fetchone()
        session["user_id"]=session_id[0]
        session["username"] = username
        session.permanent = True 
        print(session_id)
        print(f"Session in register route: {session}") 
        flash("Registration completed")
        return jsonify({'message':"Registration successful"}), 200

@app.route("/login")
def login():
    session.clear()
    db = get_db()
    data = request.get_json()
    if not data:
        return jsonify({"message":"Provide your email and password"}), 400
    email = data.get('email')
    password = data.get('password')
    cur = db.cursor()
    cur.execute("SELECT email FROM users WHERE email=?",(email,))
    user_email=cur.fetchone()
    if user_email is None:
        return jsonify ({"message":"Email does not exist in the database."}), 404
    cur.execute("SELECT hash FROM users WHERE email =?",(email,))
    user_hash=user_hash[0]
    if check_password_hash(user_hash,password):
        flash("password checked all good") #just for testing, delete once it works
        cur.execute("SELECT id FROM users WHERE email =?",(email,))
        user_id =user_id[0]
        session["user_id"]=user_id
        flash("Login completed")
        return jsonify({'message':'Login successful'}),200
    else:
        return jsonify({"message":"Password chek_hash didnt work"}), 401
    
    

@app.route("/focus/start", methods=["POST"])
def focus_start():
    print("Request received for /focus/start")
    db = get_db()
    cur = db.cursor()
    if request.method=="POST":
        data=request.get_json()
       
        user_id =session.get("user_id")
        task_id=data.get("task_id")
        is_on_break=data.get("is_on_break")
        start_time = datetime.now()
        date = start_time.date()
        session_type = 'task_focus'
        start_time_format=start_time.isoformat()
        start_date_format=start_time.date().isoformat()
        if data['is_pomodoro']:
            session_type = 'pomodoro'
            duration = 50*60
            break_duration = 10*60
            print('is pomodoro')
            if not is_on_break:
                cur.execute("INSERT INTO focus_sessions (task_id, user_id, start_time, date, status, session_type,duration, is_on_break) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", 
                (task_id, user_id, start_time_format, start_date_format,"in_progress", session_type,duration, False ))

                db.commit()
                new_focus_session_id = cur.lastrowid
                print(new_focus_session_id)
                print (f'Timer for pomodoro started at {start_time}')
                return jsonify({"message": "Timer for pomodoro started", "duration":duration, "session_id":new_focus_session_id}), 200
            else:
                cur.execute("INSERT INTO focus_sessions (task_id, user_id, start_time, date, status, session_type,duration, is_on_break) VALUES (?, ?, ?, ?, ?, ?,?, ?)", 
                (task_id, user_id, start_time_format, start_date_format,"in_progress", session_type, duration, True ))
                db.commit()
                new_focus_session_id = cur.lastrowid
                return jsonify({"message": "Timer for break pomodoro started", "break":break_duration, "session_id":new_focus_session_id}), 200
        else:
            #looking for the existing sesssion for this task

            
            #check if the session for this task exists
            cur.execute("SELECT id, time_left itle FROM focus_sessions WHERE task_id = ?", 
            (task_id, ))
            existing_session = cur.fetchone()
        
            if existing_session:
                #getting task duration, checking if it exists, if not-setting to 60
                cur.execute("SELECT duration FROM tasks WHERE id = ?", (task_id,))
                task_duration = cur.fetchone()
                cur.execute("SELECT title FROM tasks WHERE id = ?", (task_id,))
                task_title = cur.fetchone()
                task_duration1=task_duration[0]
                task_duration=task_duration1*60
                focus_session_id, time_left= existing_session
                return jsonify ({"message": "Timer started","time_left":time_left, "title":task_title, "session_id":focus_session_id, "duration":task_duration}), 200
            else:
                #getting task duration, checking if it exists, if not-setting to 60
                cur.execute("SELECT duration FROM tasks WHERE id = ?", (task_id,))
                task_duration = cur.fetchone()
                cur.execute("SELECT title FROM tasks WHERE id = ?", (task_id,))
                task_title = cur.fetchone()
                if task_duration:
                    task_duration1=task_duration[0]
                    task_duration=task_duration1*60
                else:
                    task_duration=60*60
                time_left=task_duration
                # insert a new session  into the database
                cur.execute("INSERT INTO focus_sessions (task_id, user_id, start_time, date, status, session_type, time_left, duration) VALUES (?, ?, ?, ?, ?, ?,?,?)", 
                (task_id, user_id, start_time_format, start_date_format,"in_progress", session_type, time_left, task_duration))

                db.commit()
                id=cur.lastrowid
                print(f'Timer started,session_id:{id},"time left":{time_left}')
                return jsonify({"message": "Timer started", "session_id":id, "duration":task_duration, "title":task_title, "time_left":time_left}), 200
    
@app.route("/focus/stop", methods=["POST"])
def  focus_stop():
    db = get_db()
    cur = db.cursor()
    if request.method=="POST":
        data=request.get_json()
        focus_session_id=data.get("focus_session_id")
        time_spent = data.get("time_spent")
        user_id =session.get("user_id")
        task_id=data.get("task_id")
        is_on_break=data.get("is_on_break")
        time_left = data['time_left']
        end_time = datetime.now()
        end_time_format=end_time.isoformat()
        print(f'time_spent={time_spent}')
        print(focus_session_id)
        cur.execute("SELECT *  FROM focus_sessions WHERE id = ?", 
        (focus_session_id,))
        focus_session=cur.fetchone()
       
        if not focus_session:
            # no session is found
            print("No active session found")
            return jsonify({'message':"Session is not found to be stopped"}), 400
        else:
            cur.execute("SELECT session_type FROM focus_sessions WHERE id = ?", 
             (focus_session_id,))
            session_type=cur.fetchone()
            if session_type=="pomodoro":
                

                if is_on_break:
                    #break is done
                    cur.execute("UPDATE focus_sessions SET end_time =?, status = 'completed', time_left =?, duration = ?, time_spent=? WHERE id=?", (end_time_format, 0,"300", time_spent, focus_session_id))
                    db.commit()
                    return jsonify({"message": "Pomodoro timer stopped", "session_id": focus_session_id, "is_on_break": False, "is_pomodoro": True}), 200
                elif not is_on_break:
                    # focus time is done
                    cur.execute("UPDATE focus_sessions SET end_time =?, status = 'completed', time_left =?, duration = ?, time_spent=? WHERE id=?", (end_time_format, 0, "3000", time_spent,  focus_session_id))
                    db.commit()
                    return jsonify({"message": "Pomodoro timer stopped", "session_id": focus_session_id, "is_on_break": True, "is_pomodoro": True}), 200
                


            else:
                if time_left ==0:
                    cur.execute("UPDATE focus_sessions SET end_time =?, status ='completed', time_left=?, time_spent =? WHERE id=?",(end_time_format, 0,time_spent, focus_session_id))
                    db.commit()
                    print("Session is completed, task is done, timer is stopped")
                    
                    
                    
                    return jsonify({"message": "Session is completed, timer stopped","is_pomodoro":False}), 200
                else:
                    cur.execute("UPDATE focus_sessions SET time_left =?, time_spent=? WHERE id=?",(time_left, time_spent, focus_session_id))
                    db.commit()
                    print(f'Timer is stopped,session_id:{focus_session_id},"time left":{time_left}')
                    print(time_spent)
                    return jsonify({"message":"Timer stopped, time_left updated","time_left":time_left, "is_pomodoro":False})



@app.route("/tasks", methods=["POST","GET"])
def tasks():
    db = get_db()
    cur = db.cursor()
    
    print(f"Session in tasks route: {session}") 
    user_id =session.get("user_id")
    print(session.get("user_id"))

    # print(user_id)
    if request.method=="GET":
        print(request.cookies)
        cur.execute('SELECT * FROM tasks WHERE user_id =?',(user_id,))
        tasks_rows = cur.fetchall()
        tasks_list =[]
        for task in tasks_rows:
            print(task)
            task_dict={ 
                "id":task[0],
                "title":task[1],
                "duration":task[2]      
            }
            tasks_list.append(task_dict)
        
        return jsonify(tasks_list)
    elif request.method=="POST":
        data=request.json
        if not data:
            return jsonify({"message":"Didnt receive any data about task"})
        title=data.get('title')
        duration=data.get('duration')
        status="in_process"
        
        cur.execute("INSERT INTO tasks (title, duration, status, user_id) VALUES (?,?,?,?) ",( title, duration,status, user_id))
        db.commit()
        task_id = cur.lastrowid
        print (task_id)
        cur.execute("SELECT id, title, duration FROM tasks WHERE id=?",(task_id,))
        task_result=cur.fetchone()
            # create a dictionary with column names as keys
        if task_result:
            new_task = {
                "id":task_result[0],
                "title": task_result[1],
                "duration": task_result[2]
            }
            return jsonify(new_task)
        else:
            return jsonify({"message":"Mistake when looking for the task id in database"})

    
@app.route("/tasks/<int:task_id>", methods=["PUT","DELETE"])
def handle_task(task_id):
    db = get_db()
    cur = db.cursor()
    user_id =session.get("user_id")
    if request.method=="PUT":
        data=request.json
        if data.get ("completed"):
            status='completed'
        else:
            status = 'in_process'
        cur.execute("UPDATE tasks SET status =? WHERE id =?",(status, task_id))
        cur.execute("SELECT * FROM tasks WHERE id =?",(task_id,))
        updated_task_row = cur.fetchone()
        print(updated_task_row)
        updated_task={}
        updated_task['id']=updated_task_row[0]
        updated_task['title']=updated_task_row[1]
        updated_task['duration']=updated_task_row[2]
        updated_task['status']=updated_task_row[3]
        return jsonify(updated_task),200
    elif request.method=="DELETE":
        cur.execute("DELETE FROM tasks WHERE id=?",(task_id,))
        db.commit()
        return jsonify({"message":"Task deleted"}), 200

    

@app.route("/stats", methods=["GET"])
def stats():
    db = get_db()
    cur = db.cursor()
    today=date.today()
    user_id =session.get("user_id")
    #daily data
    cur.execute("SELECT SUM(time_spent) FROM focus_sessions WHERE user_id = ? AND date = ?", (user_id, today))
    daily_duration = cur.fetchone()
    cur.execute("SELECT COUNT(*) FROM focus_sessions WHERE user_id = ? AND date = ? AND status ='completed'", (user_id, today))
    daily_sessions=cur.fetchone()
    print(daily_duration, daily_sessions)
    #weely data
    cur.execute("SELECT SUM(time_spent)FROM focus_sessions WHERE user_id = ? ",(user_id,))
    total_duration = cur.fetchone()
    cur.execute("SELECT COUNT(*) FROM focus_sessions WHERE user_id = ? AND status ='completed'", (user_id,))
    total_sessions=cur.fetchone()
    print(total_duration, total_sessions)
    return jsonify({
        'daily': {
            'duration': daily_duration or 0,
            'sessions': daily_sessions or 0
        },
        'allTime': {
            'duration': total_duration or 0,
            'sessions': total_sessions or 0
        }
    })

if __name__ == "__main__":
    app.run(use_reloader=True, debug=True)

    