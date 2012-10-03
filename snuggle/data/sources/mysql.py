import MySQLdb, MySQLdb.cursors, sys

from .. import types

class MySQL:
	
	def __init__(self, *args, **kwargs):
		kwargs.update({'cursorclass': MySQLdb.cursors.SSDictCursor})
		self.changes_conn = MySQLdb.connect(*args, **kwargs)
		
		kwargs.update({'cursorclass': MySQLdb.cursors.DictCursor})
		self.conn = MySQLdb.connect(*args, **kwargs)
	
	def changes(self, since, limit=None):
		cursor = self.changes_conn.cursor()
		cursor.execute(
			"""
			SELECT
				rc_id,
				UNIX_TIMESTAMP(rc_timestamp) as timestamp,
				rc_log_type   as log_type,
				rc_log_action as log_action,
				rc_user       as user_id,
				rc_user_text  as user_name,
				rc_cur_id     as page_id,
				rc_title      as page_title,
				rc_namespace  as page_namespace,
				rc_comment    as comment,
				rc_minor      as minor,
				rc_this_oldid as rev_id,
				rc_old_len    as old_len,
				rc_new_len    as new_len,
				rev_sha1      as sha1
			FROM enwiki.recentchanges
			LEFT JOIN enwiki.revision ON rc_this_oldid = rev_id
			WHERE rc_id > %(rc_id)s AND
			(
				(rc_log_type = "newusers" AND rc_log_action = "create") OR
				rc_this_oldid IS NOT NULL AND rc_this_oldid != 0
			)
			ORDER BY rc_id ASC
			LIMIT %(limit)s
			""",
			{
				'rc_id': since,
				'limit': limit if limit != None else sys.maxint
			}
		)
		
		for row in cursor:
			if row['rev_id'] != None:
				yield Change.fromRow(row)
			
		
	def history(self, pageId, revId, n):
		cursor = self.conn.cursor()
		cursor.execute(
			"""
				SELECT
					rev_id,
					rev_sha1 as sha1
				FROM revision
				WHERE rev_page = %(page_id)s
				AND rev_id < %(rev_id)s
				ORDER BY rev_id DESC
				LIMIT %(limit)s;
			""",
			{
				'page_id': pageId,
				'rev_id':  revId,
				'limit':   n
			}
		)
		
		history = {}
		for row in reversed(cursor.fetchall()):
			history[row['sha1']] = int(row['rev_id'])
			
		return history
	
	@staticmethod
	def fromConfig(config, section):
		kwargs = {}
		for key, value in config.items(section):
			if key not in ("module"):
				kwargs[key] = value
			
		
		return MySQL(**kwargs)

class Change(types.Change):
	
	@staticmethod
	def fromRow(row):
		if row['log_type'] == "newusers":
			type = "new user"
			change = NewUser.fromRow(row)
		else:
			type = "new revision"
			change = Revision.fromRow(row)
		
		return Change(
			row['rc_id'],
			int(row['timestamp']),
			type,
			change
		)
	

class Revision(types.Revision):
	
	@staticmethod
	def fromRow(row):
		
		return Revision(
			row['rev_id'],
			User.fromRow(row),
			Page.fromRow(row),
			int(row['timestamp']),
			unicode(row['comment'], 'utf-8', 'replace'),
			ByteDiff.fromRow(row),
			row['sha1']
		)
	

class NewUser(types.NewUser):
	
	@staticmethod
	def fromRow(row): return NewUser(row['user_id'], unicode(row['user_name'], 'utf-8', 'replace'), int(row['timestamp']))

class User(types.User):
	
	@staticmethod
	def fromRow(row): return User(row['user_id'], unicode(row['user_name'], 'utf-8', 'replace'))

class Page(types.Page):
	
	@staticmethod
	def fromRow(row): return Page(row['page_id'], unicode(row['page_title'], 'utf-8', 'replace'), row['page_namespace'])

class ByteDiff(types.ByteDiff):
	
	@staticmethod
	def fromRow(row):
		oldLen = row['old_len'] if row['old_len'] != None else 0
		newLen = row['new_len'] if row['new_len'] != None else 0
		return ByteDiff(oldLen, newLen - oldLen)


