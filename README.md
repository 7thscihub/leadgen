# Leadgen

Minimal offline-first React Native/Expo implementation of the Leadgen specification.

## Run

```bash
npm install
npx expo start
```

Set:

```text
EXPO_PUBLIC_FORM_FUNCTION_URL=https://<your-appwrite-function-domain>
```

## Architecture

- `database/` — SQLite source of truth.
- `services/leads.ts` — lead CRUD and workflow rules.
- `services/notifications.ts` — OS notification scheduling.
- `services/forms.ts` — Appwrite public-form integration boundary.
- `app/` — UI only.

## Important

The public-form endpoints in `services/forms.ts` are intentionally small integration points. They expect the authenticated Appwrite side to provide:

- `POST /agent/form-token` → `{ "token": "..." }`
- `POST /agent/form-token/disable`
- `POST /agent/form-token/regenerate` → `{ "token": "..." }`

The public URL is always based on the opaque form token, never on an agent ID or push token.

The authenticated Appwrite side also receives device registration at `POST /agent/push-device` with `{ deviceId, pushToken }`.
