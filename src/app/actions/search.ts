"use server";

import { query } from "@/utils/db";

export async function globalSearchAction(searchQuery: string) {
  try {
    if (!searchQuery || searchQuery.trim().length < 2) {
      return { success: true, results: { leads: [], clients: [], proposals: [], tasks: [] } };
    }

    const cleanQuery = searchQuery.trim();
    const queryPattern = `%${cleanQuery}%`;

    // Perform queries in parallel
    const [leadsRes, clientsRes, proposalsRes, tasksRes] = await Promise.all([
      query(
        "SELECT id, lead_id, company_name, contact_person FROM leads WHERE company_name ILIKE $1 OR contact_person ILIKE $1 OR lead_id ILIKE $1 LIMIT 5",
        [queryPattern]
      ),
      query(
        "SELECT id, client_id, company_name, contact_person FROM clients WHERE company_name ILIKE $1 OR contact_person ILIKE $1 OR client_id ILIKE $1 LIMIT 5",
        [queryPattern]
      ),
      query(
        "SELECT id, proposal_number, title FROM proposals WHERE proposal_number ILIKE $1 OR title ILIKE $1 LIMIT 5",
        [queryPattern]
      ),
      query(
        "SELECT id, title, status FROM tasks WHERE title ILIKE $1 LIMIT 5",
        [queryPattern]
      ),
    ]);

    return {
      success: true,
      results: {
        leads: leadsRes.rows || [],
        clients: clientsRes.rows || [],
        proposals: proposalsRes.rows || [],
        tasks: tasksRes.rows || [],
      },
    };
  } catch (error) {
    console.error("Global search server action error:", error);
    return { success: false, error: "Failed to perform search" };
  }
}
