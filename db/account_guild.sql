CREATE TABLE account_guild (
    account_id INTEGER REFERENCES account,
    guild_id INTEGER REFERENCES guild
)