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
INNER JOIN enwiki.revision ON rc_this_oldid = rev_id
WHERE rc_id > 0 AND
(
	(rc_log_type = "newusers" AND rc_log_action = "create") OR
	rc_this_oldid IS NOT NULL AND rc_this_oldid != 0
)
ORDER BY rc_id ASC
LIMIT 1000;

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
	rc_new_len    as new_len
FROM enwiki.recentchanges
WHERE rc_id > 0 AND
(
	(rc_log_type = "newusers" AND rc_log_action = "create") OR
	rc_this_oldid IS NOT NULL AND rc_this_oldid != 0
)
ORDER BY rc_id ASC
LIMIT 1000;
