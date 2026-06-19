"use server";

import { query, Proposal, Client, Lead, parseDate } from "@/utils/db";
import { revalidatePath } from "next/cache";

export interface ProposalWithRelations extends Proposal {
  clients: Client;
  leads: Lead | null;
}

export async function getProposalsAction(search = "", statusFilter = "all") {
  try {
    let sql = `
      SELECT 
        proposals.*,
        clients.client_id AS client_client_id,
        clients.company_name AS client_company_name,
        clients.contact_person AS client_contact_person,
        clients.mobile AS client_mobile,
        clients.email AS client_email,
        clients.address AS client_address,
        clients.city AS client_city,
        clients.state AS client_state,
        clients.gst_number AS client_gst_number,
        clients.notes AS client_notes,
        clients.created_at AS client_created_at,
        clients.updated_at AS client_updated_at,
        leads.lead_id AS lead_lead_id,
        leads.company_name AS lead_company_name,
        leads.contact_person AS lead_contact_person,
        leads.mobile_number AS lead_mobile_number,
        leads.email AS lead_email,
        leads.city AS lead_city,
        leads.state AS lead_state,
        leads.source AS lead_source,
        leads.requirement AS lead_requirement,
        leads.budget AS lead_budget,
        leads.expected_closing_date AS lead_expected_closing_date,
        leads.notes AS lead_notes,
        leads.assigned_date AS lead_assigned_date,
        leads.stage AS lead_stage,
        leads.status AS lead_status,
        leads.created_at AS lead_created_at,
        leads.updated_at AS lead_updated_at
      FROM proposals
      LEFT JOIN clients ON proposals.client_id = clients.id
      LEFT JOIN leads ON proposals.lead_id = leads.id
    `;
    const params: any[] = [];
    const clauses: string[] = [];

    // 1. Apply Search (searches title or proposal number)
    if (search.trim()) {
      params.push(`%${search.trim()}%`);
      clauses.push(`(proposals.title ILIKE $${params.length} OR proposals.proposal_number ILIKE $${params.length})`);
    }

    // 2. Apply Status Filter
    if (statusFilter !== "all") {
      params.push(statusFilter);
      clauses.push(`proposals.status = $${params.length}`);
    }

    if (clauses.length > 0) {
      sql += " WHERE " + clauses.join(" AND ");
    }

    sql += " ORDER BY proposals.proposal_date DESC";

    const result = await query(sql, params);
    
    // Map rows to reconstruct clients and leads objects
    const proposals: ProposalWithRelations[] = (result.rows || []).map((row: any) => {
      const {
        client_client_id,
        client_company_name,
        client_contact_person,
        client_mobile,
        client_email,
        client_address,
        client_city,
        client_state,
        client_gst_number,
        client_notes,
        client_created_at,
        client_updated_at,
        lead_lead_id,
        lead_company_name,
        lead_contact_person,
        lead_mobile_number,
        lead_email,
        lead_city,
        lead_state,
        lead_source,
        lead_requirement,
        lead_budget,
        lead_expected_closing_date,
        lead_notes,
        lead_assigned_date,
        lead_stage,
        lead_status,
        lead_created_at,
        lead_updated_at,
        ...proposalData
      } = row;

      const clients = {
        id: proposalData.client_id,
        client_id: client_client_id,
        company_name: client_company_name,
        contact_person: client_contact_person,
        mobile: client_mobile,
        email: client_email,
        address: client_address,
        city: client_city,
        state: client_state,
        gst_number: client_gst_number,
        notes: client_notes,
        created_at: client_created_at,
        updated_at: client_updated_at,
      } as Client;

      const leads = proposalData.lead_id
        ? ({
            id: proposalData.lead_id,
            lead_id: lead_lead_id,
            company_name: lead_company_name,
            contact_person: lead_contact_person,
            mobile_number: lead_mobile_number,
            email: lead_email,
            city: lead_city,
            state: lead_state,
            source: lead_source,
            requirement: lead_requirement,
            budget: lead_budget !== null ? Number(lead_budget) : null,
            expected_closing_date: lead_expected_closing_date,
            notes: lead_notes,
            assigned_date: lead_assigned_date,
            stage: lead_stage,
            status: lead_status,
            created_at: lead_created_at,
            updated_at: lead_updated_at,
          } as Lead)
        : null;

      return {
        ...proposalData,
        value: Number(proposalData.value),
        clients,
        leads,
      } as ProposalWithRelations;
    });

    // Fetch total count matching criteria
    let countSql = "SELECT COUNT(*) FROM proposals";
    if (clauses.length > 0) {
      countSql += " WHERE " + clauses.join(" AND ");
    }
    const countRes = await query(countSql, params);
    const count = parseInt(countRes.rows[0].count || "0", 10);

    // 3. Fetch statistics
    const allPropsRes = await query("SELECT value, status FROM proposals");
    const allProps = (allPropsRes.rows || []) as { status: string; value: string | number }[];
    const total = allProps.length || 0;
    const accepted = allProps.filter((p) => p.status === "Accepted").length || 0;
    const rejected = allProps.filter((p) => p.status === "Rejected").length || 0;
    const pending = total - accepted - rejected;

    const totalValue = allProps.reduce((sum, p) => sum + Number(p.value), 0) || 0;
    const acceptedValue = allProps.filter((p) => p.status === "Accepted").reduce((sum, p) => sum + Number(p.value), 0) || 0;
    const pendingValue = allProps.filter((p) => p.status === "Draft" || p.status === "Sent").reduce((sum, p) => sum + Number(p.value), 0) || 0;

    return {
      success: true,
      proposals: proposals,
      count: count,
      stats: {
        total,
        accepted,
        rejected,
        pending,
        totalValue,
        acceptedValue,
        pendingValue,
      },
    };
  } catch (error: any) {
    console.error("Fetch proposals error:", error);
    return { success: false, error: error.message || "Failed to load proposals." };
  }
}

export async function getRelationsListAction() {
  try {
    const clientsRes = await query("SELECT id, company_name, contact_person FROM clients ORDER BY company_name");
    const leadsRes = await query("SELECT id, company_name, contact_person FROM leads ORDER BY company_name");
    return {
      success: true,
      clients: clientsRes.rows || [],
      leads: leadsRes.rows || [],
    };
  } catch (error: any) {
    console.error("Fetch relations error:", error);
    return { success: false, error: "Failed to load clients and leads dropdown lists." };
  }
}

export async function createProposalAction(data: {
  title: string;
  client_id: string;
  lead_id?: string;
  proposal_date: string;
  expiry_date?: string;
  value: number;
  description?: string;
  status: string;
}) {
  try {
    if (!data.title.trim() || !data.client_id) {
      return { success: false, error: "Proposal title and Client selection are required." };
    }

    // Generate Proposal Number (PRP-2026-XXXX)
    const allPropsRes = await query("SELECT proposal_number FROM proposals");
    const allProps = allPropsRes.rows || [];
    let nextNum = 1;
    if (allProps && allProps.length > 0) {
      const nums = (allProps as { proposal_number: string }[])
        .map((p) => {
          const match = p.proposal_number.match(/PRP-2026-(\d+)/);
          return match ? parseInt(match[1]) : 0;
        })
        .filter((n) => !isNaN(n));
      if (nums.length > 0) {
        nextNum = Math.max(...nums) + 1;
      }
    }
    const propNumStr = nextNum.toString().padStart(4, "0");
    const proposalNumber = `PRP-2026-${propNumStr}`;

    const insertSql = `
      INSERT INTO proposals (
        proposal_number, title, client_id, lead_id, proposal_date, expiry_date, value, description, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const result = await query(insertSql, [
      proposalNumber,
      data.title.trim(),
      data.client_id,
      data.lead_id || null,
      parseDate(data.proposal_date) || new Date().toISOString(),
      parseDate(data.expiry_date),
      data.value,
      data.description?.trim() || null,
      data.status,
    ]);

    const proposal = result.rows[0];

    revalidatePath("/proposals");
    revalidatePath("/dashboard");
    revalidatePath("/clients");
    return { success: true, proposal };
  } catch (error: any) {
    console.error("Create proposal error:", error);
    return { success: false, error: error.message || "Failed to create proposal." };
  }
}

export async function updateProposalAction(
  id: string,
  data: {
    title: string;
    client_id: string;
    lead_id?: string;
    proposal_date: string;
    expiry_date?: string;
    value: number;
    description?: string;
    status: string;
  }
) {
  try {
    if (!id) return { success: false, error: "Proposal ID is required." };
    if (!data.title.trim() || !data.client_id) {
      return { success: false, error: "Proposal title and Client selection are required." };
    }

    const updateSql = `
      UPDATE proposals SET
        title = $1,
        client_id = $2,
        lead_id = $3,
        proposal_date = $4,
        expiry_date = $5,
        value = $6,
        description = $7,
        status = $8,
        updated_at = NOW()
      WHERE id = $9
      RETURNING *
    `;
    const result = await query(updateSql, [
      data.title.trim(),
      data.client_id,
      data.lead_id || null,
      parseDate(data.proposal_date) || new Date().toISOString(),
      parseDate(data.expiry_date),
      data.value,
      data.description?.trim() || null,
      data.status,
      id,
    ]);

    const proposal = result.rows[0];

    revalidatePath("/proposals");
    revalidatePath("/dashboard");
    revalidatePath("/clients");
    return { success: true, proposal };
  } catch (error: any) {
    console.error("Update proposal error:", error);
    return { success: false, error: error.message || "Failed to update proposal." };
  }
}

export async function deleteProposalAction(id: string) {
  try {
    if (!id) return { success: false, error: "Proposal ID is required." };

    await query("DELETE FROM proposals WHERE id = $1", [id]);

    revalidatePath("/proposals");
    revalidatePath("/dashboard");
    revalidatePath("/clients");
    return { success: true };
  } catch (error: any) {
    console.error("Delete proposal error:", error);
    return { success: false, error: error.message || "Failed to delete proposal." };
  }
}
