#!/usr/bin/env python
'create_user'

import cgitb
import cgi
import sqlite3
import hashlib
import datetime
import functions

cgitb.enable()
NOW = datetime.datetime.now()
FORM = cgi.FieldStorage()

print 'Content-Type: text/html'
print
if "name" not in FORM or "email" not in FORM or "password" not in FORM or "confirm" not in FORM:
    print "error400" #do not change this line
else:
    RAWNAME = FORM['name'].value
    NAME = (RAWNAME,)
    RAWEMAIL = FORM['email'].value
    EMAIL = (RAWEMAIL,)
    RAWPASSWORD = FORM['password'].value
    PASSWORD = (RAWPASSWORD,)
    CONFIRM = FORM['confirm'].value

    if (len(RAWPASSWORD) < 6):
        print "length"
    elif (('1' not in RAWPASSWORD) and ('2' not in RAWPASSWORD) and ('3' not in RAWPASSWORD) and ('4' not in RAWPASSWORD) and ('5' not in RAWPASSWORD) and ('6' not in RAWPASSWORD) and ('7' not in RAWPASSWORD) and ('8' not in RAWPASSWORD) and ('9' not in RAWPASSWORD) and ('0' not in RAWPASSWORD)):
        print "number"
    elif (('!' not in RAWPASSWORD) and ('@' not in RAWPASSWORD) and ('#' not in RAWPASSWORD) and ('$' not in RAWPASSWORD) and ('%' not in RAWPASSWORD) and ('^' not in RAWPASSWORD) and ('&' not in RAWPASSWORD) and ('*' not in RAWPASSWORD)):
        print "special"
    else:
        # Create accounts database and users table if they do not exist
        CONN = sqlite3.connect('accounts.db')
        C = CONN.cursor()
        #now includes a column for login attempts
        C.execute('CREATE TABLE IF NOT EXISTS users(userName varchar(100) primary key, email varchar(100), password varchar(100), date varchar(100), ipAddress varchar(100), attempts INTEGER, locked INTEGER, friends varchar(255) )')
        C.execute('CREATE TABLE IF NOT EXISTS sessionId(username varchar(100) primary key, id varchar(100))')

        C.execute('SELECT * FROM users WHERE username=?', NAME)  # check username
        if C.fetchone() is not None:
            # Username already in use
            print "username taken" #do not change this line
        else:
            # Username is not in use
            C.execute('SELECT * FROM users WHERE email=?', EMAIL)  # check email
            if C.fetchone() is not None:
                # Email already in use
                print "email taken" # do not change this line
            else:
                # Username and email not already in use
                if functions.check_email(RAWEMAIL):
                    if RAWPASSWORD != CONFIRM:
                        print "error400" #do not change this
                    else:
                        # Hash password with date as salt
                        SALTED = RAWPASSWORD + str(NOW)
                        HASH = hashlib.sha224(SALTED).hexdigest()
                        # Insert into database
                        #now includes 5 as number of login attempts
                        # C.execute('CREATE TABLE IF NOT EXISTS " '+TEMPSTR+'"(ipAddress varchar(100), attempts2 INTEGER, locked2 INTEGER)')
                        C.execute('INSERT INTO users VALUES (?,?,?,?,?,?,?,?)', (RAWNAME, RAWEMAIL, HASH, str(NOW), None, 5, -2, ""))
                        TEMPID = "1"  # changed when log in
                        # Populate sessionId Table with default values
                        C.execute('INSERT INTO sessionID VALUES(?,?)', (RAWNAME, TEMPID))
                        print "success"
                else:
                    print "email format"

        # Commit and close database connection
        CONN.commit()
        CONN.close()