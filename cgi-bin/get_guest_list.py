#!/usr/bin/env python

import cgitb
import cgi
import sqlite3

cgitb.enable()
FORM = cgi.FieldStorage()

print 'Content-type: text/html'
print

if "mid" not in FORM:
    print "error400"
else:
    RAWID = FORM['mid'].value
    MID = (RAWID,)
    CONN = sqlite3.connect('accounts.db')
    C = CONN.cursor()
    C.execute('CREATE TABLE IF NOT EXISTS MeetAccepted(MID INTEGER, email varchar(100), accepted INTEGER)')
    C.execute('SELECT * FROM MeetAccepted WHERE MID=?', MID)
    GUESTLIST = C.fetchall()
    if GUESTLIST is not None:
        for row in GUESTLIST:
            MID = row[0]
            EMAIL = row[1]
            accepted = row[2]
            print EMAIL + "," + str(MID) + "," + str(accepted)
    else:
        print "nomeeting"
