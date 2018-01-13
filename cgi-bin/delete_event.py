#!/usr/bin/env python
'delete_event'

import cgitb
import cgi
import sqlite3

cgitb.enable()
FORM = cgi.FieldStorage()

print 'Content-Type: text/html'
print

CONN = sqlite3.connect('accounts.db')
C = CONN.cursor()

C.execute('DELETE FROM events WHERE id=?', (FORM['id'].value,))
CONN.commit()
CONN.close()
