import { Pool, QueryResultRow } from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:1234@localhost:5432/crm_db";

export const pool = new Pool({
  connectionString,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : undefined,
});

export function formatDates(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof Date) return obj.toISOString();
  if (Array.isArray(obj)) return obj.map(formatDates);
  if (typeof obj === "object") {
    const newObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = formatDates(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
}

export function parseDate(dStr: any): string | null {
  if (!dStr) return null;
  const parsed = new Date(dStr);
  return isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
) {
  const res = await pool.query<T>(text, params);
  res.rows = formatDates(res.rows);
  return res;
}

// Database Table Interfaces

export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: Date | null;
  priority: "Low" | "Medium" | "High" | string;
  status: "Pending" | "In Progress" | "Completed" | string;
  created_at: Date;
  updated_at: Date;
}

export interface Client {
  id: string;
  client_id: string;
  company_name: string;
  contact_person: string;
  mobile: string;
  email: string;
  address: string | null;
  city: string | null;
  state: string | null;
  gst_number: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Lead {
  id: string;
  lead_id: string;
  company_name: string;
  contact_person: string;
  mobile_number: string;
  email: string;
  city: string;
  state: string;
  source: string;
  requirement: string | null;
  budget: number | string | null; // numeric can come as string or number from pg
  expected_closing_date: Date | null;
  notes: string | null;
  assigned_date: Date | null;
  stage: "Enquiry" | "Contacted" | "Qualified" | "Proposal Sent" | "Negotiation" | "Completed" | string;
  status: "Active" | "Won" | "Lost" | string;
  client_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Proposal {
  id: string;
  proposal_number: string;
  title: string;
  proposal_date: Date;
  expiry_date: Date | null;
  value: number | string; // numeric can come as string or number from pg
  description: string | null;
  status: "Draft" | "Sent" | "Accepted" | "Rejected" | string;
  lead_id: string | null;
  client_id: string;
  created_at: Date;
  updated_at: Date;
}
