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
if "id" not in FORM or "date" not in FORM:
    print "error400"
else:
    RAWID = FORM['id'].value
    ID = (RAWID,)
    RAWDATE = FORM['date'].value
    DATE = (RAWDATE,)

    dateAr = RAWDATE.split(':')
    month = dateAr[0]
    day = dateAr[1]
    year = dateAr[2]
    typeToGet = dateAr[3]

    startWeek = datetime.date(int(year), int(month), int(day))

    CONN = sqlite3.connect('accounts.db')
    C = CONN.cursor()


    C.execute('CREATE TABLE IF NOT EXISTS events(id INTEGER PRIMARY KEY AUTOINCREMENT, email varchar(100), title varchar(100), location varchar(100), sDate varchar(100), eDate varchar(100), sTime varchar(100), eTime varchar(100), repeat varchar(100), description varchar(100))')

    C.execute('SELECT username FROM sessionId WHERE id=?', ID)
    USERNAME = C.fetchone()
    if USERNAME is not None:
        USER = (functions.get_raw_data(str(USERNAME)),)
        C.execute('SELECT email FROM users WHERE username=?', USER)
        EMAIL = C.fetchone()
        RAWEMAIL = functions.get_raw_data(str(EMAIL))
        Q_EMAIL = (RAWEMAIL,)
        C.execute('SELECT id FROM events WHERE email=?', Q_EMAIL)
        for row in C.fetchall():
            C.execute('SELECT title FROM events WHERE id=?', row)
            TITLE = functions.get_raw_data(str(C.fetchone()))
            C.execute('SELECT location FROM events WHERE id=?', row)
            LOCATION = functions.get_raw_data(str(C.fetchone()))
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
            C.execute('SELECT description FROM events WHERE id=?', row)
            DESC = functions.get_raw_data(str(C.fetchone()))
            UUID = row[0]
            

            #for each letter in repeat
            #check if it repeats during that week or not
            savedIDs = []

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
                                print str(UUID) + "," + RAWEMAIL + "," + TITLE + "," + LOCATION + "," + SDATE + "," + EDATE + "," + STIME + "," + ETIME + "," + REPEAT + "," + DESC

            #check if it exists during that week or not
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
                print str(UUID) + "," + RAWEMAIL + "," + TITLE + "," + LOCATION + "," + SDATE + "," + EDATE + "," + STIME + "," + ETIME + "," + REPEAT + "," + DESC
    else:
        print "None400"
