"use server";

import { query, Lead } from "@/utils/db";
import { revalidatePath } from "next/cache";

export interface LeadWithClient extends Lead {
  clients: { company_name: string } | null;
}

// Helper to convert lead to client when stage becomes Completed
async function checkAndConvertToClient(leadId: string, stage: string, status: string) {
  try {
    // We only trigger client creation if stage is Completed or status is Won
    if (stage !== "Completed" && status !== "Won") {
      return null;
    }

    // 1. Fetch Lead details
    const leadRes = await query("SELECT * FROM leads WHERE id = $1", [leadId]);
    const lead = leadRes.rows[0];

    if (!lead) {
      console.error("Lead not found for client conversion:", leadId);
      return null;
    }

    // If client relation already exists, do nothing
    if (lead.client_id) {
      return lead.client_id;
    }

    // 2. Check if a client with the exact same company name already exists
    const existingClientRes = await query(
      "SELECT id FROM clients WHERE company_name = $1 LIMIT 1",
      [lead.company_name]
    );
    const existingClient = existingClientRes.rows[0];

    if (existingClient) {
      // Link the lead to this existing client
      await query(
        "UPDATE leads SET client_id = $1, status = 'Won', updated_at = NOW() WHERE id = $2",
        [existingClient.id, leadId]
      );
      return existingClient.id;
    }

    // 3. Generate new Client ID (CLI-XXXX)
    const allClients = await query("SELECT client_id FROM clients");
    let nextNum = 1001;
    if (allClients.rows && allClients.rows.length > 0) {
      const nums = (allClients.rows as { client_id: string }[])
        .map((c) => {
          const match = c.client_id.match(/CLI-(\d+)/);
          return match ? parseInt(match[1]) : 1000;
        })
        .filter((n) => !isNaN(n));
      if (nums.length > 0) {
        nextNum = Math.max(...nums) + 1;
      }
    }
    const newClientId = `CLI-${nextNum}`;

    // 4. Create new Client
    const insertClientSql = `
      INSERT INTO clients (
        client_id, company_name, contact_person, mobile, email, city, state, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const newClientRes = await query(insertClientSql, [
      newClientId,
      lead.company_name,
      lead.contact_person,
      lead.mobile_number,
      lead.email,
      lead.city,
      lead.state,
      `Automatically created from Lead conversion (Lead: ${lead.lead_id}).\nRequirements: ${lead.requirement || "None"}`,
    ]);
    const newClient = newClientRes.rows[0];

    if (!newClient) {
      console.error("Failed to automatically create client from lead.");
      return null;
    }

    // 5. Update Lead with new client_id and set status to Won
    await query(
      "UPDATE leads SET client_id = $1, status = 'Won', updated_at = NOW() WHERE id = $2",
      [newClient.id, leadId]
    );

    return newClient.id;
  } catch (err) {
    console.error("convertToClient function error:", err);
    return null;
  }
}

export async function getLeadsAction(search = "", stageFilter = "all", statusFilter = "all") {
  try {
    let sql = `
      SELECT leads.*, clients.company_name AS client_company_name
      FROM leads
      LEFT JOIN clients ON leads.client_id = clients.id
    `;
    const params: any[] = [];
    const clauses: string[] = [];

    // 1. Search
    if (search.trim()) {
      params.push(`%${search.trim()}%`);
      clauses.push(
        `(leads.company_name ILIKE $${params.length} OR leads.contact_person ILIKE $${params.length} OR leads.lead_id ILIKE $${params.length})`
      );
    }

    // 2. Stage Filter
    if (stageFilter !== "all") {
      params.push(stageFilter);
      clauses.push(`leads.stage = $${params.length}`);
    }

    // 3. Status Filter
    if (statusFilter !== "all") {
      params.push(statusFilter);
      clauses.push(`leads.status = $${params.length}`);
    }

    if (clauses.length > 0) {
      sql += " WHERE " + clauses.join(" AND ");
    }

    sql += " ORDER BY leads.created_at DESC";

    const result = await query(sql, params);
    
    // Map rows to match Supabase's relation result format (clients object inside lead)
    const leads: LeadWithClient[] = (result.rows || []).map((row: any) => {
      const { client_company_name, ...leadData } = row;
      return {
        ...leadData,
        budget: leadData.budget !== null ? Number(leadData.budget) : null,
        clients: client_company_name ? { company_name: client_company_name } : null,
      } as LeadWithClient;
    });

    // Fetch total count matching criteria
    let countSql = "SELECT COUNT(*) FROM leads";
    if (clauses.length > 0) {
      countSql += " WHERE " + clauses.join(" AND ");
    }
    const countRes = await query(countSql, params);
    const count = parseInt(countRes.rows[0].count || "0", 10);

    return {
      success: true,
      leads: leads,
      count: count,
    };
  } catch (error: any) {
    console.error("Fetch leads error:", error);
    return { success: false, error: error.message || "Failed to load leads." };
  }
}

export async function createLeadAction(data: {
  company_name: string;
  contact_person: string;
  mobile_number: string;
  email: string;
  city: string;
  state: string;
  source: string;
  requirement?: string;
  budget?: number;
  expected_closing_date?: string;
  notes?: string;
  assigned_date?: string;
  stage: string;
  status: string;
}) {
  try {
    if (!data.company_name.trim() || !data.contact_person.trim()) {
      return { success: false, error: "Company name and contact person are required." };
    }

    // Generate Lead ID (LD-XXXX)
    const allLeads = await query("SELECT lead_id FROM leads");
    let nextNum = 1001;
    if (allLeads.rows && allLeads.rows.length > 0) {
      const nums = (allLeads.rows as { lead_id: string }[])
        .map((l) => {
          const match = l.lead_id.match(/LD-(\d+)/);
          return match ? parseInt(match[1]) : 1000;
        })
        .filter((n) => !isNaN(n));
      if (nums.length > 0) {
        nextNum = Math.max(...nums) + 1;
      }
    }
    const newLeadId = `LD-${nextNum}`;

    const insertLeadSql = `
      INSERT INTO leads (
        lead_id, company_name, contact_person, mobile_number, email, city, state, source,
        requirement, budget, expected_closing_date, notes, assigned_date, stage, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;

    const result = await query(insertLeadSql, [
      newLeadId,
      data.company_name.trim(),
      data.contact_person.trim(),
      data.mobile_number.trim(),
      data.email.trim(),
      data.city.trim(),
      data.state.trim(),
      data.source,
      data.requirement?.trim() || null,
      data.budget || null,
      data.expected_closing_date ? new Date(data.expected_closing_date).toISOString() : null,
      data.notes?.trim() || null,
      data.assigned_date ? new Date(data.assigned_date).toISOString() : null,
      data.stage,
      data.status,
    ]);

    const lead = result.rows[0];

    // Trigger auto-conversion check if created directly as Completed / Won
    if (lead.stage === "Completed" || lead.status === "Won") {
      await checkAndConvertToClient(lead.id, lead.stage, lead.status);
    }

    revalidatePath("/leads");
    revalidatePath("/dashboard");
    revalidatePath("/clients");
    return { success: true, lead };
  } catch (error: any) {
    console.error("Create lead error:", error);
    return { success: false, error: error.message || "Failed to create lead." };
  }
}

export async function updateLeadAction(
  id: string,
  data: {
    company_name: string;
    contact_person: string;
    mobile_number: string;
    email: string;
    city: string;
    state: string;
    source: string;
    requirement?: string;
    budget?: number;
    expected_closing_date?: string;
    notes?: string;
    assigned_date?: string;
    stage: string;
    status: string;
  }
) {
  try {
    if (!id) return { success: false, error: "Lead ID is required." };
    if (!data.company_name.trim() || !data.contact_person.trim()) {
      return { success: false, error: "Company name and contact person are required." };
    }

    const updateLeadSql = `
      UPDATE leads SET
        company_name = $1,
        contact_person = $2,
        mobile_number = $3,
        email = $4,
        city = $5,
        state = $6,
        source = $7,
        requirement = $8,
        budget = $9,
        expected_closing_date = $10,
        notes = $11,
        assigned_date = $12,
        stage = $13,
        status = $14,
        updated_at = NOW()
      WHERE id = $15
      RETURNING *
    `;

    const result = await query(updateLeadSql, [
      data.company_name.trim(),
      data.contact_person.trim(),
      data.mobile_number.trim(),
      data.email.trim(),
      data.city.trim(),
      data.state.trim(),
      data.source,
      data.requirement?.trim() || null,
      data.budget || null,
      data.expected_closing_date ? new Date(data.expected_closing_date).toISOString() : null,
      data.notes?.trim() || null,
      data.assigned_date ? new Date(data.assigned_date).toISOString() : null,
      data.stage,
      data.status,
      id,
    ]);

    const lead = result.rows[0];

    // Trigger auto-conversion check
    if (lead.stage === "Completed" || lead.status === "Won") {
      await checkAndConvertToClient(lead.id, lead.stage, lead.status);
    }

    revalidatePath("/leads");
    revalidatePath("/dashboard");
    revalidatePath("/clients");
    return { success: true, lead };
  } catch (error: any) {
    console.error("Update lead error:", error);
    return { success: false, error: error.message || "Failed to update lead." };
  }
}

export async function updateLeadStageAction(id: string, newStage: string) {
  try {
    if (!id) return { success: false, error: "Lead ID is required." };

    // If stage becomes Completed, we set status to Won automatically
    const statusUpdate = newStage === "Completed" ? "Won" : "Active";

    const result = await query(
      "UPDATE leads SET stage = $1, status = $2, updated_at = NOW() WHERE id = $3 RETURNING *",
      [newStage, statusUpdate, id]
    );
    const lead = result.rows[0];

    // Trigger client conversion
    if (newStage === "Completed") {
      await checkAndConvertToClient(lead.id, newStage, statusUpdate);
    }

    revalidatePath("/leads");
    revalidatePath("/dashboard");
    revalidatePath("/clients");
    return { success: true, lead };
  } catch (error: any) {
    console.error("Update lead stage error:", error);
    return { success: false, error: error.message || "Failed to update lead stage." };
  }
}

export async function deleteLeadAction(id: string) {
  try {
    if (!id) return { success: false, error: "Lead ID is required." };

    await query("DELETE FROM leads WHERE id = $1", [id]);

    revalidatePath("/leads");
    revalidatePath("/dashboard");
    revalidatePath("/clients");
    return { success: true };
  } catch (error: any) {
    console.error("Delete lead error:", error);
    return { success: false, error: error.message || "Failed to delete lead." };
  }
}
