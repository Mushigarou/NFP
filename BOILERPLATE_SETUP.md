- fastapi – web framework
- uvicorn – asgi server
- gunicorn – wsgi server
- psycopg2 – postgresql driver
- sqlalchemy – python sql toolkit and object relational mapper
- databases – asyncio support for databases
- alembic – database migration tool

```bash
# https://github.com/nvm-sh/nvm
# https://github.com/pyenv/pyenv
# https://postgresapp.com/
# https://www.pgadmin.org/download/

mkdir nfp-boilerplate
cd nfp-boilerplate

python -m venv venv
source venv/bin/activate

pip install fastapi "uvicorn[standard]" gunicorn psycopg2 sqlalchemy alembic "databases[postgresql]" python-dotenv

sudo -u postgres createuser --superuser $USER
createdb boilerplate
# createuser boilerplate -P

# Open psql as the postgres user
# sudo -u postgres psql
# GRANT ALL PRIVILEGES ON SCHEMA public TO boilerplate;
# ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO boilerplate;
```

https://www.travisluong.com/how-to-build-a-full-stack-next-js-fastapi-postgresql-boilerplate-tutorial/