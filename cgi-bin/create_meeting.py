#!/usr/bin/env python

import cgitb
import cgi
import sqlite3

cgitb.enable()
form = cgi.FieldStorage()

print 'Content-Type: text/html'
print

CONN = sqlite3.connect('accounts.db')
C = CONN.cursor()
C.execute('CREATE TABLE IF NOT EXISTS Meetings(MID INTEGER PRIMARY KEY AUTOINCREMENT, title varchar(100), location varchar(100), sTime varchar(100), eTime varchar(100), sDate varchar(100), eDate varchar(100), duration varchar(100), repeat varchar(100), description varchar(100), eventId INTEGER, guestList varchar(500), owner varchar(100))')
C.execute('CREATE TABLE IF NOT EXISTS MeetAccepted(MID INTEGER, email varchar(100), accepted INTEGER)')

if "owner" not in form or "location" not in form or "eDate" not in form or "sDate" not in form or "description" not in form or "sTime" not in form or "eTime" not in form or "repeat" not in form or "title" not in form or "guestList" not in form or "duration" not in form:
    print "fillAllError" # do not change
else:
    OWNER = form['owner'].value
    TITLE = form['title'].value
    queryTitle = (TITLE,)
    LOCATION = form['location'].value
    SDATE = form['sDate'].value
    EDATE = form['eDate'].value
    STIME = form['sTime'].value
    ETIME = form['eTime'].value
    REPEAT = form['repeat'].value
    DESCRIPTION = form['description'].value
    GUESTLIST = form['guestList'].value
    EVENTID = -2
    DURATION = form['duration'].value

    C.execute('INSERT INTO Meetings (title, location, sTime, eTime, sDate, eDate, duration, repeat, description, eventId, guestList, owner) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)', (TITLE, LOCATION, STIME, ETIME, SDATE, EDATE, DURATION, REPEAT, DESCRIPTION, EVENTID, GUESTLIST, OWNER))

    C.execute('SELECT MID FROM Meetings WHERE title=?', queryTitle)
    meetingID = C.fetchone()[0]

    splitGuests = GUESTLIST.split(":")

    C.execute('INSERT INTO MeetAccepted(MID, email, accepted) VALUES (?,?,?)', (meetingID, OWNER, 1))
    for guest in splitGuests:
        if (guest != ""):

            #make sure the username is an actual account
            C.execute('SELECT username FROM users WHERE email=?', (guest,))
            if C.fetchone is not None:
                C.execute('INSERT INTO MeetAccepted(MID, email, accepted) VALUES (?,?,?)', (meetingID, guest, 0))


    CONN.commit()
    CONN.close()
    print "eventCreated"

