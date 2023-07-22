from flask import render_template, request

def get_current_page():
    req_path = str(request.path)
    return req_path.split('/')[-1]

def map_view():
    current_page = get_current_page()
    return render_template('map.html', current_page=current_page)

def fields_view():
    current_page = get_current_page()
    return render_template('fields.html', current_page=current_page)

def add_field_view():
    return render_template('add.field.html')