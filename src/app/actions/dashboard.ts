"use server";

import { supabaseAdmin } from "@/lib/supabase";

export async function getDashboardData() {
  try {
    // 1. Fetch total counts
    const { count: totalLeads } = await supabaseAdmin.from("leads").select("*", { count: "exact", head: true });
    
    const { count: newLeads } = await supabaseAdmin
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("stage", "Enquiry");

    const { count: activeLeads } = await supabaseAdmin
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("status", "Active");

    const { count: convertedLeads } = await supabaseAdmin
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("status", "Won");

    const { count: totalTasks } = await supabaseAdmin.from("tasks").select("*", { count: "exact", head: true });
    
    const { count: pendingTasks } = await supabaseAdmin
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .in("status", ["Pending", "In Progress"]);

    const { count: completedTasks } = await supabaseAdmin
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("status", "Completed");

    const { count: totalClients } = await supabaseAdmin.from("clients").select("*", { count: "exact", head: true });
    const { count: totalProposals } = await supabaseAdmin.from("proposals").select("*", { count: "exact", head: true });

    // 2. Fetch leads by stage for Pipeline Chart
    const { data: leadsByStage } = await supabaseAdmin
      .from("leads")
      .select("stage");
    
    const stages = ["Enquiry", "Contacted", "Qualified", "Proposal Sent", "Negotiation", "Completed"];
    const pipelineData = stages.map(stage => {
      const count = leadsByStage?.filter(l => l.stage === stage).length || 0;
      return { name: stage, value: count };
    });

    // 3. Fetch tasks by status for Task Chart
    const { data: tasksByStatus } = await supabaseAdmin
      .from("tasks")
      .select("status");
    
    const taskChartData = [
      { name: "Pending", value: tasksByStatus?.filter(t => t.status === "Pending").length || 0 },
      { name: "In Progress", value: tasksByStatus?.filter(t => t.status === "In Progress").length || 0 },
      { name: "Completed", value: tasksByStatus?.filter(t => t.status === "Completed").length || 0 },
    ];

    // 4. Fetch recent leads (limit 5)
    const { data: recentLeads } = await supabaseAdmin
      .from("leads")
      .select("id, lead_id, company_name, contact_person, stage, status, budget, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    // 5. Fetch today's tasks (due today, or pending tasks, order by priority/due date, limit 5)
    const { data: todaysTasks } = await supabaseAdmin
      .from("tasks")
      .select("id, title, due_date, priority, status")
      .neq("status", "Completed")
      .order("due_date", { ascending: true })
      .limit(5);

    // 6. Generate recent activities feed dynamically based on leads, tasks and proposals updates
    const { data: updatedLeads } = await supabaseAdmin
      .from("leads")
      .select("id, company_name, contact_person, status, stage, updated_at")
      .order("updated_at", { ascending: false })
      .limit(3);

    const { data: completedTaskActivities } = await supabaseAdmin
      .from("tasks")
      .select("id, title, status, updated_at")
      .eq("status", "Completed")
      .order("updated_at", { ascending: false })
      .limit(3);

    const { data: sentProposals } = await supabaseAdmin
      .from("proposals")
      .select("id, proposal_number, title, status, value, updated_at")
      .order("updated_at", { ascending: false })
      .limit(3);

    const activities: any[] = [];

    updatedLeads?.forEach(l => {
      activities.push({
        id: `lead-${l.id}`,
        type: "lead",
        title: `Lead updated: ${l.company_name}`,
        description: `Stage moved to ${l.stage} (${l.status})`,
        time: new Date(l.updated_at),
      });
    });

    completedTaskActivities?.forEach(t => {
      activities.push({
        id: `task-${t.id}`,
        type: "task",
        title: `Task completed: ${t.title}`,
        description: `Marked as complete`,
        time: new Date(t.updated_at),
      });
    });

    sentProposals?.forEach(p => {
      activities.push({
        id: `prop-${p.id}`,
        type: "proposal",
        title: `Proposal update: ${p.proposal_number}`,
        description: `Proposal "${p.title}" is currently in ${p.status} status ($${p.value.toLocaleString()})`,
        time: new Date(p.updated_at),
      });
    });

    // Sort activities by time descending
    activities.sort((a, b) => b.time.getTime() - a.time.getTime());
    const finalActivities = activities.slice(0, 5);

    return {
      success: true,
      stats: {
        totalLeads: totalLeads || 0,
        newLeads: newLeads || 0,
        activeLeads: activeLeads || 0,
        convertedLeads: convertedLeads || 0,
        totalTasks: totalTasks || 0,
        pendingTasks: pendingTasks || 0,
        completedTasks: completedTasks || 0,
        totalClients: totalClients || 0,
        totalProposals: totalProposals || 0,
      },
      pipelineData,
      taskChartData,
      recentLeads: recentLeads || [],
      todaysTasks: todaysTasks || [],
      activities: finalActivities,
    };
  } catch (error) {
    console.error("Dashboard data fetch error:", error);
    return { success: false, error: "Failed to load dashboard metrics" };
  }
}
