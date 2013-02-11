import re
import os.path

from lxml.html import parse, tostring
from pylons import config 
from pylons.i18n import _

from adhocracy.lib import util

class FileStaticPage(object):
    def __init__(self, body, title):
        self.title = title
        self.body = body

    @staticmethod
    def create(key, lang): 
       filename = util.get_path('page', os.path.basename(key) + u"." + lang + ".html")
       try:
            root = parse(filename)
       except TypeError as e:
            return None
       body = root.find('.//body')
       body.tag = 'span'
       title = root.find('.//title').text
       self = FileStaticPage(tostring(body), title)
       return self

def get_static_page(key, lang=''):
    if lang is '':
        lang = config.get('localhostguage')[:2]
    static_page = FileStaticPage.create(key, lang)
    return static_page
