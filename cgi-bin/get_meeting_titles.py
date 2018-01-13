#!/usr/bin/env python

import cgitb
import cgi
import sqlite3
import functions

cgitb.enable()
FORM = cgi.FieldStorage()

print 'Content-type: text/html'
print
if "id" not in FORM:
    print "error400"
else:
    RAWID = FORM['id'].value
    ID = (RAWID,)

    CONN = sqlite3.connect('accounts.db')
    C = CONN.cursor()

    C.execute('CREATE TABLE IF NOT EXISTS Meetings(MID INTEGER PRIMARY KEY AUTOINCREMENT, title varchar(100), location varchar(100), sTime varchar(100), eTime varchar(100), sDate varchar(100), eDate varchar(100), duration varchar(100), repeat varchar(100), description varchar(100), eventId INTEGER, guestList varchar(500), owner varchar(100))')
    C.execute('CREATE TABLE IF NOT EXISTS MeetAccepted(MID INTEGER, email varchar(100), accepted INTEGER)')

    C.execute('SELECT username FROM sessionId WHERE id=?', ID)
    USERNAME = C.fetchone()
    if USERNAME is not None:
        USER = (functions.get_raw_data(str(USERNAME)),)
        C.execute('SELECT email FROM users WHERE username=?', USER)
        EMAIL = C.fetchone()
        RAWEMAIL = functions.get_raw_data(str(EMAIL))
        Q_EMAIL = (RAWEMAIL,)

        C.execute('SELECT MID,accepted FROM MeetAccepted WHERE email=?', Q_EMAIL)
        for row in C.fetchall():
            MID = row[0]
            Q_MID = (MID,)
            accepted = row[1]

            C.execute('SELECT title FROM Meetings WHERE MID=?', Q_MID)
            TITLE = C.fetchone()[0]
            
            print TITLE + "," + str(MID) + "," + str(accepted)
    else:
        print "nousername"
