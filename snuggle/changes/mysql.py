import oursql, sys, time

from snuggle.data import types

class MySQL:
	
	def __init__(self, *args, **kwargs):
		self.conn = oursql.connect(*args, **kwargs)
		self.last_rcid = 0
		
	def set_position(self, last_rcid, last_timestamp):
		self.last_rcid = last_rcid
	
	def read(self, limit=None):
		query = """
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
			WHERE rc_id > ? AND
			(
				(rc_log_type = "newusers" AND rc_log_action = "create") OR
				rc_this_oldid IS NOT NULL AND rc_this_oldid != 0
			)
			ORDER BY rc_id ASC
			LIMIT ?
		"""
		data = (self.last_rcid, limit if limit != None else sys.maxint)
		
		cursor = self.conn.cursor(oursql.DictCursor)
		cursor.execute(query, data)
		
		for row in cursor:
			change = Change.fromRow(row)
			self.last_rcid = change.id
			yield change
		
		cursor.close()
	
	def history(self, pageId, revId, n):
		cursor = self.conn.cursor(oursql.DictCursor)
		cursor.execute(
			"""
				SELECT
					rev_id,
					rev_sha1 as sha1
				FROM revision
				WHERE rev_page = ?
				AND rev_id < ?
				ORDER BY rev_id DESC
				LIMIT ?
			""",
			(pageId, revId, n)
		)
		
		history = {}
		for row in reversed(cursor.fetchall()):
			history[row['sha1']] = int(row['rev_id'])
			
		return history
	
	@staticmethod
	def from_config(config):
		kwargs = dict(
			(key, value) for key, value
			in config.snuggle['changes'].iteritems() if key != "module"
		)
		return MySQL(**kwargs)

class Change(types.Change):
	
	@staticmethod
	def fromRow(row):
		if row['log_type'] == "newusers":
			type = "new user"
			change = NewUser.fromRow(row)
		else:
			type = "new revision"
			change = ChangeRevision.fromRow(row)
		
		return Change(
			row['rc_id'],
			int(row['timestamp']),
			type,
			change
		)
	

class ChangeRevision(types.ChangeRevision):
	
	@staticmethod
	def fromRow(row):
		
		return ChangeRevision(
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
	def fromRow(row): return NewUser(
		row['user_id'], 
		unicode(row['user_name'], 'utf-8', 'replace'), 
		int(row['timestamp'])
	)

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
		return ByteDiff(newLen, newLen - oldLen)


