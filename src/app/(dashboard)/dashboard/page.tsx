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
  ArrowUpRight,
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
} from "recharts";

const TASK_COLORS = ["#f59e0b", "#3b82f6", "#10b981"]; // Pending, In Progress, Completed

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [isDark, setIsDark] = useState(false);

  // Monitor dark mode class on html
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

    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkDark();
    
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-500 dark:text-slate-400">
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

  // Modern design card datasets
  const leadStats = [
    { name: "Total Leads", value: stats.totalLeads, icon: TrendingUp, color: "text-blue-500", border: "border-blue-500/20 dark:border-blue-500/10" },
    { name: "New Leads", value: stats.newLeads, icon: UserPlus, color: "text-emerald-500", border: "border-emerald-500/20 dark:border-emerald-500/10" },
    { name: "Active Leads", value: stats.activeLeads, icon: Clock, color: "text-amber-500", border: "border-amber-500/20 dark:border-amber-500/10" },
    { name: "Converted Leads", value: stats.convertedLeads, icon: FileCheck, color: "text-indigo-500", border: "border-indigo-500/20 dark:border-indigo-500/10" },
  ];

  const taskStats = [
    { name: "Total Tasks", value: stats.totalTasks, icon: ListTodo, color: "text-slate-500", border: "border-slate-500/20 dark:border-slate-500/10" },
    { name: "Pending", value: stats.pendingTasks, icon: Clock, color: "text-orange-500", border: "border-orange-500/20 dark:border-orange-500/10" },
    { name: "Completed", value: stats.completedTasks, icon: CheckCircle2, color: "text-green-500", border: "border-green-500/20 dark:border-green-500/10" },
  ];

  const businessStats = [
    { name: "Total Clients", value: stats.totalClients, icon: Users2, color: "text-purple-500", border: "border-purple-500/20 dark:border-purple-500/10" },
    { name: "Total Proposals", value: stats.totalProposals, icon: FileSpreadsheet, color: "text-pink-500", border: "border-pink-500/20 dark:border-pink-500/10" },
  ];

  // Dynamic colors for Recharts based on theme
  const gridStroke = isDark ? "#27272a" : "#f1f5f9";
  const labelFill = isDark ? "#a1a1aa" : "#64748b";
  const tooltipBg = isDark ? "#121214" : "#ffffff";
  const tooltipBorder = isDark ? "#27272a" : "#e2e8f0";
  const tooltipText = isDark ? "#f4f4f5" : "#0f172a";

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2 text-slate-900 dark:text-slate-50">
            Workspace Dashboard
            <Sparkles className="h-6 w-6 text-blue-500 animate-pulse" />
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time insights across your leads pipeline, active proposals, and daily operations.
          </p>
        </div>
        
        {/* Quick actions panel */}
        <div className="flex items-center space-x-2">
          <Link href="/leads">
            <button className="inline-flex items-center space-x-1.5 px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 dark:shadow-none transition-all cursor-pointer">
              <PlusCircle className="h-4.5 w-4.5" />
              <span>Add Lead</span>
            </button>
          </Link>
          <Link href="/tasks">
            <button className="inline-flex items-center space-x-1.5 px-4.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer">
              <PlusCircle className="h-4.5 w-4.5 text-slate-400" />
              <span>New Task</span>
            </button>
          </Link>
        </div>
      </div>

      {/* ---------------------------------------------------------------
          SUMMARY CARDS
          --------------------------------------------------------------- */}
      <div className="space-y-6">
        {/* Leads Intelligence */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-1">Leads Intelligence</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {leadStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.name} className={`relative overflow-hidden hover:scale-[1.01] transition-transform duration-200 bg-white dark:bg-slate-900 border ${stat.border}`}>
                  <CardContent className="p-6 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider">{stat.name}</p>
                      <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-50">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 shadow-sm border border-slate-100/40 dark:border-slate-850 ${stat.color}`}>
                      <Icon className="h-6.5 w-6.5 shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Tasks & Operations & Core Business */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-1">
          {/* Tasks stats */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-1">Tasks & Performance</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {taskStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.name} className={`relative overflow-hidden hover:scale-[1.01] transition-transform duration-200 bg-white dark:bg-slate-900 border ${stat.border}`}>
                    <CardContent className="p-6 flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider">{stat.name}</p>
                        <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-50">{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 shadow-sm border border-slate-100/40 dark:border-slate-850 ${stat.color}`}>
                        <Icon className="h-6.5 w-6.5 shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Business Core stats */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-1">Business Core</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {businessStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.name} className={`relative overflow-hidden hover:scale-[1.01] transition-transform duration-200 bg-white dark:bg-slate-900 border ${stat.border}`}>
                    <CardContent className="p-6 flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider">{stat.name}</p>
                        <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-50">{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 shadow-sm border border-slate-100/40 dark:border-slate-850 ${stat.color}`}>
                        <Icon className="h-6.5 w-6.5 shrink-0" />
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
          CHARTS SECTION (Row 1: Leads and Tasks charts)
          --------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Pipeline Bar Chart */}
        <Card className="lg:col-span-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader className="border-b border-slate-50 dark:border-slate-850/60 py-4.5">
            <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100">Lead Pipeline Funnel</CardTitle>
            <CardDescription className="dark:text-slate-400">Distribution of active leads across pipeline stages</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.pipelineData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                  <XAxis dataKey="name" stroke={labelFill} fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke={labelFill} fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: "8px", color: tooltipText }}
                    labelStyle={{ fontWeight: "bold", color: tooltipText }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Task Pie Chart */}
        <Card className="lg:col-span-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader className="border-b border-slate-50 dark:border-slate-850/60 py-4.5">
            <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100">Task Completion Ratios</CardTitle>
            <CardDescription className="dark:text-slate-400">Current breakdown of task progression statuses</CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex flex-col justify-center">
            <div className="h-[220px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.taskChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {data?.taskChartData?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={TASK_COLORS[index % TASK_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: "8px", color: tooltipText }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Central text representation */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-10px]">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">{stats.totalTasks}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Total Tasks</span>
              </div>
            </div>

            {/* Custom Legend */}
            <div className="flex justify-center space-x-6 text-xs mt-5">
              {data?.taskChartData?.map((item: any, idx: number) => (
                <div key={item.name} className="flex items-center space-x-1.5">
                  <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: TASK_COLORS[idx] }} />
                  <span className="text-slate-650 dark:text-slate-300 font-medium">{item.name}</span>
                  <span className="text-slate-400 dark:text-slate-500 font-bold">({item.value})</span>
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
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader className="border-b border-slate-100 dark:border-slate-850/60 py-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-100">Urgent Checklist</CardTitle>
              <CardDescription className="dark:text-slate-400">Your pending task priorities</CardDescription>
            </div>
            <Link href="/tasks" className="text-xs text-blue-650 dark:text-blue-400 hover:underline flex items-center font-semibold">
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </CardHeader>
          <CardContent className="p-4">
            {data?.todaysTasks?.length === 0 ? (
              <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                <CheckCircle2 className="h-8 w-8 text-green-200 dark:text-green-900/40 mx-auto mb-2" />
                <span>All caught up! No pending tasks.</span>
              </div>
            ) : (
              <div className="space-y-3.5">
                {data?.todaysTasks?.map((task: any) => (
                  <div key={task.id} className="flex items-start justify-between border-b border-slate-50 dark:border-slate-850 pb-3 last:border-0 last:pb-0">
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{task.title}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-550">
                        Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No date"}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                        task.priority === "High"
                          ? "bg-red-50 dark:bg-red-950/30 text-red-750 dark:text-red-400 border border-red-100 dark:border-red-900/30"
                          : task.priority === "Medium"
                          ? "bg-amber-50 dark:bg-amber-950/30 text-amber-750 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30"
                          : "bg-slate-50 dark:bg-slate-950/40 text-slate-700 dark:text-slate-400 border border-slate-100 dark:border-slate-850"
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
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader className="border-b border-slate-100 dark:border-slate-850/60 py-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-100">Fresh Leads</CardTitle>
              <CardDescription className="dark:text-slate-400">Recently registered enquiries</CardDescription>
            </div>
            <Link href="/leads" className="text-xs text-blue-655 dark:text-blue-400 hover:underline flex items-center font-semibold">
              <span>Pipeline</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </CardHeader>
          <CardContent className="p-4">
            {data?.recentLeads?.length === 0 ? (
              <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                <span>No leads recorded yet.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {data?.recentLeads?.map((lead: any) => (
                  <div key={lead.id} className="flex items-center justify-between border-b border-slate-50 dark:border-slate-850 pb-3 last:border-0 last:pb-0">
                    <div className="min-w-0 mr-3">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{lead.company_name}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{lead.contact_person} • {lead.lead_id}</p>
                    </div>
                    <div className="flex flex-col items-end shrink-0 space-y-1">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {lead.budget ? `$${lead.budget.toLocaleString()}` : "No budget"}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-750 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
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
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader className="border-b border-slate-100 dark:border-slate-850/60 py-4">
            <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-100">Operations Feed</CardTitle>
            <CardDescription className="dark:text-slate-400">Live timeline of database modifications</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {data?.activities?.length === 0 ? (
              <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
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
                      <div className="w-px h-full bg-slate-100 dark:bg-slate-800 mt-1" />
                    </div>
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{activity.title}</p>
                      <p className="text-slate-500 dark:text-slate-400 truncate">{activity.description}</p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-550 font-medium">
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
