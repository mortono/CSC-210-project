#!/usr/bin/env python
'functions'

def check_email(input_email):
    'checkEmail(input_email): True if email formatted validly, False if email not fomatted validly'
    if len(input_email) > 6:
        if "." not in input_email:
            return False
        if "@" not in input_email:
            return False
        return True
    else:
        return False

def redirect(website):
    'redirect(website): redirect to a given website'
    print 'Content-Type: text/html'
    print
    print '''
    <html>
        <head>
            <meta http-equiv="refresh" content="0;url=../''' + website + '''" />
        </head>
    </html>'''

def redirect_html(website):
    'redirect_html(website): redirects without printing new headers'
    print '''
    <html>
        <head>
            <meta http-equiv="refresh" content="0;url=../''' + website + '''" />
        </head>
    </html>'''

def login_success(unique_id):
    'login_success(unique_id): sets cookie and redirects user to dashboard'
    print 'Content-Type: text/html'
    print 'Set-Cookie: id=' + unique_id
    print
    redirect_html('dashboard.html')

def login_error(message):
    'login_error(message): redirects to the login page and displays an error'
    redirect('index.html?err=' + message)

def create_success(message):
    'create_success(message): redirects to the login page and displays a message'
    redirect('index.html?msg=' + message)

def create_error(message):
    'create_error(message): redirects to the signup page and displays an error'
    redirect('signup.html?err=' + message)

def get_raw_data(input_data):
    'get_raw_data(input_data): get raw data from input_data'
    new_string = input_data[3 : len(input_data) - 3]
    return new_string

def get_raw_data_int(input_data):
    new_string = input_data[1: len(input_data) - 2]
    return new_string

def get_raw_data_friend(input_data):
    new_string = input_data[2 : len(input_data) - 3]
    return new_string
