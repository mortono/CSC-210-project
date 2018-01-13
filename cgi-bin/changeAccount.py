#!/usr/bin/env python
'changeAccount'

import cgitb
import cgi
import os
import sqlite3
import hashlib
import time
import datetime
import functions

cgitb.enable()


NOW = datetime.datetime.now()
FORM = cgi.FieldStorage()

print 'Content-Type: text/html'
print

# Connect to database
CONN = sqlite3.connect('accounts.db')
C = CONN.cursor()

# if 'name' in FORM:
#     NAME = str(FORM['newname'].value)
# else:
#     NAME = None
if 'password' in FORM:
    PASS = str(FORM['password'].value)
else:
    PASS = None
if 'confirm' in FORM:
    CONF = str(FORM['confirm'].value)
else:
    CONF = None

ID = str(FORM['sessionid'].value)
#print "session id: " + ID
C.execute('SELECT username FROM sessionId WHERE id=?',(ID,))
USER = functions.get_raw_data(str(C.fetchone()))
#print USER


# if NAME != None: #filled in name field
#     C.execute('SELECT * FROM users WHERE username=?', (NAME,))  # check username
#     if C.fetchone() is not None:
#         # Username already in use
#         print "username taken"
#     else:
#         C.execute('UPDATE users SET userName =" ' + NAME + ' " WHERE email=?', (EMAIL,))
#         print NAME + " name success"

if (PASS != None) and (CONF != None): #filled in password fields
    #check password requirements
    if (len(PASS) < 6):
        print "length"
    elif (('1' not in PASS) and ('2' not in PASS) and ('3' not in PASS) and (
        '4' not in PASS) and ('5' not in PASS) and ('6' not in PASS) and (
        '7' not in PASS) and ('8' not in PASS) and ('9' not in PASS) and (
        '0' not in PASS)):
        print "number"
    elif (('!' not in PASS) and ('@' not in PASS) and ('#' not in PASS) and (
        '$' not in PASS) and ('%' not in PASS) and ('^' not in PASS) and (
        '&' not in PASS) and ('*' not in PASS)):
        print "special"
    elif (PASS != CONF):
        print "inequal"
    else:
        #salt, hash, and replace password
        SALTED = PASS + str(NOW)
        HASH = hashlib.sha224(SALTED).hexdigest()
        #EMAIL = EMAIL[0:len(EMAIL)-1]
        #print EMAIL + HASH
        C.execute('UPDATE users SET password=? WHERE userName=?', (HASH, USER))
        C.execute('UPDATE users SET date=? WHERE userName=?', (str(NOW), USER))
        #CONN.commit()
        #CONN.close()
        print "password success"

# Commit and close connection
CONN.commit()
CONN.close()