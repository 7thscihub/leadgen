import { Databases, ID, Permission, Role,} from "react-native-appwrite";
import { client } from "../auth/client";
import { getCurrentUser } from "../auth/auth";
import type { LeadDocument, createLeadRecordcord } from "../types/types.ts";
export type { LeadDocument, LeadRecord } from "../../types.types";


function requiredEnv(name: string, value: string | undefined) {
    if (!value) {
        throw new Error(
        `Set ${name} to use the Appwrite lead database.`,
        );
    }
    return value;
}


const databaseId = requiredEnv("EXPO_PUBLIC_APPWRITE_DATABASE_ID",
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
);


const leadsCollectionId = requiredEnv(
    "EXPO_PUBLIC_APPWRITE_LEADS_COLLECTION_ID",
    process.env.EXPO_PUBLIC_APPWRITE_LEADS_COLLECTION_ID,
);


export const databases = new Databases(client);


function normalizeUtcTimestamps(timestamps: string[]) {
    return timestamps.map((timestamp) => {
        if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/i.test(timestamp)) {
            throw new Error(`Notification timestamp must include a timezone: ${timestamp}`);
        }
        const date = new Date(timestamp);
        if (Number.isNaN(date.getTime())) {
            throw new Error(`Invalid notification timestamp: ${timestamp}`);
        }
        return date.toISOString();
    });
}


function documentPermissions(userId: string) {
    const user = Role.user(userId);
    return [
        Permission.read(user),
        Permission.update(user),
        Permission.delete(user),
    ];
}


export async function createLeadRecord(values: LeadRecord) {
    const user = await getCurrentUser();
    return databases.createDocument<LeadDocument>({
        databaseId,
        collectionId: leadsCollectionId,
        documentId: ID.unique(),
        data: {
            ...values,
            TimeToCall: normalizeUtcTimestamps(values.TimeToCall),
        },
        permissions: documentPermissions(user.$id),
    });
}


export async function getLeadRecord(documentId: string) {
    return databases.getDocument<LeadDocument>({
        databaseId,
        collectionId: leadsCollectionId,
        documentId,
    });
}


export async function listLeadRecords() {
    return databases.listDocuments<LeadDocument>({
        databaseId,
        collectionId: leadsCollectionId,
    });
}


export async function updateLeadRecord(documentId: string, values: Partial<LeadRecord>) {
    const data = {
        ...values,
        ...(values.TimeToCall
        ? { TimeToCall: normalizeUtcTimestamps(values.TimeToCall) }
        : {}),
    };

    return databases.updateDocument<LeadDocument>({
        databaseId,
        collectionId: leadsCollectionId,
        documentId,
        data,
    });
}


export function deleteLeadRecord(documentId: string) {
    return databases.deleteDocument({
        databaseId,
        collectionId: leadsCollectionId,
        documentId,
    });
}


