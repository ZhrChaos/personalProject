CREATE TABLE gm (
  gm_id SERIAL PRIMARY KEY,
  guild_id INTEGER REFERENCES guild(guild_id),
  account_id INTEGER REFERENCES account(account_id)
)