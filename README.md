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
EXPO_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
EXPO_PUBLIC_APPWRITE_PROJECT_ID=<your-project-id>
EXPO_PUBLIC_APPWRITE_DATABASE_ID=<your-database-id>
EXPO_PUBLIC_APPWRITE_LEADS_COLLECTION_ID=<your-leads-collection-id>
```

## Architecture

- `database/` — SQLite source of truth.
- `appwrite/` — Appwrite client, email/password authentication, and lead document helpers.
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

Create the Appwrite collection with `fullName`, `PhoneNumber`, `idNumber`,
`dateToCall`, `TimeToCall` (string array), `package`, `location`,
`apartmentName`, and `estateName` attributes. Enable document security and
allow authenticated users to create and list documents; each new lead document
is readable, updatable, and deletable only by its owner.

Password reset is available through `sendPasswordResetOtp(email)` and
`resetPasswordWithOtp(userId, otp, newPassword)` in `appwrite/auth.ts`.
The email code is valid for 15 minutes; keep the returned `userId` while the
user enters the code and their new password.
