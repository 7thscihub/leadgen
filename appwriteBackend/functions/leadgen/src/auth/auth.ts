import { Account, ID } from "react-native-appwrite";
import { client } from "./client";


const account = new Account(client);

export async function signUp(email: string, password: string, name?: string,) {
    await account.create({
        userId: ID.unique(),
        email: email.trim(),
        password,
        ...(name?.trim() ? { name: name.trim() } : {}),
    });

    await account.createEmailPasswordSession({
        email: email.trim(),
        password,
    });

    return account.get();
}


export async function signIn(email: string, password: string) {
    await account.createEmailPasswordSession({email: email.trim(), password,});
    return account.get();
}


export function getCurrentUser() {
    return account.get();
}


export function signOut() {
    return account.deleteSession({ sessionId: "current" });
}


export async function sendPasswordResetOtp(email: string) {
    const recovery = await account.createRecoveryOTP({
        email: email.trim(),
    });
    return { userId: recovery.userId };
}


export function resetPasswordWithOtp(userId: string, otp: string, newPassword: string) {
    const secret = otp.trim();
    if (!/^\d{6}$/.test(secret)) {
        throw new Error("The password reset code must be 6 digits.");
    }

    return account.updateRecoveryOTP({
        userId,
        secret,
        password: newPassword,
    });
}

