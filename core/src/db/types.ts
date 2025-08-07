export type UpsertMode = "create-only" | "update-only" | "upsert";

export interface DatabaseOperationResult {
  success: boolean;
  message?: string;
}

export interface DatabaseContext {
  session: { user: { id: string } };
}
