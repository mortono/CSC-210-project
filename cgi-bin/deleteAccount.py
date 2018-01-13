#!/usr/bin/env python
'deleteAccount'

import cgitb
import cgi
import os
import sqlite3
import functions

cgitb.enable()
FORM = cgi.FieldStorage()


print 'Content-Type: text/html'
print

# Connect to database
CONN = sqlite3.connect('accounts.db')
C = CONN.cursor()
C.execute('CREATE TABLE IF NOT EXISTS users(userName varchar(100) primary key, email varchar(100), password varchar(100), date varchar(100), ipAddress varchar(100), attempts INTEGER, locked INTEGER, friends varchar(255) )')

ID = str(FORM['sessionid'].value)
print "session id: " + ID
C.execute('SELECT username FROM sessionId WHERE id=?',(ID,))
USER = functions.get_raw_data(str(C.fetchone()))
print " user: " + USER
C.execute('SELECT email FROM users WHERE userName=?',(USER,))
TEMP = str(C.fetchone())
print TEMP
EMAIL = functions.get_raw_data(TEMP)
print "email: " + EMAIL


C.execute('DELETE FROM users WHERE email=?', (EMAIL,))
print "deleted"

# Commit and close connection
CONN.commit()
CONN.close()