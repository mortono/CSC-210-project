#!/usr/bin/env python

# imports
import cgitb
import cgi
import sqlite3

# Get Form Information
cgitb.enable()
form = cgi.FieldStorage()

print 'Content-Type: text/html'
print

CONN = sqlite3.connect('accounts.db')
C = CONN.cursor()
C.execute('CREATE TABLE IF NOT EXISTS events(id INTEGER PRIMARY KEY AUTOINCREMENT, email varchar(100), title varchar(100), location varchar(100), sDate varchar(100), eDate varchar(100), sTime varchar(100), eTime varchar(100), repeat varchar(100), description varchar(100))')

if "owner" not in form or "location" not in form or "eDate" not in form or "sDate" not in form or "description" not in form or "sTime" not in form or "eTime" not in form or "repeat" not in form or "title" not in form:
    print "fillAllError" # do not change
else:
    EMAIL = form['owner'].value
    TITLE = form['title'].value
    LOCATION = form['location'].value
    SDATE = form['sDate'].value
    EDATE = form['eDate'].value
    STIME = form['sTime'].value
    ETIME = form['eTime'].value
    REPEAT = form['repeat'].value
    DESCRIPTION = form['description'].value
    C.execute('INSERT INTO events (email, title, location, sDate, eDate, sTime, eTime, repeat, description) VALUES (?,?,?,?,?,?,?,?,?)', (EMAIL, TITLE, LOCATION, SDATE, EDATE, STIME, ETIME, REPEAT, DESCRIPTION))
    C.execute('SELECT id FROM events WHERE title=?', (TITLE,))
    EID = C.fetchone()[0]
    MID = form['mid'].value
    GUESTLIST = form['guestList']

    C.execute('UPDATE Meetings SET eventId=? WHERE MID=?', (EID,MID))
    CONN.commit()
    CONN.close()
    print "eventCreated"
    #do the script
