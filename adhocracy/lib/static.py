import re
import os.path

from lxml.html import parse, tostring
from pylons import config 

from adhocracy import i18n
from adhocracy.lib import util

class FileStaticPage(object):
    def __init__(self, body, title):
        self.title = title
        self.body = body

    @staticmethod
    def create(key, lang): 
       filename = util.get_path('page', os.path.basename(key) + "." + lang + ".html")
       try:
            root = parse(filename)
       except TypeError as e:
            return None
       body = root.find('.//body')
       body.tag = 'span'
       title = root.find('.//title').text
       self = FileStaticPage(tostring(body), title)
       return self

def get_static_page(key, lang=None):
    if lang is None:
        lang = str(i18n.get_default_locale())[:2]
    static_page = FileStaticPage.create(key, lang)
    return static_page
