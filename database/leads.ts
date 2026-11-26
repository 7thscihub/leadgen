import { db } from "./db";
import { Lead, LeadStatus } from "@/types/lead";

export async function insertLead(lead: Lead) {
    const database = await db();
    await database.runAsync(
        `INSERT INTO leads (
            id, 
            phoneNumber, 
            dateToCall, 
            status, 
            name, 
            idNumber,
            location, 
            package, 
            estateName, 
            apartmentName, 
            submissionId, 
            createdAt, 
            updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        lead.id, lead.phoneNumber, lead.dateToCall, lead.status, lead.name ?? null, 
        lead.idNumber ? lead.idNumber.trim() : null, lead.location ?? null, lead.package ?? null, lead.estateName ?? null, 
        lead.apartmentName ?? null, lead.submissionId ?? null, lead.createdAt, lead.updatedAt
    );
}

export async function selectLead(id: string) {
    const database = await db();
    return database.getFirstAsync<Lead>("SELECT * FROM leads WHERE id = ?", id);
}

export async function selectLeads(status: LeadStatus, query = "") {
    const database = await db();
    const q = `%${query.trim()}%`;
    if (status !== "pending") {
        return database.getAllAsync<Lead>(
            `SELECT * FROM leads WHERE status = ? AND (name LIKE ? OR phoneNumber LIKE ?) ORDER BY dateToCall DESC`,
            status, q, q
        );
    }
    return database.getAllAsync<Lead>(
        `SELECT * FROM leads
        WHERE status = ? AND (name LIKE ? OR phoneNumber LIKE ?)
        ORDER BY
        CASE WHEN substr(dateToCall, 1, 10) < date('now','+3 hours') THEN 0
                WHEN substr(dateToCall, 1, 10) = date('now','+3 hours') THEN 1 ELSE 2 END,
        CASE WHEN substr(dateToCall, 1, 10) < date('now','+3 hours') THEN dateToCall END ASC,
        CASE WHEN substr(dateToCall, 1, 10) > date('now','+3 hours') THEN dateToCall END ASC`,
        status, q, q
    );
}

export async function selectLeadCounts(query = ""): Promise<Record<LeadStatus, number> & { total: number }> {
    const database = await db();
    const q = `%${query.trim()}%`;
    const rows = query.trim()
        ? await database.getAllAsync<{ status: LeadStatus; count: number }>(
            `SELECT status, COUNT(*) as count FROM leads WHERE (name LIKE ? OR phoneNumber LIKE ?) GROUP BY status`,
            q, q
        )
        : await database.getAllAsync<{ status: LeadStatus; count: number }>(
            `SELECT status, COUNT(*) as count FROM leads GROUP BY status`
        );

    const counts: Record<LeadStatus, number> & { total: number } = {
        pending: 0,
        sold: 0,
        reversed: 0,
        abandoned: 0,
        total: 0,
    };

    for (const row of rows) {
        if (row.status in counts) {
            counts[row.status] = row.count;
            counts.total += row.count;
        }
    }

    return counts;
}

export async function updateLeadRow(id: string, lead: Partial<Lead>) {
  const database = await db();
  const fields = Object.keys(lead).filter((key) => key !== "id");
  if (!fields.length) return;
  const values = fields.map((key) => {
    const val = (lead as any)[key];
    if (key === "idNumber" || key === "submissionId") {
      return (typeof val === "string" && !val.trim()) ? null : (val ?? null);
    }
    return val ?? null;
  });
  await database.runAsync(
    `UPDATE leads SET ${fields.map((f) => `${f} = ?`).join(", ")} WHERE id = ?`,
    ...values, id
  );
}

export async function removeLead(id: string) {
  const database = await db();
  await database.runAsync("DELETE FROM leads WHERE id = ?", id);
}

export async function submissionReceived(submissionId: string) {
  const database = await db();
  return !!(await database.getFirstAsync("SELECT submissionId FROM received_submissions WHERE submissionId = ?", submissionId));
}

export async function markSubmissionReceived(submissionId: string) {
  const database = await db();
  await database.runAsync("INSERT OR IGNORE INTO received_submissions (submissionId, receivedAt) VALUES (?, ?)", submissionId, new Date().toISOString());
}
