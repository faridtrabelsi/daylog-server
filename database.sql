CREATE DATABASE daylog;

CREATE TABLE "user"(
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    img VARCHAR(255) NOT NULL,
    google_id VARCHAR NOT NULL UNIQUE
);

CREATE TABLE post (
    id SERIAL PRIMARY KEY,
    title VARCHAR(60) NOT NULL,
    body TEXT NOT NULL,
    author_id INT references "user"(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);