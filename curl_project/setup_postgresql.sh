#!/bin/bash

# Connect to PostgreSQL and execute SQL commands
sudo -u postgres psql << EOF
-- Delete existing user and database
DROP DATABASE IF EXISTS curl_db;
DROP ROLE IF EXISTS curl_user;

-- Create new database
CREATE DATABASE curl_db;

-- Create new user and assign privileges
CREATE USER curl_user WITH PASSWORD 'curl123cu.rl';
GRANT ALL PRIVILEGES ON DATABASE curl_db TO curl_user;
ALTER ROLE curl_user WITH SUPERUSER;
EOF
