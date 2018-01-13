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
FORM = cgi.FieldStorage()

print 'Content-type: text/html'
print

#Get Info from form
if 'id' in FORM and 'friendEmail' in FORM:
    RAWFRIENDEMAIL = FORM['friendEmail'].value
    anotherFriendEmail = (RAWFRIENDEMAIL,)

    FRIENDEMAIL = (FORM['friendEmail'].value,)
    SESSIONID = (FORM['id'].value,)

    #Get requester username
    C.execute('SELECT userName FROM sessionId WHERE id=?', SESSIONID)
    requester = C.fetchone()

    C.execute('SELECT email FROM users WHERE username=?', requester)
    EMAIL = C.fetchone()[0]

    #Get requestie username
    C.execute('SELECT userName FROM users WHERE email=?', FRIENDEMAIL)
    requestie = C.fetchone()

    #Create friend request table if it doesn't exist 
    C.execute('CREATE TABLE IF NOT EXISTS requests(requester varchar(100), requestie varchar(100) )')
    C.execute('CREATE TABLE IF NOT EXISTS friends(id INTEGER PRIMARY KEY AUTOINCREMENT, email1 varchar(100), email2 varchar(100))')


    #Check to see if friend request is already present 
    C.execute('SELECT requestie FROM requests WHERE requester=? ', requester)
    userRequests = C.fetchall()


    #Error Handling 
    if requestie is None:
        print "DNE"
    elif requestie in userRequests:
        print "duplicate"
    elif (requester == requestie):
        print "addYourself"
    else:

        C.execute('SELECT id FROM friends WHERE email1=? AND email2=?', (RAWFRIENDEMAIL, EMAIL))
        if C.fetchone() is None:

            #adds requester and requestie
            C.execute('INSERT INTO requests VALUES(?,?)', (tupleToStr(requester), tupleToStr(requestie)))

            print tupleToStr(requestie)
        else:
            print "alreadyFriends"
else:
    print "fillAllError"
CONN.commit()
CONN.close()

