#!/usr/bin/env python
'dashboard'

import cgitb
import cgi
import functions

cgitb.enable()
FORM = cgi.FieldStorage()

if "id" not in FORM:
    # there is no session id, go back to login
    functions.redirect('index.html')
