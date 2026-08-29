# Vercel maps this file to its matching /api/<name> route; the shared app in
# _quiz.py serves it. One file per route avoids a rewrite, which would replace
# the request path and hide the real route from the app.
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from _quiz import app

__all__ = ["app"]
