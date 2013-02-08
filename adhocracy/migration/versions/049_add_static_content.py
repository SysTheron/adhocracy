from sqlalchemy import MetaData, Column, Table
from sqlalchemy import DateTime, Integer, Unicode, UnicodeText

meta = MetaData()

static_table = Table('static_content', meta,
     Column('id', Integer, primary_key=True),
     Column('key', Unicode(40), nullable=False, index=True),
     Column('title', Unicode(255), nullable=False, index=True),
     Column('body', UnicodeText, nullable=False, index=True),
     Column('lang', Unicode(2), nullable=False, index=True)
     )

def upgrade(migrate_engine):
     meta.bind = migrate_engine
     requestlog_table.create()
 
def downgrade(migrate_engine):
     raise NotImplementedError()
