from sqlalchemy import MetaData, Column, Table
from sqlalchemy import DateTime, Integer, Unicode, UnicodeText

meta = MetaData()

static_table = Table('static_content', meta,
     Column('id', Integer, primary_key=True),
     Column('content_name', Unicode(255), nullable=False, index=True),
     Column('content_text', UnicodeText, nullable=False, index=True)
     )

def upgrade(migrate_engine):
     meta.bind = migrate_engine
     requestlog_table.create()
 
def downgrade(migrate_engine):
     raise NotImplementedError()
