-- Add some example users to database. Both have password of 'password'.
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
        FALSE
    ),
    (
        'example2',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'first2',
        'last2',
        FALSE
    );
