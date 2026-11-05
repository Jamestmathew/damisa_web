import { supabaseAuthService } from "./supabase-auth.service";
import type { AuthServiceContract } from "./auth-service.contract";

export const authService: AuthServiceContract = supabaseAuthService;

export type { AuthServiceContract };
