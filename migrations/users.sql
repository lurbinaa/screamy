-- Global teams table
CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE,
    player_ids INTEGER[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Global in-game data of users
CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    tag VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(20) NOT NULL,
    tier CHAR(1),
    team_id INT REFERENCES teams(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Users data per discord guild
CREATE TABLE IF NOT EXISTS members (
    discord_id VARCHAR(30) NOT NULL,
    guild_id VARCHAR(30) NOT NULL,
    player_id INT REFERENCES players(id) ON DELETE SET NULL,
    locale VARCHAR(2),
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (discord_id, guild_id)
);

-- Discord guilds
CREATE TABLE IF NOT EXISTS guilds (
    discord_id VARCHAR(30) UNIQUE NOT NULL,
    locale VARCHAR(2)
);

CREATE INDEX IF NOT EXISTS idx_members_discord_guild ON members(discord_id, guild_id);
CREATE INDEX IF NOT EXISTS idx_players_tag ON players(tag);
CREATE INDEX IF NOT EXISTS idx_players_team ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_guilds ON guilds(discord_id);

-- INSERT INTO players
-- (tag, name, tier)
-- VALUES ('#cooltag', 'bobby', 'S');

-- INSERT INTO members
-- (discord_id, guild_id, locale)
-- VALUES ('1123', '4456', 'es');

-- SELECT * FROM players;
-- SELECT * FROM members;
