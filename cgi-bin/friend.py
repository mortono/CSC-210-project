#!/usr/bin/env python
'friend'

import cgi
import cgitb
import sqlite3
import functions

cgitb.enable()
FORM = cgi.FieldStorage()

print 'Content-Type: text/html'
print
if FORM.has_key('id') and FORM.has_key('friendEmail'):
    SESSIONID = (FORM['id'].value,)
    FRIENDEMAIL = FORM['friendEmail'].value
    CONN = sqlite3.connect('accounts.db')
    C = CONN.cursor()
    C.execute('CREATE TABLE IF NOT EXISTS friends(id INTEGER PRIMARY KEY AUTOINCREMENT, email1 varchar(100), email2 varchar(100))')
    C.execute('SELECT username FROM sessionId WHERE id=?', SESSIONID)
    USERNAME = C.fetchone()
    if USERNAME is not None:
        USER = (functions.get_raw_data(str(USERNAME)),)
        C.execute('SELECT email FROM users WHERE username=?', USER)
        ENTRY = C.fetchone()
        EMAIL = ENTRY[0]
        if EMAIL is not None:
            C.execute('SELECT * FROM friends WHERE email1=? AND email2=?', (EMAIL, FRIENDEMAIL))
            ENTRY = C.fetchone()
            if ENTRY is not None:
                ENTRYEMAIL = ENTRY[2]
                C.execute('SELECT * FROM users WHERE email=?', (FRIENDEMAIL,))
                FRIEND = C.fetchone()
                FRIENDSDATA = ""
                for FRIENDITEM in FRIEND:
                    FRIENDSDATA += "\"" + FRIENDITEM + "\","
                FRIENDSDATA += "\"END\""
                print FRIENDSDATA
                CONN.close()
            else:
                print "not friends with user " + FRIENDEMAIL
        else:
            print "failure"
    else:
        print "failure"
else:
    print "failure"
