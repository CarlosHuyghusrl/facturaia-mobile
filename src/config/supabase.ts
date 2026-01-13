/**
 * Supabase Client Configuration
 *
 * This file configures the Supabase client for authentication and database access.
 *
 * Setup Instructions:
 * 1. Create a Supabase project at https://supabase.com
 * 2. Get your project URL and anon key from Project Settings > API
 * 3. Add these values to your .env file:
 *    SUPABASE_URL=https://your-project.supabase.co
 *    SUPABASE_ANON_KEY=your-anon-key
 * 4. Import the SQL schema from 'supabase-schema-facturas.sql'
 */

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createClient} from '@supabase/supabase-js';
import RNFS from 'react-native-fs';

// Environment variables (configured in .env)
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://yljyktrjfgwsznvziqmt.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsanlrdHJqZmd3c3pudnppcW10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MzkxODcsImV4cCI6MjA3NzQxNTE4N30.Os2-_FUTDv74iWOOqxVW7NdYLo4PfhogzNRRLv8S3dM';

// Validate configuration
if (SUPABASE_URL === 'https://your-project.supabase.co') {
  console.warn(
    '⚠️  SUPABASE_URL not configured. Please set it in your .env file.',
  );
}

if (SUPABASE_ANON_KEY === 'your-supabase-anon-key-here') {
  console.warn(
    '⚠️  SUPABASE_ANON_KEY not configured. Please set it in your .env file.',
  );
}

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // Use AsyncStorage for session persistence
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Type definitions for Supabase Database
// These match the schema in 'supabase-schema-facturas.sql'

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          updated_at?: string;
        };
      };
      receipts: {
        Row: {
          id: string;
          name: string;
          amount: number;
          date: string;
          resolved_date: string | null;
          paid_by_user_id: string;
          group_id: string;
          status: 'OPEN' | 'RESOLVED' | 'DISPUTED';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          amount: number;
          date: string;
          resolved_date?: string | null;
          paid_by_user_id: string;
          group_id: string;
          status?: 'OPEN' | 'RESOLVED' | 'DISPUTED';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          amount?: number;
          date?: string;
          resolved_date?: string | null;
          paid_by_user_id?: string;
          group_id?: string;
          status?: 'OPEN' | 'RESOLVED' | 'DISPUTED';
          updated_at?: string;
        };
      };
      receipt_images: {
        Row: {
          id: string;
          receipt_id: string;
          image_url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          receipt_id: string;
          image_url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          receipt_id?: string;
          image_url?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          group_id: string;
          created_at: string;
          updated_at: string;
        };
      };
      tags: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          group_id: string;
          created_at: string;
          updated_at: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      receipt_status: 'OPEN' | 'RESOLVED' | 'DISPUTED';
    };
  };
}

// Helper functions for common Supabase operations

/**
 * Get the current authenticated user
 */
export const getCurrentUser = async () => {
  const {
    data: {user},
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error('Error getting current user:', error);
    return null;
  }

  return user;
};

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email: string, password: string) => {
  const {data, error} = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
};

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (email: string, password: string) => {
  const {data, error} = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
};

/**
 * Sign out
 */
export const signOut = async () => {
  const {error} = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
};

/**
 * Upload image to Supabase Storage using react-native-fs
 */
export const uploadReceiptImage = async (
  uri: string,
  fileName: string,
): Promise<string> => {
  try {
    // Remove file:// prefix if present
    const filePath = uri.replace('file://', '');

    console.log('Reading file from:', filePath);

    // Read file as base64 using react-native-fs
    const base64Data = await RNFS.readFile(filePath, 'base64');

    console.log('File read, size:', base64Data.length);

    // Convert base64 to Uint8Array
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    console.log('Uploading to Supabase Storage...');

    // Upload to Supabase Storage using SDK
    const {data, error} = await supabase.storage
      .from('receipt-images')
      .upload(`receipts/${fileName}`, bytes, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw error;
    }

    console.log('Upload successful:', data.path);

    // Get public URL
    const {
      data: {publicUrl},
    } = supabase.storage.from('receipt-images').getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Helper function to decode base64
function atob(base64: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let str = base64.replace(/=+$/, '');
  let output = '';

  for (let bc = 0, bs = 0, buffer, i = 0; (buffer = str.charAt(i++)); ) {
    buffer = chars.indexOf(buffer);
    if (buffer === -1) continue;
    bs = bc % 4 ? bs * 64 + buffer : buffer;
    if (bc++ % 4) {
      output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6)));
    }
  }
  return output;
}

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return user !== null;
};

export default supabase;
