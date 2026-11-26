import type { Models } from "react-native-appwrite";

export type JsonObject = Record<string, unknown>;

export type FunctionRequest = {
  method: string;
  headers: Record<string, string>;
  bodyJson?: unknown;
  body?: string;
};

export type FunctionResponse = {
  json(
    body: unknown,
    statusCode?: number,
    headers?: Record<string, string>,
  ): unknown;
};

export type FunctionContext = {
  req: FunctionRequest;
  res: FunctionResponse;
  error: (message: string) => void;
};

export type AppwriteRequestOptions = {
  method?: string;
  body?: JsonObject;
  jwt?: string;
};

export type RequiredStringOptions = {
  trim?: boolean;
};

export type LeadRecord = {
  fullName: string;
  PhoneNumber: string;
  idNumber: string;
  dateToCall: string;
  TimeToCall: string[];
  package: string;
  location: string;
  apartmentName: string;
  estateName: string;
};

export type LeadDocument = Models.Document & LeadRecord;
