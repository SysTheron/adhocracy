import re
import os.path

from lxml.html import parse, tostring
from pylons import tmpl_context as c
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
        except Exception as e:
            print e
            return None
        body = root.find('.//body')
        body.tag = 'span'
        title = root.find('.//title').text
        self = FileStaticPage(tostring(body), title)
        return self

def get_static_page(key, lang='de'):
    static_page = FileStaticPage.create(key, lang)
    return static_page
