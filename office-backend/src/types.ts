export type DocumentInfo = {
  title: string;
  contentType?: string;
  attachmentType?: string;
  inhoud?: string;
  attachmentOfficeId?: string;
};

export type LlmRelayData = {
  beschrijving: string;
  taal: string;
};

export type LlmRelayResponse = {
  success: boolean;
  data: LlmRelayData | null;
  model_used: string | null;
  error: string | null;
};


