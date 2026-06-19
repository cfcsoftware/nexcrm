"use server";

import { query, Task, parseDate } from "@/utils/db";
import { revalidatePath } from "next/cache";

export async function getTasksAction(search = "", statusFilter = "all", priorityFilter = "all") {
  try {
    let sql = "SELECT * FROM tasks";
    const params: any[] = [];
    const clauses: string[] = [];

    // 1. Apply Search
    if (search.trim()) {
      params.push(`%${search.trim()}%`);
      clauses.push(`title ILIKE $${params.length}`);
    }

    // 2. Apply Status Filter
    if (statusFilter !== "all") {
      params.push(statusFilter);
      clauses.push(`status = $${params.length}`);
    }

    // 3. Apply Priority Filter
    if (priorityFilter !== "all") {
      params.push(priorityFilter);
      clauses.push(`priority = $${params.length}`);
    }

    if (clauses.length > 0) {
      sql += " WHERE " + clauses.join(" AND ");
    }

    // Order by due date ascending with nulls last
    sql += " ORDER BY due_date ASC NULLS LAST";

    const result = await query(sql, params);
    const tasks: Task[] = result.rows || [];

    // Calculate total matching criteria count
    let countSql = "SELECT COUNT(*) FROM tasks";
    if (clauses.length > 0) {
      countSql += " WHERE " + clauses.join(" AND ");
    }
    const countRes = await query(countSql, params);
    const count = parseInt(countRes.rows[0].count || "0", 10);

    // Calculate statistics
    const allTasksRes = await query("SELECT status FROM tasks");
    const allTasks = (allTasksRes.rows || []) as { status: string }[];
    const total = allTasks.length || 0;
    const completed = allTasks.filter(t => t.status === "Completed").length || 0;
    const pending = total - completed;

    return {
      success: true,
      tasks: tasks,
      count: count,
      stats: { total, pending, completed }
    };
  } catch (error: any) {
    console.error("Fetch tasks error:", error);
    return { success: false, error: error.message || "Failed to load tasks." };
  }
}

export async function createTaskAction(data: {
  title: string;
  description?: string;
  due_date?: string;
  priority: string;
  status: string;
}) {
  try {
    if (!data.title.trim()) {
      return { success: false, error: "Task title is required." };
    }

    const insertSql = `
      INSERT INTO tasks (title, description, due_date, priority, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await query(insertSql, [
      data.title.trim(),
      data.description?.trim() || null,
      parseDate(data.due_date),
      data.priority,
      data.status,
    ]);

    const task = result.rows[0];

    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    return { success: true, task };
  } catch (error: any) {
    console.error("Create task error:", error);
    return { success: false, error: error.message || "Failed to create task." };
  }
}

export async function updateTaskAction(
  id: string,
  data: {
    title: string;
    description?: string;
    due_date?: string;
    priority: string;
    status: string;
  }
) {
  try {
    if (!id) return { success: false, error: "Task ID is required." };
    if (!data.title.trim()) return { success: false, error: "Task title is required." };

    const updateSql = `
      UPDATE tasks SET
        title = $1,
        description = $2,
        due_date = $3,
        priority = $4,
        status = $5,
        updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `;
    const result = await query(updateSql, [
      data.title.trim(),
      data.description?.trim() || null,
      parseDate(data.due_date),
      data.priority,
      data.status,
      id,
    ]);

    const task = result.rows[0];
    if (!task) throw new Error("Task not found or could not be updated.");

    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    return { success: true, task };
  } catch (error: any) {
    console.error("Update task error:", error);
    return { success: false, error: error.message || "Failed to update task." };
  }
}

export async function deleteTaskAction(id: string) {
  try {
    if (!id) return { success: false, error: "Task ID is required." };

    await query("DELETE FROM tasks WHERE id = $1", [id]);

    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Delete task error:", error);
    return { success: false, error: error.message || "Failed to delete task." };
  }
}

export async function toggleTaskCompleteAction(id: string, currentStatus: string) {
  try {
    if (!id) return { success: false, error: "Task ID is required." };

    const newStatus = currentStatus === "Completed" ? "Pending" : "Completed";

    const result = await query(
      "UPDATE tasks SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
      [newStatus, id]
    );

    const task = result.rows[0];
    if (!task) throw new Error("Task not found or could not be updated.");

    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    return { success: true, task };
  } catch (error: any) {
    console.error("Toggle task complete error:", error);
    return { success: false, error: error.message || "Failed to update task status." };
  }
}
