select a.account_id, g.guild_id, guild_name, account_name, guild_img 
from guild g
join account_guild ag on g.guild_id = ag.guild_id
join account a on ag.account_id = a.account_id where a.account_id = $1