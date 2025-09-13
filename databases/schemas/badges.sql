CREATE TABLE badges (
	badge_id TEXT NOT NULL,
	badge_name TEXT NOT NULL,
	owner_id TEXT NOT NULL,
	file_name TEXT NOT NULL,
	create_date INTEGER NOT NULL,
	badge_name_template TEXT,
	PRIMARY KEY (badge_id)
) WITHOUT ROWID;

CREATE TABLE user_badges (
	user TEXT NOT NULL,
	badge TEXT NOT NULL,
	priority INTEGER NOT NULL,
	is_hidden TINYINT(1) NOT NULL,
	create_date INTEGER NOT NULL,
	badge_data TEXT,
	PRIMARY KEY (user, badge)
) WITHOUT ROWID;

CREATE TABLE user_managed_badges (
	user TEXT NOT NULL,
	badge TEXT NOT NULL,
	PRIMARY KEY (user, badge)
) WITHOUT ROWID;

CREATE TABLE database_settings (
	name TEXT NOT NULL,
	val TEXT NOT NULL,
	PRIMARY KEY (name, val)
) WITHOUT ROWID;

-- set version if not exists
INSERT INTO database_settings (name, val) VALUES ('version', 0);
