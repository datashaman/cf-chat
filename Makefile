DB_DATABASE = cf-chat

default:
	overmind start

vite:
	vite dev

wrangler:
	wrangler dev --live-reload

schema-local:
	wrangler d1 execute $(DB_DATABASE) --local --file=./database/schema.sql

schema-remote:
	wrangler d1 execute $(DB_DATABASE) --remote --file=./database/schema.sql

deploy:
	wrangler deploy

tail:
	wrangler tail
