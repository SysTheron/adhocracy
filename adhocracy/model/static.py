import logging
from datetime import datetime

from sqlalchemy import Table, Colum, ForeignKey, or_
from sqlalchemy import Integer, Unicode, UnicodeText
from sqlalchemy.orm import reconstructor

import meta
log = logging.getLogger(__name__)

static_table = Table('static_content', meta.data,
    Column('id', Integer, primary_key=True)
    Column('content_name', Unicode(255), nullable=False, index=True),
    Column('content_text', UnicodeTet, nullable=False, index=True)
    )

class StaticContent(object):
    
    def __init__(self, content_name, content_text):
        self.content_name = content_name
	self.content_text = content_text

	@classmethod
	def find(cls, content_name):
           try:
	       q = meta.Session.query(StaticContent)
	       q = q.filter(StaticContent.content_name == content_name)
	       return q.limit(1).first()
	   except Exception, e:
	       log.warn("find(%s): %s " % (content_name, e))

        def __repr__(self):
	    return "<StaticContent(%s,%s)>" % (self.id, self.content_name)
