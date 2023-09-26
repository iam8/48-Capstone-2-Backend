\echo 'Delete and recreate colors db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE colors;
CREATE DATABASE colors;
\connect colors

\i colors-schema.sql

\echo 'Delete and recreate colors_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE colors_test;
CREATE DATABASE colors_test;
\connect colors_test

\i colors-schema.sql
