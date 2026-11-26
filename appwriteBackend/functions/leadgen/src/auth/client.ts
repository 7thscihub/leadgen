import { Client } from "react-native-appwrite";


function requiredEnv(name: string, value: string | undefined) {
    if (!value) {
        throw new Error(`Set ${name} to use Appwrite.`);
    }
    return value;
}


const endpoint = requiredEnv(
    "EXPO_PUBLIC_APPWRITE_ENDPOINT",
    process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
);


const projectId = requiredEnv(
    "EXPO_PUBLIC_APPWRITE_PROJECT_ID",
    process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
);


export const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setPlatform("com.leadgen.app");


