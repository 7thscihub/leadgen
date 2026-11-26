import * as SQLite from "expo-sqlite";
import { Platform } from "react-native";

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function db() {
  if (!databasePromise) {
    databasePromise = initializeDatabase().catch((error: unknown) => {
      databasePromise = null;
      throw error;
    });
  }
  return databasePromise;
}

async function initializeDatabase() {
  const connection = await SQLite.openDatabaseAsync("leadgen.db");
  await connection.execAsync(`
    PRAGMA journal_mode = ${Platform.OS === "web" ? "DELETE" : "WAL"};
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY NOT NULL,
      idNumber TEXT UNIQUE,
      phoneNumber TEXT NOT NULL,
      dateToCall TEXT NOT NULL,
      status TEXT NOT NULL,
      name TEXT,
      location TEXT,
      package TEXT,
      estateName TEXT,
      apartmentName TEXT,
      submissionId TEXT UNIQUE,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS received_submissions (
      submissionId TEXT PRIMARY KEY NOT NULL,
      receivedAt TEXT NOT NULL
    );
  `);
  return connection;
}

