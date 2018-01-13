#!/usr/bin/env python
'get_data_type'

import cgi
import cgitb
import sqlite3
import functions

cgitb.enable()
FORM = cgi.FieldStorage()

print 'Content-Type: text/html'
print
if FORM.has_key('id') and FORM.has_key('typeToReturn'):
    SESSIONID = (FORM['id'].value,)
    DATATYPE = FORM['typeToReturn'].value
    CONN = sqlite3.connect('accounts.db')
    C = CONN.cursor()
    C.execute('CREATE TABLE IF NOT EXISTS friends(id INTEGER PRIMARY KEY AUTOINCREMENT, email1 varchar(100), email2 varchar(100))')
    C.execute('SELECT username FROM sessionId WHERE id=?', SESSIONID)

    USERNAME = C.fetchone()
    if USERNAME is not None:
        USER = (functions.get_raw_data(str(USERNAME)),)
        if DATATYPE == "email":
            C.execute('SELECT email FROM users WHERE username=?', USER)
            EMAIL = C.fetchone()
            print functions.get_raw_data(str(EMAIL))
        elif DATATYPE == "friends":
            C.execute('SELECT email FROM users WHERE username=?', USER)
            EMAIL = C.fetchone()
            C.execute('SELECT email2 FROM friends WHERE email1=?', EMAIL)
            for row in C.fetchall():
                print row[0]
                
            CONN.commit()
            CONN.close()
        else:
            print 'Unsupported request!'
    else:
        print "None400"
else:
    print "None400"
