INSERT INTO message (message_content, account_id, guild_id)
values ($1, $2, $3)
returning *