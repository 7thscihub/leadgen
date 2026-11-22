export type LeadStatus = "pending" | "sold" | "reversed" | "abandoned";
export type FollowUpState = "overdue" | "due_today" | "upcoming";
export type Residency = "apartment" | "estate" | "ownCompound"

export type Lead = {
    id: string;
    phoneNumber: string;
    dateToCall: string;
    status: LeadStatus;
    name?: string;
    idNumber?: string;
    package?: string;
    location?: string;
    residency?: Residency;
    estateName?: string;
    apartmentName?: string;
    submissionId?: string;
    createdAt: string;
    updatedAt: string;
};


export type LeadInput = Pick<Lead, 
    | "phoneNumber" 
    | "name" 
    | "idNumber"
    | "dateToCall" 
    | "location" 
    | "package" 
    | "estateName" 
    | "apartmentName"
    > & { 
        status?: LeadStatus; submissionId?: string 
};




