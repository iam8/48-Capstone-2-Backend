-- Add some example users to database. Both have password of 'password'.
-- User 'example1' token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImV4YW1wbGUxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNjk2MDMyODc4fQ.lhAbXTLaSEA6iGxsHMgJiPOdIIXLXiTJAbGkr2ZTma4
-- User 'example2' token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImV4YW1wbGUyIiwiaXNBZG1pbiI6ZmFsc2UsImlhdCI6MTY5NjAzMjkwMH0.tedoGyBiDAjQ91Uxepf0LHslaPrepShmXwcQMNNGaqM

INSERT INTO users
    (
        username,
        password,
        first_name,
        last_name,
        is_admin
    )
VALUES
    (
        'example1',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'first1',
        'last1',
        TRUE
    ),
    (
        'example2',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'first2',
        'last2',
        FALSE
    );


-- Add some collections to database
INSERT INTO collections
    (
        title,
        creator_username
    )
VALUES
    (
        'collection1-1',
        'example1'
    ),
        (
        'collection1-2',
        'example1'
    ),
        (
        'collection1-3',
        'example1'
    ),
    (
        'collection2-1',
        'example2'
    );


-- Add some colors to collections
INSERT INTO collections_colors
    (
        collection_id,
        color_hex
    )
VALUES
    (
        '1',
        '000000'
    ),
    (
        '1',
        '111111'
    ),
    (
        '1',
        '111112'
    ),
    (
        '2',
        'ffffff'
    ),
    (
        '3',
        'ffffff'
    );
