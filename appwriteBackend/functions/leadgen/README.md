# leadgen

## 🧰 Usage

### GET /ping

- Returns a "Pong" message.

**Response**

Sample `200` Response:

```text
Pong
```

### POST /signup

Accepts `email`, `password`, and optional `name`; creates an account and
returns its user and session.

### POST /login

Accepts `email` and `password`; returns a session.

### POST /resetpassword

Send `{ "email": "..." }` to email a recovery code. Complete recovery with
`{ "userId": "...", "otp": "...", "newPassword": "..." }`.

### POST /addlead

Accepts a lead object matching the app's `LeadRecord` fields. Requires the
authenticated user's `x-appwrite-user-jwt` header.

### PUT /editlead

Accepts `documentId` (or `leadId`) and the lead fields to update. Requires the
authenticated user's `x-appwrite-user-jwt` header.

## ⚙️ Configuration

| Setting           | Value         |
| ----------------- | ------------- |
| Runtime           | Node (18.0)   |
| Entrypoint        | `src/main.js` |
| Build Commands    | `npm install` |
| Permissions       | `any`         |
| Timeout (Seconds) | 15            |

## 🔒 Environment Variables

Appwrite provides `APPWRITE_FUNCTION_API_ENDPOINT` and
`APPWRITE_FUNCTION_PROJECT_ID` at runtime. Configure the following function
variables for lead operations:

| Variable | Description |
| --- | --- |
| `APPWRITE_DATABASE_ID` | Appwrite database containing leads |
| `APPWRITE_LEADS_COLLECTION_ID` | Collection containing lead documents |

The function also accepts the corresponding `EXPO_PUBLIC_APPWRITE_*` names
for these values.
