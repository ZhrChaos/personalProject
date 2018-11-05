insert into guild (guild_name, guild_img)
values ($1, $2)

returning *;