CREATE TABLE users (
    username VARCHAR(25) PRIMARY KEY,
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE collections (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    creator_username VARCHAR(25) NOT NULL
        REFERENCES users ON DELETE CASCADE
);

CREATE TABLE collections_colors (
    collection_id INTEGER
        REFERENCES collections ON DELETE CASCADE,
    color_hex VARCHAR(6) NOT NULL
    PRIMARY KEY (collection_id, color_hex)
);
