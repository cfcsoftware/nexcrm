"use server";

import { query } from "@/utils/db";
import { revalidatePath } from "next/cache";

export async function getClientsAction(search = "") {
  try {
    let sql = "SELECT * FROM clients";
    const params: any[] = [];

    if (search.trim()) {
      sql += " WHERE company_name ILIKE $1 OR contact_person ILIKE $1 OR email ILIKE $1 OR client_id ILIKE $1";
      params.push(`%${search.trim()}%`);
    }

    sql += " ORDER BY company_name ASC";

    const result = await query(sql, params);
    const clients = result.rows || [];

    // Fetch total count
    let countSql = "SELECT COUNT(*) FROM clients";
    if (search.trim()) {
      countSql += " WHERE company_name ILIKE $1 OR contact_person ILIKE $1 OR email ILIKE $1 OR client_id ILIKE $1";
    }
    const countResult = await query(countSql, params);
    const count = parseInt(countResult.rows[0].count || "0", 10);

    return {
      success: true,
      clients: clients,
      count: count,
    };
  } catch (error: any) {
    console.error("Fetch clients error:", error);
    return { success: false, error: error.message || "Failed to load clients." };
  }
}

export async function createClientAction(data: {
  company_name: string;
  contact_person: string;
  mobile: string;
  email: string;
  address?: string;
  city?: string;
  state?: string;
  gst_number?: string;
  notes?: string;
}) {
  try {
    if (!data.company_name.trim() || !data.contact_person.trim()) {
      return { success: false, error: "Company name and contact person are required." };
    }

    // Generate Client ID (CLI-XXXX)
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

    const insertSql = `
      INSERT INTO clients (
        client_id, company_name, contact_person, mobile, email, address, city, state, gst_number, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const result = await query(insertSql, [
      newClientId,
      data.company_name.trim(),
      data.contact_person.trim(),
      data.mobile.trim(),
      data.email.trim(),
      data.address?.trim() || null,
      data.city?.trim() || null,
      data.state?.trim() || null,
      data.gst_number?.trim() || null,
      data.notes?.trim() || null,
    ]);

    const client = result.rows[0];

    revalidatePath("/clients");
    revalidatePath("/dashboard");
    return { success: true, client };
  } catch (error: any) {
    console.error("Create client error:", error);
    return { success: false, error: error.message || "Failed to create client." };
  }
}

export async function updateClientAction(
  id: string,
  data: {
    company_name: string;
    contact_person: string;
    mobile: string;
    email: string;
    address?: string;
    city?: string;
    state?: string;
    gst_number?: string;
    notes?: string;
  }
) {
  try {
    if (!id) return { success: false, error: "Client ID is required." };
    if (!data.company_name.trim() || !data.contact_person.trim()) {
      return { success: false, error: "Company name and contact person are required." };
    }

    const updateSql = `
      UPDATE clients SET
        company_name = $1,
        contact_person = $2,
        mobile = $3,
        email = $4,
        address = $5,
        city = $6,
        state = $7,
        gst_number = $8,
        notes = $9,
        updated_at = NOW()
      WHERE id = $10
      RETURNING *
    `;
    const result = await query(updateSql, [
      data.company_name.trim(),
      data.contact_person.trim(),
      data.mobile.trim(),
      data.email.trim(),
      data.address?.trim() || null,
      data.city?.trim() || null,
      data.state?.trim() || null,
      data.gst_number?.trim() || null,
      data.notes?.trim() || null,
      id,
    ]);

    const client = result.rows[0];
    if (!client) throw new Error("Client not found or could not be updated.");

    revalidatePath("/clients");
    revalidatePath(`/clients/${id}`);
    revalidatePath("/dashboard");
    return { success: true, client };
  } catch (error: any) {
    console.error("Update client error:", error);
    return { success: false, error: error.message || "Failed to update client." };
  }
}

export async function deleteClientAction(id: string) {
  try {
    if (!id) return { success: false, error: "Client ID is required." };

    const result = await query("DELETE FROM clients WHERE id = $1", [id]);

    revalidatePath("/clients");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Delete client error:", error);
    return { success: false, error: error.message || "Failed to delete client." };
  }
}

export async function getClientProfileDataAction(id: string) {
  try {
    if (!id) return { success: false, error: "Client ID is required." };

    // 1. Fetch Client profile details
    const clientRes = await query("SELECT * FROM clients WHERE id = $1", [id]);
    const client = clientRes.rows[0];

    if (!client) throw new Error("Client not found.");

    // 2. Fetch related Leads
    const leadsRes = await query(
      "SELECT id, lead_id, company_name, contact_person, stage, status, created_at FROM leads WHERE client_id = $1 ORDER BY created_at DESC",
      [id]
    );

    // 3. Fetch related Proposals
    const proposalsRes = await query(
      "SELECT id, proposal_number, title, value, proposal_date, status FROM proposals WHERE client_id = $1 ORDER BY proposal_date DESC",
      [id]
    );

    return {
      success: true,
      client,
      leads: leadsRes.rows || [],
      proposals: proposalsRes.rows || [],
    };
  } catch (error: any) {
    console.error("Fetch client profile error:", error);
    return { success: false, error: error.message || "Failed to load client profile details." };
  }
}

export async function updateClientNotesAction(id: string, notes: string) {
  try {
    if (!id) return { success: false, error: "Client ID is required." };

    const result = await query(
      "UPDATE clients SET notes = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
      [notes.trim(), id]
    );
    const client = result.rows[0];

    if (!client) throw new Error("Client not found.");

    revalidatePath(`/clients/${id}`);
    return { success: true, notes: client.notes };
  } catch (error: any) {
    console.error("Update client notes error:", error);
    return { success: false, error: error.message || "Failed to update client notes." };
  }
}
