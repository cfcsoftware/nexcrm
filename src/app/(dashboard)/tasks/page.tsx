"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  getTasksAction,
  createTaskAction,
  updateTaskAction,
  deleteTaskAction,
  toggleTaskCompleteAction,
} from "@/app/actions/tasks";
import {
  Button,
  Input,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Select,
  Dialog,
} from "@/components/ui";
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  Edit2,
  Eye,
  Calendar,
  AlertCircle,
  Clock,
  ListTodo,
} from "lucide-react";

function TasksContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL parameters query (e.g. from global search redirection)
  const queryId = searchParams.get("id");

  // States
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Dialog Modals
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view">("create");
  const [selectedTask, setSelectedTask] = useState<any>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formDueDate, setFormDueDate] = useState("");
  const [formPriority, setFormPriority] = useState("Medium");
  const [formStatus, setFormStatus] = useState("Pending");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Load Tasks
  const loadTasks = async () => {
    setLoading(true);
    try {
      const res = await getTasksAction(search, statusFilter, priorityFilter);
      if (res.success && res.tasks) {
        setTasks(res.tasks);
        setStats(res.stats);
        
        // If queryId is in URL, open the task detail view
        if (queryId) {
          const foundTask = res.tasks.find((t) => t.id === queryId);
          if (foundTask) {
            handleViewTask(foundTask);
            // Clear URL param to prevent reopening
            router.replace("/tasks");
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [search, statusFilter, priorityFilter, queryId]);

  // Form handlers
  const handleOpenCreate = () => {
    setDialogMode("create");
    setSelectedTask(null);
    setFormTitle("");
    setFormDesc("");
    setFormDueDate("");
    setFormPriority("Medium");
    setFormStatus("Pending");
    setFormError(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (task: any) => {
    setDialogMode("edit");
    setSelectedTask(task);
    setFormTitle(task.title);
    setFormDesc(task.description || "");
    setFormDueDate(task.due_date ? task.due_date.substring(0, 10) : "");
    setFormPriority(task.priority);
    setFormStatus(task.status);
    setFormError(null);
    setDialogOpen(true);
  };

  const handleViewTask = (task: any) => {
    setDialogMode("view");
    setSelectedTask(task);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSubmitting(true);

    const payload = {
      title: formTitle,
      description: formDesc,
      due_date: formDueDate,
      priority: formPriority,
      status: formStatus,
    };

    try {
      let res;
      if (dialogMode === "create") {
        res = await createTaskAction(payload);
      } else {
        res = await updateTaskAction(selectedTask.id, payload);
      }

      if (res.success) {
        setDialogOpen(false);
        loadTasks();
      } else {
        setFormError(res.error || "Failed to process task form.");
      }
    } catch (err) {
      setFormError("An unexpected error occurred.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      const res = await deleteTaskAction(id);
      if (res.success) {
        loadTasks();
      } else {
        alert(res.error || "Failed to delete task.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleComplete = async (task: any) => {
    try {
      const res = await toggleTaskCompleteAction(task.id, task.status);
      if (res.success) {
        loadTasks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Statistics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Task Manager</h1>
          <p className="text-sm text-slate-500 mt-1">Organize your daily activities and log action items.</p>
        </div>
        <Button onClick={handleOpenCreate} className="flex items-center space-x-1">
          <Plus className="h-4 w-4" />
          <span>New Task</span>
        </Button>
      </div>

      {/* Task statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-slate-50/50 border-slate-200/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Tasks</p>
              <p className="text-xl font-bold text-slate-950 mt-1">{stats.total}</p>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-100 text-slate-700">
              <ListTodo className="h-5 w-5 shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50/30 border-orange-100/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide">Pending Tasks</p>
              <p className="text-xl font-bold text-orange-950 mt-1">{stats.pending}</p>
            </div>
            <div className="bg-white p-2 rounded-lg border border-orange-100 text-orange-600">
              <Clock className="h-5 w-5 shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50/30 border-green-100/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Completed Tasks</p>
              <p className="text-xl font-bold text-green-950 mt-1">{stats.completed}</p>
            </div>
            <div className="bg-white p-2 rounded-lg border border-green-100 text-green-600">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Panel */}
      <Card className="shadow-sm border-slate-200">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full bg-slate-50/30"
            />
          </div>
          
          <div className="flex flex-row gap-3 w-full md:w-auto shrink-0">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-36 h-10"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </Select>

            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full sm:w-36 h-10"
            >
              <option value="all">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card className="shadow-sm border-slate-200 overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-500">
              <svg className="animate-spin h-6 w-6 text-blue-600 mb-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-xs">Fetching task cards...</span>
            </div>
          ) : tasks.length === 0 ? (
            <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center">
              <ListTodo className="h-10 w-10 text-slate-300 mb-3" />
              <p className="font-semibold text-sm">No tasks found</p>
              <p className="text-xs text-slate-400 mt-1">Try modifying your search or filter settings.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Task Name</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id} className={task.status === "Completed" ? "opacity-60" : ""}>
                    <TableCell className="align-middle">
                      <input
                        type="checkbox"
                        checked={task.status === "Completed"}
                        onChange={() => handleToggleComplete(task)}
                        className="h-4.5 w-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        title="Mark Complete"
                      />
                    </TableCell>
                    <TableCell className="align-middle">
                      <div className="flex flex-col">
                        <span
                          className={`font-semibold text-slate-900 cursor-pointer hover:text-blue-600 ${
                            task.status === "Completed" ? "line-through text-slate-400" : ""
                          }`}
                          onClick={() => handleViewTask(task)}
                        >
                          {task.title}
                        </span>
                        {task.description && (
                          <span className="text-xs text-slate-400 line-clamp-1 max-w-sm mt-0.5">
                            {task.description}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="align-middle">
                      <span className="text-xs font-semibold text-slate-600 flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1 text-slate-400 shrink-0" />
                        {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No Date"}
                      </span>
                    </TableCell>
                    <TableCell className="align-middle">
                      <Badge
                        variant={
                          task.priority === "High"
                            ? "destructive"
                            : task.priority === "Medium"
                            ? "warning"
                            : "secondary"
                        }
                      >
                        {task.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="align-middle">
                      <Badge
                        variant={
                          task.status === "Completed"
                            ? "success"
                            : task.status === "In Progress"
                            ? "info"
                            : "outline"
                        }
                      >
                        {task.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="align-middle text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => handleViewTask(task)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(task)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-blue-50/50 transition-colors cursor-pointer"
                          title="Edit Task"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="p-1.5 text-slate-400 hover:text-red-650 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Task"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* CREATE / EDIT / VIEW DIALOG */}
      <Dialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={
          dialogMode === "create"
            ? "Create New Task"
            : dialogMode === "edit"
            ? "Edit Task"
            : "Task Details"
        }
      >
        {dialogMode === "view" ? (
          /* VIEW VIEW */
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">{selectedTask?.title}</h3>
              <div className="flex flex-wrap gap-2 pt-1.5">
                <Badge variant={selectedTask?.priority === "High" ? "destructive" : selectedTask?.priority === "Medium" ? "warning" : "secondary"}>
                  Priority: {selectedTask?.priority}
                </Badge>
                <Badge variant={selectedTask?.status === "Completed" ? "success" : selectedTask?.status === "In Progress" ? "info" : "outline"}>
                  Status: {selectedTask?.status}
                </Badge>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Due Date</p>
              <p className="text-sm font-semibold text-slate-700 mt-1 flex items-center">
                <Calendar className="h-4 w-4 mr-1 text-slate-400" />
                {selectedTask?.due_date ? new Date(selectedTask.due_date).toLocaleDateString() : "No due date specified"}
              </p>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Description</p>
              <div className="text-sm text-slate-600 mt-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200/50 whitespace-pre-wrap min-h-[80px]">
                {selectedTask?.description || "No description provided."}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  setDialogOpen(false);
                  handleOpenEdit(selectedTask);
                }}
              >
                Edit Task
              </Button>
            </div>
          </div>
        ) : (
          /* CREATE / EDIT FORM VIEW */
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 block" htmlFor="title">
                Task Title *
              </label>
              <Input
                id="title"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Call client for contract signature"
                disabled={formSubmitting}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 block" htmlFor="desc">
                Description
              </label>
              <textarea
                id="desc"
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Add optional task details..."
                className="w-full min-h-[100px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent disabled:opacity-50"
                disabled={formSubmitting}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 block" htmlFor="due_date">
                  Due Date
                </label>
                <Input
                  id="due_date"
                  type="date"
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                  disabled={formSubmitting}
                />
              </div>

              <div className="space-y-1.5">
                <Select
                  label="Priority"
                  value={formPriority}
                  onChange={(e) => setFormPriority(e.target.value)}
                  disabled={formSubmitting}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </Select>
              </div>
            </div>

            {dialogMode === "edit" && (
              <div className="space-y-1.5">
                <Select
                  label="Status"
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  disabled={formSubmitting}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </Select>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
              <Button variant="outline" type="button" onClick={() => setDialogOpen(false)} disabled={formSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={formSubmitting}>
                {formSubmitting ? "Saving..." : dialogMode === "create" ? "Create Task" : "Save Changes"}
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
}

export default function TasksPage() {
  return (
    <React.Suspense fallback={<div className="py-8 text-center text-slate-500">Loading tasks...</div>}>
      <TasksContent />
    </React.Suspense>
  );
}


