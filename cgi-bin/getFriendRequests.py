#!/usr/bin/env python

import cgi
import cgitb
import sqlite3

print 'Content-type: text/html'
print

cgitb.enable()
FORM = cgi.FieldStorage()

if 'id' not in FORM:
    print 'error400'
else:
    SESSIONID = (FORM['id'].value,)

    CONN = sqlite3.connect('accounts.db')
    C = CONN.cursor()

    C.execute('CREATE TABLE IF NOT EXISTS requests(requester varchar(100), requestie varchar(100) )')

    #Get Username
    C.execute('SELECT userName FROM sessionId WHERE id=?', SESSIONID)
    user = C.fetchone()

    #Get outstanding friend requests for user
    C.execute('SELECT requester FROM requests WHERE requestie=?', user)
    NAMES = C.fetchall()

    if len(list(NAMES)) == 0:
        print "none"
    else:
        #get emails of requesters
        EMAILS = []
        for user in NAMES:
            C.execute('SELECT email FROM users WHERE userName=?', user)
            EMAILS.append(C.fetchone())
        #return list of users and their emails
        print NAMES
        print EMAILS


CONN.commit()
CONN.close()