export interface Case {
  _id: string;
  caseNumber: string;
  pdfUrl: string;
  caseType: string;
  dateFiled: string;
  plaintiffs?: string[];
  defendants?: string[];
  judgmentDetails?: {
    amount?: number;
    date?: string;
    type?: string;
  };
  additionalData?: Record<string, any>;
}

export interface CasesResponse {
  success: boolean;
  count: number;
  data: Case[];
}

export interface CaseResponse {
  success: boolean;
  data: Case;
}

export interface ApiError {
  message: string;
  status: number;
}