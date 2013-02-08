import logging
from datetime import datetime

from sqlalchemy import Table, Column, ForeignKey, or_
from sqlalchemy import Integer, Unicode, UnicodeText
from sqlalchemy.orm import reconstructor

import meta
log = logging.getLogger(__name__)

staticcontent_table = Table('static_content', meta.data,
    Column('id', Integer, primary_key=True),
    Column('key', Unicode(40), nullable=False, index=True),
    Column('title', Unicode(255), nullable=False, index=True),
    Column('body', UnicodeText, nullable=False, index=True),
    Column('lang', Unicode(2), nullable=False, index=True)
    )

class StaticContent(object):
    
    def __init__(self, title, key, body, lang):
        self.title = title
	self.body = body
        self.key = key
        self.lang = lang

    @staticmethod
    def find(key, lang):
        try:
            q = meta.Session.query(StaticContent)
	    q = q.filter(StaticContent.key == key)
            q = q.filter(StaticContent.lang == lang)
	    return q.one()
	except Exception, e:
	    log.warn("find(%s): %s " % (content_name, e))

    def __repr__(self):
	 return "<StaticContent(%s,%s)>" % (self.id, self.title)
