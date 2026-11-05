export interface SystemSettings {
  institutionName: string;
  academicSession: string;
  supportEmail: string;
  allowManualPaymentRecording: boolean;
}

export type SettingsActionResult =
  | { ok: true; message: string }
  | { ok: false; error: string; fieldErrors?: Partial<Record<string, string>> };
