CREATE TABLE message (
  message_id SERIAL PRIMARY KEY,
  message_content TEXT,
  account_id INTEGER REFERENCES account(account_id),
  guild_id INTEGER REFERENCES guild(guild_id)
)