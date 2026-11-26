import {
  Account,
  Client,
  Databases,
  ID,
  Permission,
  Role,
} from 'node-appwrite';

class RequestError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

function requiredEnv(name, value) {
  if (!value) {
    throw new Error(`Set ${name} to use the leadgen function.`);
  }
  return value;
}

function getBody(req) {
  if (req.bodyJson && typeof req.bodyJson === 'object') {
    return req.bodyJson;
  }

  if (typeof req.body === 'string' && req.body) {
    try {
      return JSON.parse(req.body);
    } catch {
      throw new RequestError('Request body must contain valid JSON.');
    }
  }

  return {};
}

function requiredString(value, name) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new RequestError(`${name} is required.`);
  }
  return value.trim();
}

function requiredPassword(value, name) {
  if (typeof value !== 'string' || !value) {
    throw new RequestError(`${name} is required.`);
  }
  return value;
}

function normalizeTimestamps(timestamps) {
  if (!Array.isArray(timestamps)) {
    throw new RequestError('TimeToCall must be an array of timestamps.');
  }

  return timestamps.map((timestamp) => {
    if (
      typeof timestamp !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/i.test(
        timestamp
      )
    ) {
      throw new RequestError(
        `Notification timestamp must include a timezone: ${timestamp}`
      );
    }

    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) {
      throw new RequestError(`Invalid notification timestamp: ${timestamp}`);
    }
    return date.toISOString();
  });
}

function getUserJwt(req) {
  const headers = req.headers ?? {};
  const jwt = Object.entries(headers).find(
    ([name]) => name.toLowerCase() === 'x-appwrite-user-jwt'
  )?.[1];
  if (typeof jwt !== 'string' || !jwt) {
    throw new RequestError(
      'An authenticated Appwrite user session is required.',
      401
    );
  }
  return jwt;
}

function getLeadData(body) {
  const values = body.lead ?? body;
  if (!values || typeof values !== 'object' || Array.isArray(values)) {
    throw new RequestError('Lead data must be a JSON object.');
  }
  return values;
}

async function recoveryOtpRequest(endpoint, projectId, method, payload) {
  const response = await fetch(
    `${endpoint.replace(/\/+$/, '')}/account/recovery/otp`,
    {
      method,
      headers: {
        'X-Appwrite-Project': projectId,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );
  const result = await response.json();

  if (!response.ok) {
    const requestError = new Error(
      result.message ?? 'Appwrite password recovery request failed.'
    );
    requestError.code = response.status;
    throw requestError;
  }

  return result;
}

export default async ({ req, res, log, error }) => {
  const path = (req.path ?? '/').replace(/\/+$/, '') || '/';

  try {
    if (path === '/ping') {
      return res.text('Pong');
    }

    if (
      ![
        '/signup',
        '/login',
        '/resetpassword',
        '/addlead',
        '/editlead',
      ].includes(path)
    ) {
      return res.json({ error: `Unknown path: ${path}` }, 404);
    }

    const body = getBody(req);
    const endpoint = requiredEnv(
      'APPWRITE_FUNCTION_API_ENDPOINT',
      process.env.APPWRITE_FUNCTION_API_ENDPOINT ??
        process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT
    );
    const projectId = requiredEnv(
      'APPWRITE_FUNCTION_PROJECT_ID',
      process.env.APPWRITE_FUNCTION_PROJECT_ID ??
        process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID
    );
    const client = new Client().setEndpoint(endpoint).setProject(projectId);
    const account = new Account(client);

    if (path === '/signup') {
      const email = requiredString(body.email, 'Email');
      const password = requiredPassword(body.password, 'Password');
      const user = await account.create({
        userId: ID.unique(),
        email,
        password,
        ...(typeof body.name === 'string' && body.name.trim()
          ? { name: body.name.trim() }
          : {}),
      });
      const session = await account.createEmailPasswordSession({
        email,
        password,
      });
      return res.json({ user, session }, 201);
    }

    if (path === '/login') {
      const email = requiredString(body.email, 'Email');
      const password = requiredPassword(body.password, 'Password');
      const session = await account.createEmailPasswordSession({
        email,
        password,
      });
      return res.json({ session });
    }

    if (path === '/resetpassword') {
      if (body.userId && (body.otp || body.secret)) {
        const userId = requiredString(body.userId, 'User ID');
        const secret = requiredString(body.otp ?? body.secret, 'Reset code');
        const password = requiredPassword(
          body.newPassword ?? body.password,
          'New password'
        );
        if (!/^\d{6}$/.test(secret)) {
          throw new RequestError('The password reset code must be 6 digits.');
        }
        const result = await recoveryOtpRequest(endpoint, projectId, 'PUT', {
          userId,
          secret,
          password,
        });
        return res.json({ result });
      }

      const email = requiredString(body.email, 'Email');
      const recovery = await recoveryOtpRequest(endpoint, projectId, 'POST', {
        email,
      });
      return res.json({ userId: recovery.userId });
    }

    if (path === '/addlead' || path === '/editlead') {
      const jwt = getUserJwt(req);
      const userClient = new Client()
        .setEndpoint(endpoint)
        .setProject(projectId)
        .setJWT(jwt);
      const user = await new Account(userClient).get();
      const databaseId = requiredEnv(
        'APPWRITE_DATABASE_ID',
        process.env.APPWRITE_DATABASE_ID ??
          process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID
      );
      const collectionId = requiredEnv(
        'APPWRITE_LEADS_COLLECTION_ID',
        process.env.APPWRITE_LEADS_COLLECTION_ID ??
          process.env.EXPO_PUBLIC_APPWRITE_LEADS_COLLECTION_ID
      );
      const databases = new Databases(userClient);

      if (path === '/addlead') {
        const values = getLeadData(body);
        const data = {
          ...values,
          TimeToCall: normalizeTimestamps(values.TimeToCall),
        };
        const lead = await databases.createDocument({
          databaseId,
          collectionId,
          documentId: ID.unique(),
          data,
          permissions: [
            Permission.read(Role.user(user.$id)),
            Permission.update(Role.user(user.$id)),
            Permission.delete(Role.user(user.$id)),
          ],
        });
        return res.json({ lead }, 201);
      }

      const documentId = requiredString(
        body.documentId ?? body.leadId ?? body.$id,
        'Lead document ID'
      );
      const values = { ...getLeadData(body) };
      delete values.documentId;
      delete values.leadId;
      delete values.$id;
      delete values.lead;
      if (values.TimeToCall !== undefined) {
        values.TimeToCall = normalizeTimestamps(values.TimeToCall);
      }

      const lead = await databases.updateDocument({
        databaseId,
        collectionId,
        documentId,
        data: values,
      });
      return res.json({ lead });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Request failed.';
    const statusCode =
      err instanceof RequestError
        ? err.statusCode
        : Number.isInteger(err?.code) && err.code >= 400 && err.code < 600
          ? err.code
          : 500;
    error(message);
    log(`Request ${path} failed with status ${statusCode}.`);
    return res.json({ error: message }, statusCode);
  }
};
