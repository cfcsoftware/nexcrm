"use server";

import { supabaseAdmin } from "@/lib/supabase";

export async function globalSearchAction(query: string) {
  try {
    if (!query || query.trim().length < 2) {
      return { success: true, results: { leads: [], clients: [], proposals: [], tasks: [] } };
    }

    const cleanQuery = query.trim();

    // 1. Search Leads
    const { data: leads, error: leadErr } = await supabaseAdmin
      .from("leads")
      .select("id, lead_id, company_name, contact_person")
      .or(`company_name.ilike.%${cleanQuery}%,contact_person.ilike.%${cleanQuery}%,lead_id.ilike.%${cleanQuery}%`)
      .limit(5);

    // 2. Search Clients
    const { data: clients, error: clientErr } = await supabaseAdmin
      .from("clients")
      .select("id, client_id, company_name, contact_person")
      .or(`company_name.ilike.%${cleanQuery}%,contact_person.ilike.%${cleanQuery}%,client_id.ilike.%${cleanQuery}%`)
      .limit(5);

    // 3. Search Proposals
    const { data: proposals, error: propErr } = await supabaseAdmin
      .from("proposals")
      .select("id, proposal_number, title")
      .or(`proposal_number.ilike.%${cleanQuery}%,title.ilike.%${cleanQuery}%`)
      .limit(5);

    // 4. Search Tasks
    const { data: tasks, error: taskErr } = await supabaseAdmin
      .from("tasks")
      .select("id, title, status")
      .ilike("title", `%${cleanQuery}%`)
      .limit(5);

    if (leadErr || clientErr || propErr || taskErr) {
      console.error("Search error:", { leadErr, clientErr, propErr, taskErr });
    }

    return {
      success: true,
      results: {
        leads: leads || [],
        clients: clients || [],
        proposals: proposals || [],
        tasks: tasks || [],
      },
    };
  } catch (error) {
    console.error("Global search server action error:", error);
    return { success: false, error: "Failed to perform search" };
  }
}
