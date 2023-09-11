from flask import render_template

def auth_view():
    return render_template('login.html')