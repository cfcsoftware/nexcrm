"use server";

import { query, Lead, Task, Proposal } from "@/utils/db";

export async function getDashboardData() {
  try {
    // 1. Fetch total counts using a single consolidated query
    const statsQuery = `
      SELECT
        (SELECT COUNT(*) FROM leads) AS total_leads,
        (SELECT COUNT(*) FROM leads WHERE stage = 'Enquiry') AS new_leads,
        (SELECT COUNT(*) FROM leads WHERE status = 'Active') AS active_leads,
        (SELECT COUNT(*) FROM leads WHERE status = 'Won') AS converted_leads,
        (SELECT COUNT(*) FROM tasks) AS total_tasks,
        (SELECT COUNT(*) FROM tasks WHERE status IN ('Pending', 'In Progress')) AS pending_tasks,
        (SELECT COUNT(*) FROM tasks WHERE status = 'Completed') AS completed_tasks,
        (SELECT COUNT(*) FROM clients) AS total_clients,
        (SELECT COUNT(*) FROM proposals) AS total_proposals
    `;
    const statsRes = await query(statsQuery);
    const dbStats = statsRes.rows[0] || {};

    const totalLeads = parseInt(dbStats.total_leads || "0", 10);
    const newLeads = parseInt(dbStats.new_leads || "0", 10);
    const activeLeads = parseInt(dbStats.active_leads || "0", 10);
    const convertedLeads = parseInt(dbStats.converted_leads || "0", 10);
    const totalTasks = parseInt(dbStats.total_tasks || "0", 10);
    const pendingTasks = parseInt(dbStats.pending_tasks || "0", 10);
    const completedTasks = parseInt(dbStats.completed_tasks || "0", 10);
    const totalClients = parseInt(dbStats.total_clients || "0", 10);
    const totalProposals = parseInt(dbStats.total_proposals || "0", 10);

    // 2. Fetch leads by stage for Pipeline Chart
    const leadsByStageRes = await query("SELECT stage FROM leads");
    const leadsByStage = (leadsByStageRes.rows || []) as { stage: string }[];
    
    const stages = ["Enquiry", "Contacted", "Qualified", "Proposal Sent", "Negotiation", "Completed", "Won", "Lost"];
    const pipelineData = stages.map(stage => {
      const count = leadsByStage.filter(l => l.stage === stage).length || 0;
      return { name: stage, value: count };
    });

    // 3. Fetch tasks by status for Task Chart
    const tasksByStatusRes = await query("SELECT status FROM tasks");
    const tasksByStatus = (tasksByStatusRes.rows || []) as { status: string }[];
    
    const taskChartData = [
      { name: "Pending", value: tasksByStatus.filter(t => t.status === "Pending").length || 0 },
      { name: "In Progress", value: tasksByStatus.filter(t => t.status === "In Progress").length || 0 },
      { name: "Completed", value: tasksByStatus.filter(t => t.status === "Completed").length || 0 },
    ];

    // 3.5 Fetch proposals by status for Proposals Chart
    const proposalsByStatusRes = await query("SELECT status, value FROM proposals");
    const proposalsByStatus = (proposalsByStatusRes.rows || []) as { status: string; value: string | number }[];

    const proposalStatuses = ["Draft", "Sent", "Accepted", "Rejected"];
    const proposalChartData = proposalStatuses.map(status => {
      const filtered = proposalsByStatus.filter(p => p.status === status) || [];
      const totalValue = filtered.reduce((acc, curr) => acc + Number(curr.value || 0), 0);
      return { name: status, value: totalValue, count: filtered.length };
    });

    // 4. Fetch recent leads (limit 5)
    const recentLeadsRes = await query(
      "SELECT id, lead_id, company_name, contact_person, stage, status, budget, created_at FROM leads ORDER BY created_at DESC LIMIT 5"
    );
    // Explicitly parse numeric budget
    const recentLeads = (recentLeadsRes.rows as Lead[]).map(lead => ({
      ...lead,
      budget: lead.budget !== null ? Number(lead.budget) : null
    }));

    // 5. Fetch today's tasks (due today, or pending tasks, order by due date, limit 5)
    const todaysTasksRes = await query(
      "SELECT id, title, due_date, priority, status FROM tasks WHERE status != 'Completed' ORDER BY due_date ASC LIMIT 5"
    );
    const todaysTasks = (todaysTasksRes.rows || []) as Task[];

    // 6. Generate recent activities feed dynamically based on leads, tasks and proposals updates
    const updatedLeadsRes = await query(
      "SELECT id, company_name, contact_person, status, stage, updated_at FROM leads ORDER BY updated_at DESC LIMIT 3"
    );
    const updatedLeads = (updatedLeadsRes.rows || []) as Lead[];

    const completedTaskActivitiesRes = await query(
      "SELECT id, title, status, updated_at FROM tasks WHERE status = 'Completed' ORDER BY updated_at DESC LIMIT 3"
    );
    const completedTaskActivities = (completedTaskActivitiesRes.rows || []) as Task[];

    const sentProposalsRes = await query(
      "SELECT id, proposal_number, title, status, value, updated_at FROM proposals ORDER BY updated_at DESC LIMIT 3"
    );
    const sentProposals = (sentProposalsRes.rows || []) as Proposal[];

    const activities: any[] = [];

    updatedLeads.forEach(l => {
      activities.push({
        id: `lead-${l.id}`,
        type: "lead",
        title: `Lead updated: ${l.company_name}`,
        description: `Stage moved to ${l.stage} (${l.status})`,
        time: new Date(l.updated_at),
      });
    });

    completedTaskActivities.forEach(t => {
      activities.push({
        id: `task-${t.id}`,
        type: "task",
        title: `Task completed: ${t.title}`,
        description: `Marked as complete`,
        time: new Date(t.updated_at),
      });
    });

    sentProposals.forEach(p => {
      activities.push({
        id: `prop-${p.id}`,
        type: "proposal",
        title: `Proposal update: ${p.proposal_number}`,
        description: `Proposal "${p.title}" is currently in ${p.status} status ($${Number(p.value).toLocaleString()})`,
        time: new Date(p.updated_at),
      });
    });

    // Sort activities by time descending
    activities.sort((a, b) => b.time.getTime() - a.time.getTime());
    const finalActivities = activities.slice(0, 5);

    return {
      success: true,
      stats: {
        totalLeads,
        newLeads,
        activeLeads,
        convertedLeads,
        totalTasks,
        pendingTasks,
        completedTasks,
        totalClients,
        totalProposals,
      },
      pipelineData,
      taskChartData,
      proposalChartData,
      recentLeads: recentLeads,
      todaysTasks: todaysTasks,
      activities: finalActivities,
    };
  } catch (error) {
    console.error("Dashboard data fetch error:", error);
    return { success: false, error: "Failed to load dashboard metrics" };
  }
}
