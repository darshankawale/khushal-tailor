# Tailor Platform (Render free 512 MB)

Lightweight Node app. File-system storage. No session. Fits **Render free 512 MB RAM**.

## Local

```bash
cp .env.example .env
npm install
npm start
```

- http://localhost:3000  
- Owner: http://localhost:3000/owner  
- Login: `owner` / `ChangeMe123!`

Data saved in `./data` and `./uploads`.

## Render free (512 MB RAM)

1. New **Web Service** → connect this repo  
2. **Instance:** Free (512 MB)  
3. Build: `npm install`  
4. Start: `npm start` (uses `--max-old-space-size=384`)  
5. Environment:

| Key | Example |
|-----|---------|
| `NODE_ENV` | `production` |
| `OWNER_USERNAME` | `owner` |
| `OWNER_PASSWORD` | strong password |
| `SESSION_SECRET` | long random string |
| `SHOP_NAME` | Your shop name |

### About data on free tier

Free services **do not keep files forever** across redeploys (no free persistent disk).

- **Between visits** (same running instance): data you add in the dashboard is kept  
- **After redeploy / clear**: sample defaults come back  

For permanent storage, add a **paid Disk** at `/data` and set:

```text
DATA_PATH=/data
```

## Features

- Public shop website (mobile + premium theme)
- Owner panel `/owner` (no session expired issues)
- Services, gallery, timings, themes, languages
- Enquiry form + PDF/Excel export
- File storage only (no SQLite, low RAM)

## Owner URLs

- `/owner` — login  
- `/owner/dashboard.html` — panel  
