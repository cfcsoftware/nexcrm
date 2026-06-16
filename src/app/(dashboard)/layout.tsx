"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutAction, getSessionUser } from "@/app/actions/auth";
import { globalSearchAction } from "@/app/actions/search";
import { Button } from "@/components/ui";
import {
  LayoutDashboard,
  CheckSquare,
  Users2,
  FileText,
  User,
  LogOut,
  Menu,
  X,
  Search,
  Building2,
  Calendar,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  Sun,
  Moon,
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Navigation active check
  const isActive = (path: string) => pathname.startsWith(path);

  // States
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userName, setUserName] = useState("Admin User");
  const [userEmail, setUserEmail] = useState("admin@crm.com");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    leads: any[];
    clients: any[];
    proposals: any[];
    tasks: any[];
  }>({ leads: [], clients: [], proposals: [], tasks: [] });
  const [searchLoading, setSearchLoading] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  // Initialize theme from document element class or localStorage
  useEffect(() => {
    const isLight = !document.documentElement.classList.contains("dark");
    setTheme(isLight ? "light" : "dark");
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    }
  };

  // Fetch logged in user session details
  useEffect(() => {
    async function loadUser() {
      const session = await getSessionUser();
      if (session) {
        setUserName(session.name);
        setUserEmail(session.email);
      }
    }
    loadUser();
  }, []);

  // Handle keyboard shortcut for search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle search typing
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults({ leads: [], clients: [], proposals: [], tasks: [] });
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await globalSearchAction(searchQuery);
        if (res.success && res.results) {
          setSearchResults(res.results);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleLogout = async () => {
    await logoutAction();
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Tasks", href: "/tasks", icon: CheckSquare },
    { name: "Leads", href: "/leads", icon: TrendingUp },
    { name: "Proposals", href: "/proposals", icon: FileText },
    { name: "Clients", href: "/clients", icon: Users2 },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* -------------------------------------------------------------
          DESKTOP SIDEBAR (fixed left)
          ------------------------------------------------------------- */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        {/* Brand Header */}
        <div className="flex h-16 items-center px-6 border-b border-slate-100 dark:border-slate-800">
          <Link href="/dashboard" className="flex items-center space-x-2 text-blue-600">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">NexCRM</span>
          </Link>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                }`}
              >
                <Icon className={`h-5 w-5 shrink-0 ${active ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Footer Profile */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col space-y-3">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
              <User className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{userName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userEmail}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900/50"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </aside>

      {/* -------------------------------------------------------------
          MOBILE SIDEBAR (Slide-out menu overlay)
          ------------------------------------------------------------- */}
      {mobileSidebarOpen && (
        <div className="relative z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/30 dark:bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />

          <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 animate-in slide-in-from-left duration-250">
            <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800">
              <Link href="/dashboard" className="flex items-center space-x-2 text-blue-600">
                <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                  <Building2 className="h-5 w-5" />
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">NexCRM</span>
              </Link>
              <button
                type="button"
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setMobileSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 font-semibold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                    }`}
                  >
                    <Icon className={`h-5 w-5 shrink-0 ${active ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col space-y-3">
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  <User className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{userName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userEmail}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900/50"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MAIN APPLICATION AREA (header + main content)
          ------------------------------------------------------------- */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 shadow-sm shadow-slate-100/50 dark:shadow-none">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden cursor-pointer"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            
            {/* Global Search Bar (Trigger) */}
            <div
              className="relative w-48 sm:w-64 lg:w-80 cursor-pointer"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
              <div className="w-full h-9 border border-slate-200 dark:border-slate-800 rounded-lg pl-10 pr-3 py-1.5 text-slate-450 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex items-center justify-between text-sm">
                <span>Search...</span>
                <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-1.5 font-mono text-[10px] font-medium text-slate-400 dark:text-slate-500 shadow-sm">
                  <span>⌘</span>K
                </kbd>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 text-yellow-550" />
              ) : (
                <Moon className="h-5 w-5 text-indigo-600" />
              )}
            </button>

            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-slate-950 dark:text-slate-50">{userName}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Administrator</span>
            </div>
            
            {/* Mobile / Quick Logout */}
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Main Content Pane */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* -------------------------------------------------------------
          GLOBAL SEARCH MODAL OVERLAY (Command+K Dialog)
          ------------------------------------------------------------- */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 dark:bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => {
              setSearchOpen(false);
              setSearchQuery("");
            }}
          />

          {/* Search Box */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl dark:shadow-black/70 z-10 w-full max-w-xl mx-4 overflow-hidden flex flex-col max-h-[60vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Input Bar */}
            <div className="flex items-center px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
              <Search className="h-5 w-5 text-slate-400 shrink-0" />
              <input
                type="text"
                className="w-full ml-3 text-sm text-slate-900 dark:text-slate-100 bg-transparent placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
                placeholder="Search leads, tasks, clients, and proposals..."
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-slate-400 dark:text-slate-500 hover:text-slate-655 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              )}
            </div>

            {/* Results Window */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[150px] max-h-[45vh]">
              {searchLoading ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-550 dark:text-slate-400">
                  <svg className="animate-spin h-6 w-6 text-blue-600 mb-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-xs">Searching databases...</span>
                </div>
              ) : searchQuery.trim().length < 2 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Search className="h-8 w-8 text-slate-300 dark:text-slate-700 mb-2" />
                  <p className="text-sm font-medium text-slate-500">Type at least 2 characters to search</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Searches company name, contact person, or numbers</p>
                </div>
              ) : Object.values(searchResults).every((arr) => arr.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500">
                  <AlertCircle className="h-8 w-8 text-slate-300 dark:text-slate-700 mb-2" />
                  <span className="text-sm">No results match your search</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Categorized results */}
                  
                  {/* LEADS */}
                  {searchResults.leads.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase mb-1.5 px-2">
                        Leads ({searchResults.leads.length})
                      </h4>
                      <div className="space-y-1">
                        {searchResults.leads.map((lead) => (
                          <Link
                            key={lead.id}
                            href={`/leads?id=${lead.id}`}
                            onClick={() => setSearchOpen(false)}
                            className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-sm group"
                          >
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{lead.company_name}</span>
                              <span className="text-xs text-slate-400 dark:text-slate-500">{lead.contact_person} • {lead.lead_id}</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CLIENTS */}
                  {searchResults.clients.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase mb-1.5 px-2">
                        Clients ({searchResults.clients.length})
                      </h4>
                      <div className="space-y-1">
                        {searchResults.clients.map((client) => (
                          <Link
                            key={client.id}
                            href={`/clients/${client.id}`}
                            onClick={() => setSearchOpen(false)}
                            className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-sm group"
                          >
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{client.company_name}</span>
                              <span className="text-xs text-slate-400 dark:text-slate-500">{client.contact_person} • {client.client_id}</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* PROPOSALS */}
                  {searchResults.proposals.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase mb-1.5 px-2">
                        Proposals ({searchResults.proposals.length})
                      </h4>
                      <div className="space-y-1">
                        {searchResults.proposals.map((prop) => (
                          <Link
                            key={prop.id}
                            href={`/proposals?id=${prop.id}`}
                            onClick={() => setSearchOpen(false)}
                            className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-sm group"
                          >
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{prop.title}</span>
                              <span className="text-xs text-slate-400 dark:text-slate-500">{prop.proposal_number}</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TASKS */}
                  {searchResults.tasks.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase mb-1.5 px-2">
                        Tasks ({searchResults.tasks.length})
                      </h4>
                      <div className="space-y-1">
                        {searchResults.tasks.map((task) => (
                          <Link
                            key={task.id}
                            href={`/tasks?id=${task.id}`}
                            onClick={() => setSearchOpen(false)}
                            className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-sm group"
                          >
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{task.title}</span>
                              <span className="text-xs text-slate-400 dark:text-slate-500">Status: {task.status}</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Command shortcut guide footer */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-105 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 px-4">
              <span>ESC to exit</span>
              <span>Use ⌘K to open search anywhere</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
