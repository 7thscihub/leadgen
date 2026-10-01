export type LeadStatus = "pending" | "sold" | "reversed" | "abandoned";
export type FollowUpState = "overdue" | "due_today" | "upcoming";

export type Lead = {
  id: string;
  phoneNumber: string;
  dateToCall: string;
  status: LeadStatus;
  name?: string;
  location?: string;
  package?: string;
  estateName?: string;
  apartmentName?: string;
  submissionId?: string;
  createdAt: string;
  updatedAt: string;
};
