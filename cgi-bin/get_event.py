#!/usr/bin/env python

import cgitb
import cgi
import sqlite3

cgitb.enable()
FORM = cgi.FieldStorage()

print 'Content-Type: text/html'
print
#if 'mid' not in FORM: #shuld add check for your sessionID later
    #print FORM['mid'].value
    #print "fillAll"
#else:
RAWMID = FORM['id'].value
ID = (RAWMID,)

CONN = sqlite3.connect('accounts.db')
C = CONN.cursor()

C.execute('SELECT * FROM events WHERE ID=?', ID)

ROW = C.fetchone()

if ROW is not None:
    RAWEMAIL = str(ROW[1])
    TITLE = str(ROW[2])
    LOCATION = str(ROW[3])
    SDATE = str(ROW[4])
    EDATE = str(ROW[5])
    STIME = str(ROW[6])
    ETIME = str(ROW[7])
    REPEAT = str(ROW[8])
    DESC = str(ROW[9])
    print RAWMID + "," + RAWEMAIL + "," + TITLE + "," + LOCATION + "," + SDATE + "," + EDATE + "," + STIME + "," + ETIME + "," + REPEAT + "," + DESC

else:
    print "error400"
