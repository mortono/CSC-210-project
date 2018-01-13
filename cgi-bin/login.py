#!/usr/bin/env python
'login'

import cgitb
import cgi
import os
import sqlite3
import hashlib
import time
import datetime
import functions

cgitb.enable()
NOW = datetime.datetime.now()
FORM = cgi.FieldStorage()

print 'Content-Type: text/html'
print
if "email" not in FORM or "password" not in FORM or "id" not in FORM:
    print "error"
    #functions.login_error('Please enter an email and password or <a href="../signup.html">create an account</a>.')
else:
    RAWEMAIL = FORM['email'].value
    EMAIL = (RAWEMAIL,)
    PASSWORD = FORM['password'].value

    # Connect to database
    CONN = sqlite3.connect('accounts.db')
    C = CONN.cursor()

    C.execute('CREATE TABLE IF NOT EXISTS users(userName varchar(100) primary key, email varchar(100), password varchar(100), date varchar(100), ipAddress varchar(100), attempts INTEGER, locked INTEGER, friends varchar(255) )')
    C.execute('CREATE TABLE IF NOT EXISTS sessionId(username varchar(100) primary key, id varchar(100))')

    C.execute('SELECT * FROM users WHERE email=?', EMAIL)
    if C.fetchone() is None:
        # Email is not in use
        print "email400" # do not change
        #functions.login_error('There is no account with that email.')
    else:
        # Email is in use

        # get ip address
        IPADDRESS = str(cgi.escape(os.environ["REMOTE_ADDR"]))

        # old ~~~~~~
        # #retrieve username for that email
        # C.execute('SELECT userName FROM users WHERE email=?', EMAIL)
        # UN = C.fetchone()
        # UNIP = str(UN) + 'ip'
        # print IPADDRESS
        # #ready to check attempts for that ip address
        #
        # ##oldC.execute('CREATE TABLE IF NOT EXISTS " ' + UNIP + ' "(ipAddress varchar(100), attempts2 INTEGER, locked2 INTEGER)')
        # ##oldC.execute('SELECT * FROM " ' + UNIP + ' " WHERE ipAddress=?', (IPADDRESS,))
        # #print str(C.fetchone()) + "here here"
        # if (C.fetchone()) is not None:
        #     #that ip address has tried logging in bc it exists and we can look for attempts
        #     # C.execute('INSERT INTO ' + UNIP + ' VALUES (?,?)', IPADDRESS, 5)
        #     # #adds ip address
        #
        #     C.execute('SELECT attempts2 FROM " ' + UNIP + ' " WHERE ipAddress=?', (IPADDRESS,))
        #     ATTEMPTS2 = int(functions.get_raw_data_int(str(C.fetchone())))
        #     #print ATTEMPTS2
        #     if (ATTEMPTS2 <= 0):
        #         # they've run out of login attempts
        #         CURRENT2 = int(time.time())
        #
        #         C.execute('SELECT locked2 FROM " ' + UNIP + ' " WHERE ipAddress=?', (IPADDRESS,))
        #         LOCKEDDB2 = int(functions.get_raw_data_int(str(C.fetchone())))
        #
        #         # if they havent been timed out yet
        #         if (LOCKEDDB2 == -2):
        #             C.execute('UPDATE " ' + UNIP + ' " SET locked2=" ' + str(CURRENT2) + ' " WHERE ipAddress=?', (IPADDRESS,))
        #             C.execute('SELECT locked2 FROM " ' + UNIP + ' " WHERE ipAddress=?', (IPADDRESS,))
        #             LOCKEDDB2 = int(functions.get_raw_data_int(str(C.fetchone())))
        #
        #         # print "locked" + str(ATTEMPTS) + " lockeddb " + str(LOCKEDDB) + " curr " + str(CURRENT)
        #
        #         #CHECK IF ENOUGH TIME has elapsed
        #         if ((CURRENT2 - LOCKEDDB2) > 3600):
        #             #enough time has gone by, removes the ip address from list of those being checked for attempts
        #             C.execute('DELETE FROM " ' + UNIP + ' " WHERE ipAddress=?', (IPADDRESS,))
        #         else:
        #             #not enough time has gone by, resets beginning of waiting period to current time
        #             C.execute('UPDATE " ' + UNIP + ' " SET locked2=" ' + str(CURRENT2) + ' " WHERE ipAddress=?', (IPADDRESS,))
        #             # and don't allow the redirect
        #             print "locked" + str(ATTEMPTS2)
        #~~~~~~~

        #check for login attempts
        C.execute('SELECT attempts FROM users WHERE email=? AND ipAddress=?', (RAWEMAIL, IPADDRESS))

        #has that ip address tried logging in yet, and how many times
        RAWATTEMPTS = C.fetchone()
        if RAWATTEMPTS is None:
            C.execute('INSERT INTO users (email, ipAddress, attempts, locked) VALUES (?,?,?,?)', (RAWEMAIL, IPADDRESS, 5, -2))
            C.execute('SELECT attempts FROM users WHERE email=? AND ipAddress=?', (RAWEMAIL, IPADDRESS))
            RAWATTEMPTS = C.fetchone()

        locked = False
        ATTEMPTS = int(functions.get_raw_data_int(str(RAWATTEMPTS)))
        #print ATTEMPTS
        if (ATTEMPTS <= 0):
            #they've run out of login attempts

            CURRENT = int(time.time())
            C.execute('SELECT locked FROM users WHERE email=? AND ipAddress=?', (RAWEMAIL, IPADDRESS))
            LOCKEDDB = int(functions.get_raw_data_int(str(C.fetchone())))

            # if this is their first time getting locked out but not really, weird to explain
            if (LOCKEDDB == -2):
                C.execute('UPDATE users SET locked=" ' + str(CURRENT) + ' " WHERE email=? AND ipAddress=?', (RAWEMAIL, IPADDRESS))
                C.execute('SELECT locked FROM users WHERE email=? AND ipAddress=?', (RAWEMAIL, IPADDRESS))
                LOCKEDDB = int(functions.get_raw_data_int(str(C.fetchone())))

            #print "locked" + str(ATTEMPTS) + " lockeddb " + str(LOCKEDDB) + " curr " + str(CURRENT)


            #check if enough time has elapsed
            if ((CURRENT-LOCKEDDB) > 3600000):
                #print CURRENT
                #print LOCKEDDB
                C.execute('UPDATE users SET locked=-2 WHERE email=? AND ipAddress=?', (RAWEMAIL, IPADDRESS))
                C.execute('UPDATE users SET attempts=5 WHERE email=? AND ipAddress=?', (RAWEMAIL, IPADDRESS))
                C.execute('SELECT attempts FROM users WHERE email=? AND ipAddress=?', (RAWEMAIL, IPADDRESS))
                ATTEMPTS = int(functions.get_raw_data_int(str(C.fetchone())))
            else:
                C.execute('UPDATE users SET locked=" ' + str(CURRENT) + ' " WHERE email=? AND ipAddress=?', (RAWEMAIL, IPADDRESS))
                #and don't allow the redirect
                locked = True
                print "locked" + str(ATTEMPTS)

        C.execute('SELECT date FROM users WHERE email=?', EMAIL)

        # Get Date from db
        DATE = C.fetchone()
        DATE = functions.get_raw_data(str(DATE))

        # Create password hash
        PREHASH = PASSWORD + DATE
        HASH = hashlib.sha224(PREHASH).hexdigest()

        # Check if passwordHashed is equal to password entered
        C.execute('SELECT password FROM users WHERE email=?', EMAIL)
        PWDB = C.fetchone()
        if (functions.get_raw_data(str(PWDB)) == HASH and locked == False):
            # Login successful
            C.execute('SELECT username FROM users WHERE email=?', EMAIL)
            USERNAME = C.fetchone()
            USERNAME = functions.get_raw_data(str(USERNAME))

            C.execute('UPDATE users SET attempts=5 WHERE email=? AND ipAddress=?', (RAWEMAIL, IPADDRESS))

            # Create a session id and enter into database sessionId
            NEWID = str(FORM['id'].value)
            C.execute('UPDATE sessionId SET id=? WHERE username=?', (NEWID, USERNAME))
            print "success"
            #functions.login_success(NEWID)
        else:
            # Login not successful

            #functions.login_error('Login attempt failed. Password and email do not match.')

            # old ~~~~~~~
            # # retrieves number of attempts left
            # C.execute('SELECT * FROM " ' + UNIP + ' " WHERE ipAddress=?', (IPADDRESS,))
            # if C.fetchone() is None:
            #     C.execute('INSERT INTO " ' + UNIP + ' " VALUES (?,?,?)', (IPADDRESS, 5, -2))
            # C.execute('SELECT attempts2 FROM " ' + UNIP + ' " WHERE ipAddress=?', (IPADDRESS,))
            # ATTEMPTSLEFT = functions.get_raw_data_int(str(C.fetchone()));
            # print "incorrect" + str(ATTEMPTSLEFT)
            # C.execute('UPDATE " ' + UNIP + ' " SET attempts2 = (attempts2)-1 WHERE ipAddress=?', (IPADDRESS,))
            # #~~~~~~~

            #retrieves and updates number of attempts left
            C.execute('SELECT attempts FROM users WHERE email=? AND ipAddress=?', (RAWEMAIL, IPADDRESS))
            ATTEMPTSLEFT = functions.get_raw_data_int(str(C.fetchone()))
            print "incorrect" + str(ATTEMPTSLEFT)
            C.execute('UPDATE users SET attempts = attempts-1 WHERE email=? AND ipAddress=?', (RAWEMAIL, IPADDRESS))
    # Commit and close connection
    CONN.commit()
    CONN.close()
