import { insertLead, markSubmissionReceived, removeLead, selectLead, selectLeads, selectLeadCounts, submissionReceived, updateLeadRow } from "@/database/leads";
import { Lead, LeadStatus, LeadInput } from "@/types/lead";
import { scheduleLeadReminders, cancelLeadReminders } from "./notifications";
import { todayNairobi } from "@/utils/date";


export async function createLead(input: LeadInput) {
    if (!input.phoneNumber?.trim()) throw new Error("Phone number is required.");
    if (!input.dateToCall?.trim()) throw new Error("Date to call is required.");

    const now = new Date().toISOString();
    const idNumberTrimmed = input.idNumber?.trim();
    const lead: Lead = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        phoneNumber: input.phoneNumber.trim(),
        dateToCall: input.dateToCall,
        status: input.status ?? "pending",
        name: input.name?.trim(),
        idNumber: idNumberTrimmed ? idNumberTrimmed : undefined,
        location: input.location?.trim(),
        package: input.package?.trim(),
        estateName: input.estateName?.trim(),
        apartmentName: input.apartmentName?.trim(),
        submissionId: input.submissionId,
        createdAt: now,
        updatedAt: now
    };

    await insertLead(lead);
    await reconcileLead(lead);
    return lead;
}

export async function getLead(id: string) { return selectLead(id); }
export async function getLeads(status: LeadStatus, query = "") { return selectLeads(status, query); }
export async function getLeadCounts(query = "") { return selectLeadCounts(query); }

export async function updateLead(id: string, changes: Partial<Lead>) {
    const current = await selectLead(id);
    if (!current) throw new Error("Lead not found.");
    const sanitizedChanges = { ...changes };
    if (sanitizedChanges.idNumber !== undefined) {
        const trimmed = sanitizedChanges.idNumber?.trim();
        sanitizedChanges.idNumber = trimmed ? trimmed : undefined;
    }
    const updated = { ...sanitizedChanges, updatedAt: new Date().toISOString() };
    await updateLeadRow(id, updated);
    await reconcileLead({ ...current, ...updated } as Lead);
}


export async function changeLeadStatus(id: string, status: LeadStatus) {
    await updateLead(id, { status });
}


export async function deleteLead(id: string) {
    await cancelLeadReminders(id);
    await removeLead(id);
}

async function reconcileLead(lead: Lead) {
    try {
        if (lead.status === "pending") await scheduleLeadReminders(lead);
        else await cancelLeadReminders(lead.id);
    } catch (err) {
        console.warn("Failed to reconcile lead reminders:", lead.id, err);
    }
}

export async function importPublicLead(input: LeadInput & { submissionId: string }) {
    if (await submissionReceived(input.submissionId)) return false;
    await markSubmissionReceived(input.submissionId);
    await createLead({ ...input, status: "pending", dateToCall: todayNairobi() });
    return true;
}
