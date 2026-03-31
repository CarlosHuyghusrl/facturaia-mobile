/**
 * TypeScript type definitions for Invoice OCR
 * Only types actively used in the app.
 */

export interface OCRItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface OCRResponse {
  vendor: string;
  date: string;
  total: number;
  subtotal?: number;
  tax?: number;
  items: OCRItem[];
  category?: string;
  tags?: string[];
}

export interface ProcessInvoiceResponse {
  success: boolean;
  invoice?: OCRResponse;
  error?: string;
  ocrDuration?: number;
  aiDuration?: number;
  totalDuration?: number;
}

export class OCRError extends Error {
  constructor(message: string, public details?: unknown) {
    super(message);
    this.name = 'OCRError';
  }
}
