"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function getClientsAction(search = "") {
  try {
    let query = supabaseAdmin.from("clients").select("*", { count: "exact" });

    // Apply Search (searches company, contact, email, client_id)
    if (search.trim()) {
      const cleanSearch = search.trim();
      query = query.or(
        `company_name.ilike.%${cleanSearch}%,contact_person.ilike.%${cleanSearch}%,email.ilike.%${cleanSearch}%,client_id.ilike.%${cleanSearch}%`
      );
    }

    const { data: clients, count, error } = await query.order("company_name", { ascending: true });

    if (error) throw error;

    return {
      success: true,
      clients: clients || [],
      count: count || 0,
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
    const { data: allClients } = await supabaseAdmin.from("clients").select("client_id");
    let nextNum = 1001;
    if (allClients && allClients.length > 0) {
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

    const { data: client, error } = await supabaseAdmin
      .from("clients")
      .insert([
        {
          client_id: newClientId,
          company_name: data.company_name.trim(),
          contact_person: data.contact_person.trim(),
          mobile: data.mobile.trim(),
          email: data.email.trim(),
          address: data.address?.trim() || null,
          city: data.city?.trim() || null,
          state: data.state?.trim() || null,
          gst_number: data.gst_number?.trim() || null,
          notes: data.notes?.trim() || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

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

    const { data: client, error } = await supabaseAdmin
      .from("clients")
      .update({
        company_name: data.company_name.trim(),
        contact_person: data.contact_person.trim(),
        mobile: data.mobile.trim(),
        email: data.email.trim(),
        address: data.address?.trim() || null,
        city: data.city?.trim() || null,
        state: data.state?.trim() || null,
        gst_number: data.gst_number?.trim() || null,
        notes: data.notes?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

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

    const { error } = await supabaseAdmin.from("clients").delete().eq("id", id);

    if (error) throw error;

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
    const { data: client, error: clientErr } = await supabaseAdmin
      .from("clients")
      .select("*")
      .eq("id", id)
      .single();

    if (clientErr || !client) throw clientErr || new Error("Client not found.");

    // 2. Fetch related Leads
    const { data: leads } = await supabaseAdmin
      .from("leads")
      .select("id, lead_id, company_name, contact_person, stage, status, created_at")
      .eq("client_id", id)
      .order("created_at", { ascending: false });

    // 3. Fetch related Proposals
    const { data: proposals } = await supabaseAdmin
      .from("proposals")
      .select("id, proposal_number, title, value, proposal_date, status")
      .eq("client_id", id)
      .order("proposal_date", { ascending: false });

    return {
      success: true,
      client,
      leads: leads || [],
      proposals: proposals || [],
    };
  } catch (error: any) {
    console.error("Fetch client profile error:", error);
    return { success: false, error: error.message || "Failed to load client profile details." };
  }
}

export async function updateClientNotesAction(id: string, notes: string) {
  try {
    if (!id) return { success: false, error: "Client ID is required." };

    const { data: client, error } = await supabaseAdmin
      .from("clients")
      .update({
        notes: notes.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath(`/clients/${id}`);
    return { success: true, notes: client.notes };
  } catch (error: any) {
    console.error("Update client notes error:", error);
    return { success: false, error: error.message || "Failed to update client notes." };
  }
}
