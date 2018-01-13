#!/usr/bin/env python
'friendlist'

import cgi
import cgitb
import sqlite3
from collections import OrderedDict
import functions

cgitb.enable()
FORM = cgi.FieldStorage()   

print 'Content-Type: text/html'
print
if FORM.has_key('id') and FORM.has_key('type'):
    SESSIONID = (FORM['id'].value,)
    TYPE = FORM['type'].value
    if FORM.has_key('friendEmail'):
        FRIENDEMAIL = (FORM['friendEmail'].value,)
    CONN = sqlite3.connect('accounts.db')
    C = CONN.cursor()

    C.execute('CREATE TABLE IF NOT EXISTS friends(id INTEGER PRIMARY KEY AUTOINCREMENT, email1 varchar(100), email2 varchar(100))')

    C.execute('SELECT username FROM sessionId WHERE id=?', SESSIONID)
    USERNAME = C.fetchone()
    if USERNAME is not None:
        C.execute('SELECT email FROM users WHERE username=?', USERNAME)
        EMAIL = C.fetchone()
        if EMAIL is not None:
            if TYPE == "get":
                C.execute('SELECT email2 FROM friends WHERE email1=?', EMAIL)
                for row in C.fetchall():
                    print row[0]
                CONN.commit()
                CONN.close()
            elif TYPE == "remove":
                C.execute('DELETE FROM friends WHERE email1=? AND email2=?', (EMAIL[0], FRIENDEMAIL[0]))
                C.execute('DELETE FROM friends WHERE email2=? AND email1=?', (EMAIL[0], FRIENDEMAIL[0]))
                print "success"
                CONN.commit()
                CONN.close()
            elif TYPE == "add":
                C.execute('SELECT username FROM users WHERE email=?', FRIENDEMAIL)
                if C.fetchone() is not None:
                    C.execute('SELECT id FROM friends WHERE email1=? AND email2=?', (EMAIL[0], FRIENDEMAIL[0]))
                    if C.fetchone() is None:
                        C.execute('INSERT INTO friends (email1, email2) VALUES (?,?)', (EMAIL[0], FRIENDEMAIL[0]))
                        C.execute('INSERT INTO friends (email1, email2) VALUES (?,?)', (FRIENDEMAIL[0], EMAIL[0]))
                        print "success"
                    else:
                        print "duplicate"
                else:
                    print "DNE"
                CONN.commit()
                CONN.close()
            else:
                print "oppos"
                CONN.commit()
                CONN.close()

        #USER = (functions.get_raw_data(str(USERNAME)),)
        #C.execute('SELECT friends FROM users WHERE username=?', USER)
        #ENTRY = C.fetchone()
        #DATA = functions.get_raw_data_friendlist(str(ENTRY))
        #FRIENDSLIST = DATA.split(',')
        #if TYPE == "get":
            #print FRIENDSLIST[0 : len(FRIENDSLIST) - 1]
        #else:
            #RAWEMAIL = functions.get_raw_data_friend(str(FRIENDEMAIL))
            #RAWEMAIL = str.lower(RAWEMAIL)
            #OGLEN = len(FRIENDSLIST)
            #if TYPE == "add":
                #C.execute('SELECT * FROM users WHERE email=?', (RAWEMAIL,))
                #ENTRY = C.fetchone()
                #if ENTRY is not None:
                #    FRIENDSLIST.append(RAWEMAIL)
                #else:
                #    print "DNE"
            #elif TYPE == "remove":
                #FRIENDSLIST.remove(RAWEMAIL)
            #FRIENDSLIST = list(OrderedDict.fromkeys(FRIENDSLIST))
            #if len(FRIENDSLIST) == OGLEN:
            #    print "duplicate"
            ##NEWDATA = ""
            #f##or FRIEND in FRIENDSLIST:
            #    if functions.check_email(FRIEND):
            #        NEWDATA += FRIEND
            #        NEWDATA += ','
            #PARAMETERS = (NEWDATA, functions.get_raw_data(str(USERNAME)))
            #C.execute('UPDATE users SET friends=? WHERE username=?', PARAMETERS)
            #CONN.commit()
            #CONN.close()
            #print "success"
        else:
            print "failure"
    else:
        print "failure"
else:
    print "failure"
