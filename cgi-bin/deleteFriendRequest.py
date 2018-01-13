#!/usr/bin/env python

import cgi
import cgitb
import sqlite3

def tupleToStr(tup): 
    tup = list(tup)
    return tup[0]

cgitb.enable()
CONN = sqlite3.connect('accounts.db')
C = CONN.cursor()

print 'Content-type: text/html'
print

#get form data
FORM = cgi.FieldStorage()
SESSIONID = (FORM['id'].value,)
requester = (FORM['requester'].value,)

#get username
C.execute('SELECT username FROM sessionId WHERE id=?', SESSIONID)
requestie = C.fetchone()

print requester
print requestie

C.execute('DELETE FROM  requests WHERE requester=? AND requestie=?', (tupleToStr(requester), tupleToStr(requestie)))

CONN.commit()
CONN.close()
