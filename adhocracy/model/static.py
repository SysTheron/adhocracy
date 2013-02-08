import logging
from datetime import datetime

from sqlalchemy import Table, Colum, ForeignKey, or_
from sqlalchemy import Integer, Unicode, UnicodeText
from sqlalchemy.orm import reconstructor

import meta
log = logging.getLogger(__name__)

static_table = Table('static_content', meta.data,
    Column('id', Integer, primary_key=True),
    Column('title', Unicode(255), nullable=False, index=True),
    Column('body', UnicodeText, nullable=False, index=True)
    )

class StaticContent(object):
    
    def __init__(self, title, body):
        self.title = body
	self.title = body

	@classmethod
	def find(cls, title):
           try:
	       q = meta.Session.query(StaticContent)
	       q = q.filter(StaticContent.title == title)
	       return q.limit(1).first()
	   except Exception, e:
	       log.warn("find(%s): %s " % (content_name, e))

        def __repr__(self):
	    return "<StaticContent(%s,%s)>" % (self.id, self.title)
