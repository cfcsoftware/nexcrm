"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

// Helper to convert lead to client when stage becomes Completed
async function checkAndConvertToClient(leadId: string, stage: string, status: string) {
  try {
    // We only trigger client creation if stage is Completed or status is Won
    if (stage !== "Completed" && status !== "Won") {
      return null;
    }

    // 1. Fetch Lead details
    const { data: lead, error: leadErr } = await supabaseAdmin
      .from("leads")
      .select("*")
      .eq("id", leadId)
      .single();

    if (leadErr || !lead) {
      console.error("Lead not found for client conversion:", leadErr);
      return null;
    }

    // If client relation already exists, do nothing
    if (lead.client_id) {
      return lead.client_id;
    }

    // 2. Check if a client with the exact same company name already exists
    const { data: existingClient } = await supabaseAdmin
      .from("clients")
      .select("id")
      .eq("company_name", lead.company_name)
      .limit(1)
      .maybeSingle();

    if (existingClient) {
      // Link the lead to this existing client
      await supabaseAdmin
        .from("leads")
        .update({ client_id: existingClient.id, status: "Won" })
        .eq("id", leadId);
      return existingClient.id;
    }

    // 3. Generate new Client ID (CLI-XXXX)
    const { data: allClients } = await supabaseAdmin
      .from("clients")
      .select("client_id");

    let nextNum = 1001;
    if (allClients && allClients.length > 0) {
      // Find maximum numeric value
      const nums = allClients
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
    const { data: newClient, error: clientErr } = await supabaseAdmin
      .from("clients")
      .insert([
        {
          client_id: newClientId,
          company_name: lead.company_name,
          contact_person: lead.contact_person,
          mobile: lead.mobile_number,
          email: lead.email,
          city: lead.city,
          state: lead.state,
          notes: `Automatically created from Lead conversion (Lead: ${lead.lead_id}).\nRequirements: ${lead.requirement || "None"}`,
        },
      ])
      .select()
      .single();

    if (clientErr || !newClient) {
      console.error("Failed to automatically create client from lead:", clientErr);
      return null;
    }

    // 5. Update Lead with new client_id and set status to Won
    await supabaseAdmin
      .from("leads")
      .update({ client_id: newClient.id, status: "Won" })
      .eq("id", leadId);

    return newClient.id;
  } catch (err) {
    console.error("convertToClient function error:", err);
    return null;
  }
}

export async function getLeadsAction(search = "", stageFilter = "all", statusFilter = "all") {
  try {
    let query = supabaseAdmin.from("leads").select("*, clients(company_name)", { count: "exact" });

    // 1. Search
    if (search.trim()) {
      const cleanSearch = search.trim();
      query = query.or(
        `company_name.ilike.%${cleanSearch}%,contact_person.ilike.%${cleanSearch}%,lead_id.ilike.%${cleanSearch}%`
      );
    }

    // 2. Stage Filter
    if (stageFilter !== "all") {
      query = query.eq("stage", stageFilter);
    }

    // 3. Status Filter
    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data: leads, count, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;

    return {
      success: true,
      leads: leads || [],
      count: count || 0,
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
    const { data: allLeads } = await supabaseAdmin.from("leads").select("lead_id");
    let nextNum = 1001;
    if (allLeads && allLeads.length > 0) {
      const nums = allLeads
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

    const { data: lead, error } = await supabaseAdmin
      .from("leads")
      .insert([
        {
          lead_id: newLeadId,
          company_name: data.company_name.trim(),
          contact_person: data.contact_person.trim(),
          mobile_number: data.mobile_number.trim(),
          email: data.email.trim(),
          city: data.city.trim(),
          state: data.state.trim(),
          source: data.source,
          requirement: data.requirement?.trim() || null,
          budget: data.budget || null,
          expected_closing_date: data.expected_closing_date ? new Date(data.expected_closing_date).toISOString() : null,
          notes: data.notes?.trim() || null,
          assigned_date: data.assigned_date ? new Date(data.assigned_date).toISOString() : null,
          stage: data.stage,
          status: data.status,
        },
      ])
      .select()
      .single();

    if (error) throw error;

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

    const { data: lead, error } = await supabaseAdmin
      .from("leads")
      .update({
        company_name: data.company_name.trim(),
        contact_person: data.contact_person.trim(),
        mobile_number: data.mobile_number.trim(),
        email: data.email.trim(),
        city: data.city.trim(),
        state: data.state.trim(),
        source: data.source,
        requirement: data.requirement?.trim() || null,
        budget: data.budget || null,
        expected_closing_date: data.expected_closing_date ? new Date(data.expected_closing_date).toISOString() : null,
        notes: data.notes?.trim() || null,
        assigned_date: data.assigned_date ? new Date(data.assigned_date).toISOString() : null,
        stage: data.stage,
        status: data.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

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

    const { data: lead, error } = await supabaseAdmin
      .from("leads")
      .update({
        stage: newStage,
        status: statusUpdate,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

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

    const { error } = await supabaseAdmin.from("leads").delete().eq("id", id);

    if (error) throw error;

    revalidatePath("/leads");
    revalidatePath("/dashboard");
    revalidatePath("/clients");
    return { success: true };
  } catch (error: any) {
    console.error("Delete lead error:", error);
    return { success: false, error: error.message || "Failed to delete lead." };
  }
}
