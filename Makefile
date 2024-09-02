DB_DATABASE = cf-chat

nuxt:
	yarn dev

wrangler:
	wrangler dev --live-reload

schema-local:
	wrangler d1 execute $(DB_DATABASE) --local --file=./database/schema.sql

schema-remote:
	wrangler d1 execute $(DB_DATABASE) --remote --file=./database/schema.sql

clean-local:
	wrangler d1 execute $(DB_DATABASE) --local --file=./database/clean.sql

clean-remote:
	wrangler d1 execute $(DB_DATABASE) --remote --file=./database/clean.sql

deploy:
	wrangler deploy

tail:
	wrangler pages deployment tail

prettier:
	prettier . --write
