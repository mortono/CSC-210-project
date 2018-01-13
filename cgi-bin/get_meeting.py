#!/usr/bin/env python

import cgitb
import cgi
import sqlite3

cgitb.enable()
FORM = cgi.FieldStorage()

print 'Content-Type: text/html'
print

RAWMID = FORM['mid'].value
MID = (RAWMID,)

CONN = sqlite3.connect('accounts.db')
C = CONN.cursor()
C.execute('SELECT * FROM Meetings WHERE MID=?', MID)
ROW = C.fetchone()
if ROW is not None:
    MID = str(ROW[0])
    title = ROW[1]
    location = ROW[2]
    sTime = ROW[3]
    eTime = ROW[4]
    sDate = ROW[5]
    eDate = ROW[6]
    duration = str(ROW[7])
    repeat = str(ROW[8])
    description = ROW[9]
    eventId = str(ROW[10])
    guestList = str(ROW[11])
    owner = ROW[12]
    print MID + "," + title + "," + location + "," + sTime + "," + eTime + "," + sDate + "," + eDate + "," + duration + "," + repeat + "," + description + "," + eventId + "," + guestList + "," + owner
else:
    print "error400"
