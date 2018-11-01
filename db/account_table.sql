CREATE TABLE account (
  account_id SERIAL PRIMARY KEY,
  account_name VARCHAR(50),
  account_img TEXT,
  account_email TEXT,
  guild_id INTEGER REFERENCES guild(guild_id) 
)