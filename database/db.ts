import * as SQLite from "expo-sqlite";

let database: SQLite.SQLiteDatabase | null = null;

export async function db() {
  if (database) return database;
  database = await SQLite.openDatabaseAsync("leadgen.db");
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY NOT NULL,
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
  return database;
}

