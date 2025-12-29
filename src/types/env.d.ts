/**
 * TypeScript type definitions for environment variables
 * Used with react-native-dotenv
 */

declare module '@env' {
  export const SUPABASE_URL: string;
  export const SUPABASE_ANON_KEY: string;
  export const RAILWAY_OCR_URL: string;
  export const DEFAULT_AI_PROVIDER: string;
  export const OCR_LANGUAGE: string;
  export const DEBUG_MODE: string;
}
