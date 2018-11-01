select a.account_id, account_name, account_img, message_content, message_id, g.guild_id, guild_img, guild_name
from message m
inner join account a
on m.account_id = a.account_id
inner join guild g
on m.guild_id = g.guild_id