"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function getTasksAction(search = "", statusFilter = "all", priorityFilter = "all") {
  try {
    let query = supabaseAdmin.from("tasks").select("*", { count: "exact" });

    // 1. Apply Search
    if (search.trim()) {
      query = query.ilike("title", `%${search.trim()}%`);
    }

    // 2. Apply Status Filter
    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    // 3. Apply Priority Filter
    if (priorityFilter !== "all") {
      query = query.eq("priority", priorityFilter);
    }

    // Order by due date ascending
    const { data: tasks, count, error } = await query.order("due_date", { ascending: true, nullsFirst: false });

    if (error) throw error;

    // Calculate statistics
    const { data: allTasks } = await supabaseAdmin.from("tasks").select("status");
    const total = allTasks?.length || 0;
    const completed = allTasks?.filter(t => t.status === "Completed").length || 0;
    const pending = total - completed;

    return {
      success: true,
      tasks: tasks || [],
      count: count || 0,
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

    const { data: task, error } = await supabaseAdmin
      .from("tasks")
      .insert([
        {
          title: data.title.trim(),
          description: data.description?.trim() || null,
          due_date: data.due_date ? new Date(data.due_date).toISOString() : null,
          priority: data.priority,
          status: data.status,
        },
      ])
      .select()
      .single();

    if (error) throw error;

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

    const { data: task, error } = await supabaseAdmin
      .from("tasks")
      .update({
        title: data.title.trim(),
        description: data.description?.trim() || null,
        due_date: data.due_date ? new Date(data.due_date).toISOString() : null,
        priority: data.priority,
        status: data.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

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

    const { error } = await supabaseAdmin.from("tasks").delete().eq("id", id);

    if (error) throw error;

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

    const { data: task, error } = await supabaseAdmin
      .from("tasks")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    return { success: true, task };
  } catch (error: any) {
    console.error("Toggle task complete error:", error);
    return { success: false, error: error.message || "Failed to update task status." };
  }
}
