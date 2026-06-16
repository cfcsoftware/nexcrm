"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function getProposalsAction(search = "", statusFilter = "all") {
  try {
    let query = supabaseAdmin
      .from("proposals")
      .select("*, clients(*), leads(*)", { count: "exact" });

    // 1. Apply Search (searches title or proposal number)
    if (search.trim()) {
      query = query.or(`title.ilike.%${search.trim()}%,proposal_number.ilike.%${search.trim()}%`);
    }

    // 2. Apply Status Filter
    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data: proposals, count, error } = await query.order("proposal_date", { ascending: false });

    if (error) throw error;

    // 3. Fetch statistics
    const { data: allProps } = await supabaseAdmin.from("proposals").select("value, status");
    const total = allProps?.length || 0;
    const accepted = allProps?.filter((p) => p.status === "Accepted").length || 0;
    const rejected = allProps?.filter((p) => p.status === "Rejected").length || 0;
    const pending = total - accepted - rejected;

    const totalValue = allProps?.reduce((sum, p) => sum + Number(p.value), 0) || 0;
    const acceptedValue = allProps?.filter((p) => p.status === "Accepted").reduce((sum, p) => sum + Number(p.value), 0) || 0;
    const pendingValue = allProps?.filter((p) => p.status === "Draft" || p.status === "Sent").reduce((sum, p) => sum + Number(p.value), 0) || 0;

    return {
      success: true,
      proposals: proposals || [],
      count: count || 0,
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
    const { data: clients } = await supabaseAdmin.from("clients").select("id, company_name, contact_person").order("company_name");
    const { data: leads } = await supabaseAdmin.from("leads").select("id, company_name, contact_person").order("company_name");
    return {
      success: true,
      clients: clients || [],
      leads: leads || [],
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
    const { data: allProps } = await supabaseAdmin.from("proposals").select("proposal_number");
    let nextNum = 1;
    if (allProps && allProps.length > 0) {
      const nums = allProps
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

    const { data: proposal, error } = await supabaseAdmin
      .from("proposals")
      .insert([
        {
          proposal_number: proposalNumber,
          title: data.title.trim(),
          client_id: data.client_id,
          lead_id: data.lead_id || null,
          proposal_date: new Date(data.proposal_date).toISOString(),
          expiry_date: data.expiry_date ? new Date(data.expiry_date).toISOString() : null,
          value: data.value,
          description: data.description?.trim() || null,
          status: data.status,
        },
      ])
      .select()
      .single();

    if (error) throw error;

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

    const { data: proposal, error } = await supabaseAdmin
      .from("proposals")
      .update({
        title: data.title.trim(),
        client_id: data.client_id,
        lead_id: data.lead_id || null,
        proposal_date: new Date(data.proposal_date).toISOString(),
        expiry_date: data.expiry_date ? new Date(data.expiry_date).toISOString() : null,
        value: data.value,
        description: data.description?.trim() || null,
        status: data.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

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

    const { error } = await supabaseAdmin.from("proposals").delete().eq("id", id);

    if (error) throw error;

    revalidatePath("/proposals");
    revalidatePath("/dashboard");
    revalidatePath("/clients");
    return { success: true };
  } catch (error: any) {
    console.error("Delete proposal error:", error);
    return { success: false, error: error.message || "Failed to delete proposal." };
  }
}
