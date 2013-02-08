import re
import os.path

from lxml.html import parse, tostring
from pylons import tmpl_context as c
from pylons.i18n import _
from pylons import config
from paste.deploy.converters import asbool
from adhocracy.model import meta
import adhocracy.model as model

from adhocracy.lib import util

class FileStaticPage(object):
    def __init__(self, body, title):
        self.title = title
        self.body = body

    @staticmethod
    def create(key, lang): 
        try:
            filename = util.get_path('page', os.path.basename(key) + u"." + lang + ".html")
            root = parse(filename)
        except Exception, e:
            return None
        body = root.find('.//body')
        body.tag = 'span'
        title = root.find('.//title').text
        self = FileStaticPage(tostring(body), title)
        return self

def get_static_page(key, lang='en'):
    config_value = config.get('adhocracy.static_page_source', 'file') 
    if config_value == 'file':
        static_page = FileStaticPage.create(key, lang)
    elif config_value == 'database':
	static_page = model.StaticContent.find(key, lang)
    return static_page
