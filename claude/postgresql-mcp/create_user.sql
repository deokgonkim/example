CREATE USER mcp_user WITH PASSWORD 'strong_password';
GRANT CONNECT ON DATABASE mydb TO mcp_user;
GRANT USAGE ON SCHEMA public TO mcp_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO mcp_user;

