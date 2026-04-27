# TideMate frontend

## Local development

This frontend is configured to use a Vite dev proxy. By default, API calls go to `/api` from the browser and Vite forwards them to Django at `http://localhost:8000`.

That setup avoids local CSRF issues caused by mixing `localhost` and `127.0.0.1`.

### Start the frontend

```bash
cp .env.example .env
npm install
npm run dev
```

### Start the backend

Run Django on:

```bash
http://localhost:8000
```

For example:

```bash
cd ../backend
python manage.py runserver localhost:8000
```

## Optional API override

You usually do not need `VITE_API_BASE_URL` for local development.

If you set it manually, use:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

and avoid `127.0.0.1`.
