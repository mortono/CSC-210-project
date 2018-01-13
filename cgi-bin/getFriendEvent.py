#!/usr/bin/env python

import cgitb
import cgi
import sqlite3
import datetime
from collections import namedtuple
import functions

cgitb.enable()
FORM = cgi.FieldStorage()

print 'Content-type: text/html'
print
if "id" not in FORM or "date" not in FORM or "friend" not in FORM or "mID" not in FORM:
    print "error400"
else:
    RAWID = FORM['id'].value
    ID = (RAWID,)
    RAWDATE = FORM['date'].value
    DATE = (RAWDATE,)
    RAWFRIENDEMAIL = FORM['friend'].value
    FRIENDEMAIL = (RAWFRIENDEMAIL,)
    RAWMID = FORM['mID'].value
    MID = (RAWMID,)

    dateAr = RAWDATE.split(':')
    month = dateAr[0]
    day = dateAr[1]
    year = dateAr[2]
    typeToGet = dateAr[3]

    startWeek = datetime.date(int(year), int(month), int(day))


    #d1 = datetime.date(int(year), int(month), int(day))


    CONN = sqlite3.connect('accounts.db')
    C = CONN.cursor()
    C.execute('SELECT username FROM sessionId WHERE id=?', ID)
    USERNAME = C.fetchone()
    if USERNAME is not None:
        USER = (functions.get_raw_data(str(USERNAME)),)
        C.execute('SELECT email FROM users WHERE username=?', USER)
        EMAIL = C.fetchone()
        RAWEMAIL = functions.get_raw_data(str(EMAIL))
        Q_EMAIL = (RAWEMAIL,)

        isFriends = 0
        C.execute('SELECT email2 FROM friends WHERE email1=?', EMAIL)
        for eachFriendEmail in C.fetchall():
            if RAWFRIENDEMAIL == eachFriendEmail[0]:
                isFriends = 1

        C.execute('CREATE TABLE IF NOT EXISTS MeetAccepted(MID INTEGER, email varchar(100), accepted INTEGER)')

        C.execute('SELECT accepted FROM MeetAccepted WHERE mID=? AND EMAIL=?', (RAWMID, RAWFRIENDEMAIL))
        result = C.fetchone()[0]

        if (str(result) != "1"):
            print "did not accept meeting"
            isFriends = 0


        #if they are friends, continue
        if (isFriends == 1):
            #get all events where email is equal to friends email
            C.execute('SELECT id FROM events WHERE email=?', FRIENDEMAIL)
            for row in C.fetchall():
                C.execute('SELECT sDate FROM events WHERE id=?', row)
                SDATE = functions.get_raw_data(str(C.fetchone()))

                sDateSplit = SDATE.split("/")
                sDateObj = datetime.date(int(sDateSplit[2]), int(sDateSplit[0]), int(sDateSplit[1]))  
                myTimeDelta = startWeek - sDateObj

                C.execute('SELECT eDate FROM events WHERE id=?', row)
                EDATE = functions.get_raw_data(str(C.fetchone()))

                eDateSplit = EDATE.split("/")
                eDateObj = datetime.date(int(eDateSplit[2]), int(eDateSplit[0]), int(eDateSplit[1]))  

                C.execute('SELECT sTime FROM events WHERE id=?', row)
                STIME = functions.get_raw_data(str(C.fetchone()))
                C.execute('SELECT eTime FROM events WHERE id=?', row)
                ETIME = functions.get_raw_data(str(C.fetchone()))
                C.execute('SELECT repeat FROM events WHERE id=?', row)
                REPEAT = functions.get_raw_data(str(C.fetchone()))
                UUID = row[0]
                
                savedIDs = []
                #for each letter in repeat
                #check if it repeats during that week or not

                for letter in REPEAT:
                    if (letter != "0"):
                        #check if day is in this week
                        endWeek = startWeek + datetime.timedelta(days=7)
                        # print int(letter) * 7
                        if (typeToGet == "week"):
                            Range = namedtuple('Range', ['start', 'end'])
                            eventRange = Range(start=sDateObj,end=eDateObj)
                            weekRange = Range(start=startWeek, end=endWeek)
                            latest_start = max(weekRange.start, eventRange.start)
                            earliest_end = min(weekRange.end, eventRange.end)
                            overlap = (earliest_end - latest_start).days + 1
                            diff = sDateObj - startWeek
                            if overlap > 0 and UUID not in savedIDs and diff.days / 7 % int(letter) == 0:
                                if (UUID not in savedIDs):
                                    savedIDs.append(UUID)
                                    print str(UUID) + "," + RAWFRIENDEMAIL + "," + RAWFRIENDEMAIL + "," + "" + "," + SDATE + "," + EDATE + "," + STIME + "," + ETIME + "," + REPEAT + "," + ""

                #check if it exists during that week or not
                #this part works
                if (typeToGet == "week"):
                    if (int(myTimeDelta.days) <= -7 or int(myTimeDelta.days) > 0):
                        continue
                if (typeToGet == "day"):
                    if (sDateSplit[2] != year):
                        continue
                    if (int(sDateSplit[1]) != int(day)):
                        continue
                    if (sDateSplit[0] != month):
                        continue
                if (typeToGet == "month"):
                    if (sDateSplit[0] != month):
                        continue
                if (UUID not in savedIDs):
                    print str(UUID) + "," + RAWFRIENDEMAIL + "," + RAWFRIENDEMAIL + "," + "" + "," + SDATE + "," + EDATE + "," + STIME + "," + ETIME + "," + REPEAT + "," + ""
        #if they are not friends, return notFriends
        else:
            print "notFriends"
        #if they have no friends, return no Friends
        #else:
        #    print "noFriends"
    else:
        print "None400"
