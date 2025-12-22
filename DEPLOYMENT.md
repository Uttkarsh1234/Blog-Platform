Render Deployment
===============

Steps to deploy this app to Render:

1. Create a new **Web Service** on Render and connect your GitHub repository.
2. Build command: `npm install`
3. Start command: `npm start` (already provided in `package.json` and `render.yaml`).
4. Add the following environment variables in the Render dashboard (do NOT commit `.env`):
   - `MONGODB_URI`
   - `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_SECURE`, `CONTACT_TO`
   - OAuth secrets used in `config/passport.js` (e.g., `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `CALLBACK_URL`)

Notes
-----
- The app listens on `process.env.PORT` and binds to `0.0.0.0`.
- Keep secrets in Render environment variables, not in source control.
