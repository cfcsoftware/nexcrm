"use client";

import React, { useState, useEffect } from "react";
import { getDashboardData } from "@/app/actions/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import {
  TrendingUp,
  CheckCircle2,
  ListTodo,
  Users2,
  FileSpreadsheet,
  PlusCircle,
  FileCheck,
  UserPlus,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#f59e0b", "#3b82f6", "#10b981"]; // Pending, In Progress, Completed

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    async function loadData() {
      const res = await getDashboardData();
      if (res.success) {
        setData(res);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-500">
        <svg className="animate-spin h-8 w-8 text-blue-600 mb-3" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-sm font-medium">Loading CRM intelligence...</span>
      </div>
    );
  }

  const stats = data?.stats || {
    totalLeads: 0,
    newLeads: 0,
    activeLeads: 0,
    convertedLeads: 0,
    totalTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
    totalClients: 0,
    totalProposals: 0,
  };

  // Group cards logically
  const leadStats = [
    { name: "Total Leads", value: stats.totalLeads, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50 border-l-4 border-l-blue-500" },
    { name: "New Leads", value: stats.newLeads, icon: UserPlus, color: "text-sky-600", bg: "bg-sky-50/70 border-l-4 border-l-sky-500" },
    { name: "Active Leads", value: stats.activeLeads, icon: Clock, color: "text-amber-600", bg: "bg-amber-50/70 border-l-4 border-l-amber-500" },
    { name: "Converted Leads", value: stats.convertedLeads, icon: FileCheck, color: "text-green-600", bg: "bg-green-50/70 border-l-4 border-l-green-500" },
  ];

  const taskStats = [
    { name: "Total Tasks", value: stats.totalTasks, icon: ListTodo, color: "text-slate-700", bg: "bg-slate-50 border-l-4 border-l-slate-400" },
    { name: "Pending Tasks", value: stats.pendingTasks, icon: Clock, color: "text-orange-600", bg: "bg-orange-50/70 border-l-4 border-l-orange-500" },
    { name: "Completed Tasks", value: stats.completedTasks, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50/70 border-l-4 border-l-green-500" },
  ];

  const businessStats = [
    { name: "Total Clients", value: stats.totalClients, icon: Users2, color: "text-indigo-600", bg: "bg-indigo-50 border-l-4 border-l-indigo-500" },
    { name: "Total Proposals", value: stats.totalProposals, icon: FileSpreadsheet, color: "text-purple-600", bg: "bg-purple-50 border-l-4 border-l-purple-500" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Workspace Dashboard
            <Sparkles className="h-6 w-6 text-blue-500 animate-pulse" />
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time insights across your leads pipeline, active proposals, and daily operations.
          </p>
        </div>
        
        {/* Quick actions panel */}
        <div className="flex items-center space-x-2">
          <Link href="/leads">
            <button className="inline-flex items-center space-x-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer">
              <PlusCircle className="h-4 w-4" />
              <span>Add Lead</span>
            </button>
          </Link>
          <Link href="/tasks">
            <button className="inline-flex items-center space-x-1.5 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer">
              <PlusCircle className="h-4 w-4 text-slate-400" />
              <span>New Task</span>
            </button>
          </Link>
        </div>
      </div>

      {/* ---------------------------------------------------------------
          SUMMARY CARDS
          --------------------------------------------------------------- */}
      <div className="space-y-4">
        {/* Leads Grid */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Leads Intelligence</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {leadStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.name} className={`${stat.bg} shadow-sm border border-slate-100 hover:shadow-md transition-shadow`}>
                  <CardContent className="p-5 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{stat.name}</p>
                      <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    </div>
                    <div className={`p-2 rounded-lg bg-white shadow-sm border border-slate-100 ${stat.color}`}>
                      <Icon className="h-6 w-6 shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Tasks & Operations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          {/* Tasks stats */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Tasks & Performance</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {taskStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.name} className={`${stat.bg} shadow-sm border border-slate-100 hover:shadow-md transition-shadow`}>
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{stat.name}</p>
                        <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                      </div>
                      <div className={`p-2 rounded-lg bg-white shadow-sm border border-slate-100 ${stat.color}`}>
                        <Icon className="h-6 w-6 shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Business Core stats */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Business Core</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {businessStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.name} className={`${stat.bg} shadow-sm border border-slate-100 hover:shadow-md transition-shadow`}>
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{stat.name}</p>
                        <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                      </div>
                      <div className={`p-2 rounded-lg bg-white shadow-sm border border-slate-100 ${stat.color}`}>
                        <Icon className="h-6 w-6 shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------
          CHARTS SECTION
          --------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Pipeline Bar Chart */}
        <Card className="lg:col-span-3 border border-slate-200">
          <CardHeader className="border-b border-slate-50 bg-slate-50/20 py-4">
            <CardTitle className="text-base font-bold text-slate-800">Lead Pipeline Funnel</CardTitle>
            <CardDescription>Distribution of active leads across pipeline stages</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.pipelineData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                    labelStyle={{ fontWeight: "bold", color: "#1e293b" }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Task Pie Chart */}
        <Card className="lg:col-span-2 border border-slate-200">
          <CardHeader className="border-b border-slate-50 bg-slate-50/20 py-4">
            <CardTitle className="text-base font-bold text-slate-800">Task Completion Ratios</CardTitle>
            <CardDescription>Current breakdown of task progression statuses</CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex flex-col justify-center">
            <div className="h-[220px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.taskChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {data?.taskChartData?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Central text representation */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-10px]">
                <span className="text-3xl font-extrabold text-slate-900">{stats.totalTasks}</span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Tasks</span>
              </div>
            </div>

            {/* Custom Legend */}
            <div className="flex justify-center space-x-6 text-xs mt-4">
              {data?.taskChartData?.map((item: any, idx: number) => (
                <div key={item.name} className="flex items-center space-x-1.5">
                  <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx] }} />
                  <span className="text-slate-600 font-medium">{item.name}</span>
                  <span className="text-slate-400 font-bold">({item.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ---------------------------------------------------------------
          FEEDS (Recent Activities, Recent Leads, Today's Tasks)
          --------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks Feed */}
        <Card className="border border-slate-200">
          <CardHeader className="border-b border-slate-100 py-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-slate-800">Urgent Checklist</CardTitle>
              <CardDescription>Your pending task priorities</CardDescription>
            </div>
            <Link href="/tasks" className="text-xs text-blue-600 hover:underline flex items-center font-medium">
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </CardHeader>
          <CardContent className="p-4">
            {data?.todaysTasks?.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                <CheckCircle2 className="h-8 w-8 text-green-100 mx-auto mb-2" />
                <span>All caught up! No pending tasks.</span>
              </div>
            ) : (
              <div className="space-y-3.5">
                {data?.todaysTasks?.map((task: any) => (
                  <div key={task.id} className="flex items-start justify-between border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-slate-800 line-clamp-1">{task.title}</p>
                      <p className="text-xs text-slate-400">
                        Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No date"}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        task.priority === "High"
                          ? "bg-red-50 text-red-700"
                          : task.priority === "Medium"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Leads Feed */}
        <Card className="border border-slate-200">
          <CardHeader className="border-b border-slate-100 py-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-slate-800">Fresh Leads</CardTitle>
              <CardDescription>Recently registered enquiries</CardDescription>
            </div>
            <Link href="/leads" className="text-xs text-blue-600 hover:underline flex items-center font-medium">
              <span>Pipeline</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </CardHeader>
          <CardContent className="p-4">
            {data?.recentLeads?.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                <span>No leads recorded yet.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {data?.recentLeads?.map((lead: any) => (
                  <div key={lead.id} className="flex items-center justify-between border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{lead.company_name}</p>
                      <p className="text-xs text-slate-400 truncate">{lead.contact_person} • {lead.lead_id}</p>
                    </div>
                    <div className="flex flex-col items-end shrink-0 space-y-1">
                      <span className="text-xs font-bold text-slate-700">
                        {lead.budget ? `$${lead.budget.toLocaleString()}` : "No budget"}
                      </span>
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700">
                        {lead.stage}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activities Section */}
        <Card className="border border-slate-200">
          <CardHeader className="border-b border-slate-100 py-4">
            <CardTitle className="text-sm font-bold text-slate-800">Operations Feed</CardTitle>
            <CardDescription>Live timeline of database modifications</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {data?.activities?.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                <span>No recent actions recorded.</span>
              </div>
            ) : (
              <div className="space-y-4">
                {data?.activities?.map((activity: any) => (
                  <div key={activity.id} className="flex space-x-3 text-xs">
                    {/* Circle timeline dot */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`h-2.5 w-2.5 rounded-full mt-1 shrink-0 ${
                          activity.type === "lead"
                            ? "bg-blue-500"
                            : activity.type === "task"
                            ? "bg-green-500"
                            : "bg-purple-500"
                        }`}
                      />
                      <div className="w-px h-full bg-slate-100 mt-1" />
                    </div>
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{activity.title}</p>
                      <p className="text-slate-500 truncate">{activity.description}</p>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(activity.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
