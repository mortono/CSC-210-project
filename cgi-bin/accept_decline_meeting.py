#!/usr/bin/env python

import cgitb
import cgi
import sqlite3
import functions

cgitb.enable()
FORM = cgi.FieldStorage()

print 'Content-type: text/html'
print
if "id" not in FORM or "mid" not in FORM or "type" not in FORM:
    print "error400"
else:
    RAWID = FORM['id'].value
    ID = (RAWID,)
    RAWMID = FORM['mid'].value
    MID = (RAWMID,)
    RAWTYPE = FORM['type'].value
    TYPE = (RAWTYPE,)

    CONN = sqlite3.connect('accounts.db')
    C = CONN.cursor()
    C.execute('SELECT username FROM sessionId WHERE id=?', ID)
    USERNAME = C.fetchone()
    if USERNAME is not None:
        USER = (functions.get_raw_data(str(USERNAME)),)
        C.execute('SELECT email FROM users WHERE username=?', USER)
        EMAIL = C.fetchone()
        RAWEMAIL = functions.get_raw_data(str(EMAIL))
        Q_EMAIL = (RAWEMAIL,)

        C.execute('UPDATE MeetAccepted SET accepted=? WHERE MID=? AND email=?', (int(RAWTYPE), int(RAWMID), RAWEMAIL))
        print "success"
    else:
        print "error200"
CONN.commit()
CONN.close()
