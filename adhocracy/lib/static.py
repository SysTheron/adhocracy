import re
import os.path

from lxml.html import parse, tostring
from pylons import config 

from adhocracy import i18n
from adhocracy.lib import util
from pylons import tmpl_context as c

class FileStaticPage(object):
    def __init__(self, body, title):
        self.title = title
        self.body = body

    @staticmethod
    def create(key, lang): 
       filename = util.get_path('page', os.path.basename(key) + "." + lang + ".html")
       if filename is None:
           return None
       else:
           try: 
               root = parse(filename)
	   except IOError as e:
	       return None
       try: 
           body = root.find('.//body')
           body.tag = 'span'
           title = root.find('.//title').text
           return FileStaticPage(tostring(body), title)
       except AttributeError as e:
           return None

def get_static_page(key, lang=None):
    if lang is None:
        for locale in ([c.locale, i18n.get_default_locale()] + i18n.LOCALES):
            lang = locale.language
            return FileStaticPage.create(key, lang)
    else:
        return FileStaticPage.create(key, lang)
