-- Global teams table
CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE,
    player_ids INTEGER[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Global in game data of users
CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    tag VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(20) NOT NULL,
    tier CHAR(1),
    team_id INT REFERENCES teams(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Users data per guild
CREATE TABLE IF NOT EXISTS members (
    id SERIAL PRIMARY KEY,
    discord_id VARCHAR(30) NOT NULL,
    guild_id VARCHAR(30) NOT NULL,
    player_id INT REFERENCES players(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(discord_id, guild_id)
);

CREATE INDEX IF NOT EXISTS idx_members_discord_guild ON members(discord_id, guild_id);
CREATE INDEX IF NOT EXISTS idx_players_tag ON players(tag);
CREATE INDEX IF NOT EXISTS idx_players_team ON players(team_id);

-- INSERT INTO players
-- (tag, name, tier)
-- VALUES ('#cooltag', 'bobby', 'S');

-- INSERT INTO members
-- (discord_id, guild_id)
-- VALUES ('112', '445');

-- SELECT * FROM players;
-- SELECT * FROM members;