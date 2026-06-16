"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getLeadsAction,
  createLeadAction,
  updateLeadAction,
  deleteLeadAction,
  updateLeadStageAction,
} from "@/app/actions/leads";
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
  Grid,
  List,
  Eye,
  Edit2,
  Trash2,
  AlertCircle,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  Link2,
} from "lucide-react";

const STAGES = ["Enquiry", "Contacted", "Qualified", "Proposal Sent", "Negotiation", "Completed"];

function LeadsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL parameters query (e.g. from global search redirection)
  const queryId = searchParams.get("id");

  // States
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"table" | "kanban">("kanban");
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Kanban Drag and Drop indicator
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  // Modals
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view">("create");
  const [selectedLead, setSelectedLead] = useState<any>(null);

  // Form Fields
  const [formCompany, setFormCompany] = useState("");
  const [formContact, setFormContact] = useState("");
  const [formMobile, setFormMobile] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formState, setFormState] = useState("");
  const [formSource, setFormSource] = useState("Website");
  const [formRequirement, setFormRequirement] = useState("");
  const [formBudget, setFormBudget] = useState("");
  const [formClosingDate, setFormClosingDate] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formAssignedDate, setFormAssignedDate] = useState("");
  const [formStage, setFormStage] = useState("Enquiry");
  const [formStatus, setFormStatus] = useState("Active");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Load Leads
  const loadLeads = async () => {
    setLoading(true);
    try {
      const res = await getLeadsAction(search, stageFilter, statusFilter);
      if (res.success && res.leads) {
        setLeads(res.leads);

        // If queryId is in URL, open the lead detail view
        if (queryId) {
          const foundLead = res.leads.find((l) => l.id === queryId);
          if (foundLead) {
            handleViewLead(foundLead);
            // Clear URL param
            router.replace("/leads");
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
    loadLeads();
  }, [search, stageFilter, statusFilter, queryId]);

  // Form helpers
  const handleOpenCreate = () => {
    setDialogMode("create");
    setSelectedLead(null);
    setFormCompany("");
    setFormContact("");
    setFormMobile("");
    setFormEmail("");
    setFormCity("");
    setFormState("");
    setFormSource("Website");
    setFormRequirement("");
    setFormBudget("");
    setFormClosingDate("");
    setFormNotes("");
    setFormAssignedDate("");
    setFormStage("Enquiry");
    setFormStatus("Active");
    setFormError(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (lead: any) => {
    setDialogMode("edit");
    setSelectedLead(lead);
    setFormCompany(lead.company_name);
    setFormContact(lead.contact_person);
    setFormMobile(lead.mobile_number);
    setFormEmail(lead.email);
    setFormCity(lead.city);
    setFormState(lead.state);
    setFormSource(lead.source);
    setFormRequirement(lead.requirement || "");
    setFormBudget(lead.budget ? lead.budget.toString() : "");
    setFormClosingDate(lead.expected_closing_date ? lead.expected_closing_date.substring(0, 10) : "");
    setFormNotes(lead.notes || "");
    setFormAssignedDate(lead.assigned_date ? lead.assigned_date.substring(0, 10) : "");
    setFormStage(lead.stage);
    setFormStatus(lead.status);
    setFormError(null);
    setDialogOpen(true);
  };

  const handleViewLead = (lead: any) => {
    setDialogMode("view");
    setSelectedLead(lead);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSubmitting(true);

    const payload = {
      company_name: formCompany,
      contact_person: formContact,
      mobile_number: formMobile,
      email: formEmail,
      city: formCity,
      state: formState,
      source: formSource,
      requirement: formRequirement,
      budget: formBudget ? parseFloat(formBudget) : undefined,
      expected_closing_date: formClosingDate,
      notes: formNotes,
      assigned_date: formAssignedDate,
      stage: formStage,
      status: formStatus,
    };

    try {
      let res;
      if (dialogMode === "create") {
        res = await createLeadAction(payload);
      } else {
        res = await updateLeadAction(selectedLead.id, payload);
      }

      if (res.success) {
        setDialogOpen(false);
        loadLeads();
      } else {
        setFormError(res.error || "Failed to save lead.");
      }
    } catch (err) {
      setFormError("An unexpected error occurred.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    try {
      const res = await deleteLeadAction(id);
      if (res.success) {
        loadLeads();
      } else {
        alert(res.error || "Failed to delete lead.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    setDragOverStage(stage);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = async (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    setDragOverStage(null);
    const leadId = e.dataTransfer.getData("text/plain");
    if (!leadId) return;

    try {
      const res = await updateLeadStageAction(leadId, targetStage);
      if (res.success) {
        loadLeads();
      } else {
        alert(res.error || "Failed to update stage.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to count leads per stage
  const getStageCount = (stage: string) => {
    return leads.filter((l) => l.stage === stage).length;
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Leads Pipeline</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track potential opportunities and move them through pipeline stages.
          </p>
        </div>
        
        {/* Toggle and New Lead Buttons */}
        <div className="flex items-center space-x-3">
          <div className="bg-slate-100 p-0.5 rounded-lg flex border border-slate-200 shrink-0">
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-all ${
                viewMode === "kanban" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
              title="Kanban Board"
            >
              <Grid className="h-4 w-4" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-all ${
                viewMode === "table" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
              title="Table View"
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>
          <Button onClick={handleOpenCreate} className="flex items-center space-x-1 shrink-0">
            <Plus className="h-4 w-4" />
            <span>Add Lead</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <Card className="shadow-sm border-slate-200">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search leads by company, contact name or lead code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full bg-slate-50/30"
            />
          </div>
          
          <div className="flex flex-row gap-3 w-full md:w-auto shrink-0">
            {viewMode === "table" && (
              <Select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="w-full sm:w-36 h-10"
              >
                <option value="all">All Stages</option>
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            )}

            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-36 h-10"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* -------------------------------------------------------------
          VIEWS: TABLE OR KANBAN
          ------------------------------------------------------------- */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-slate-500">
          <svg className="animate-spin h-6 w-6 text-blue-600 mb-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-xs">Streaming pipeline status...</span>
        </div>
      ) : leads.length === 0 ? (
        <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 shadow-sm">
          <TrendingUp className="h-10 w-10 text-slate-300 mb-3" />
          <p className="font-semibold text-sm">No leads in the pipeline</p>
          <p className="text-xs text-slate-400 mt-1">Register a new lead to get started.</p>
        </div>
      ) : viewMode === "table" ? (
        /* =========================================================
           TABLE VIEW
           ========================================================= */
        <Card className="shadow-sm border-slate-200 overflow-hidden bg-white">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead ID</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="align-middle font-mono font-bold text-xs text-slate-500">
                      {lead.lead_id}
                    </TableCell>
                    <TableCell className="align-middle font-semibold text-slate-950">
                      {lead.company_name}
                    </TableCell>
                    <TableCell className="align-middle">{lead.contact_person}</TableCell>
                    <TableCell className="align-middle text-xs">{lead.mobile_number}</TableCell>
                    <TableCell className="align-middle">
                      <Badge variant="info">{lead.stage}</Badge>
                    </TableCell>
                    <TableCell className="align-middle">
                      <Badge variant={lead.status === "Won" ? "success" : lead.status === "Lost" ? "destructive" : "warning"}>
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="align-middle text-xs text-slate-500">{lead.source}</TableCell>
                    <TableCell className="align-middle text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => handleViewLead(lead)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-50 cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(lead)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-blue-50/50 cursor-pointer"
                          title="Edit Lead"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(lead.id)}
                          className="p-1.5 text-slate-400 hover:text-red-650 rounded-md hover:bg-red-50 cursor-pointer"
                          title="Delete Lead"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        /* =========================================================
           KANBAN VIEW (6 Stage Columns)
           ========================================================= */
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 items-start overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageLeads = leads.filter((l) => l.stage === stage);
            const isDraggingOver = dragOverStage === stage;
            return (
              <div
                key={stage}
                onDragOver={(e) => handleDragOver(e, stage)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage)}
                className={`flex flex-col bg-slate-100 rounded-xl p-3 border-2 min-h-[500px] max-h-[80vh] w-full shrink-0 transition-all ${
                  isDraggingOver ? "border-dashed border-blue-500 bg-blue-50/30 shadow-inner" : "border-transparent"
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3.5 px-1 shrink-0">
                  <span className="text-xs font-bold text-slate-700 tracking-wide uppercase truncate mr-1.5">
                    {stage}
                  </span>
                  <Badge variant="secondary" className="bg-slate-200/60 text-slate-700 font-bold shrink-0">
                    {stageLeads.length}
                  </Badge>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
                  {stageLeads.length === 0 ? (
                    <div className="h-full border border-dashed border-slate-200 rounded-lg flex items-center justify-center text-[10px] text-slate-400 font-medium py-10 text-center">
                      Drag leads here
                    </div>
                  ) : (
                    stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        onClick={() => handleViewLead(lead)}
                        className="bg-white rounded-lg border border-slate-200/80 p-3.5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-grab active:cursor-grabbing group relative space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <span className="font-mono font-bold text-[9px] text-slate-400 bg-slate-50 border border-slate-100 px-1 py-0.5 rounded">
                            {lead.lead_id}
                          </span>
                          <Badge
                            variant={lead.status === "Won" ? "success" : lead.status === "Lost" ? "destructive" : "warning"}
                            className="text-[8px] px-1 py-0"
                          >
                            {lead.status}
                          </Badge>
                        </div>
                        
                        <div>
                          <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 truncate leading-snug">
                            {lead.company_name}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">
                            {lead.contact_person}
                          </p>
                        </div>

                        {lead.budget && (
                          <div className="text-[10px] font-semibold text-slate-700 bg-slate-50 px-2 py-1 rounded flex items-center">
                            <DollarSign className="h-3 w-3 text-slate-400 mr-0.5" />
                            <span>{lead.budget.toLocaleString()}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-slate-50">
                          <span className="truncate">{lead.source}</span>
                          {lead.expected_closing_date && (
                            <span className="shrink-0 font-medium text-slate-500">
                              {new Date(lead.expected_closing_date).toLocaleDateString([], { month: "short", day: "numeric" })}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT / VIEW DIALOG */}
      <Dialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={
          dialogMode === "create"
            ? "Add New Lead"
            : dialogMode === "edit"
            ? "Edit Lead"
            : "Lead Information"
        }
      >
        {dialogMode === "view" ? (
          /* VIEW VIEW */
          <div className="space-y-5">
            <div className="space-y-1">
              <span className="font-mono font-bold text-xs text-slate-400 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">
                {selectedLead?.lead_id}
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-2">{selectedLead?.company_name}</h3>
              <p className="text-sm text-slate-500 flex items-center">
                Contact: <span className="font-semibold text-slate-700 ml-1">{selectedLead?.contact_person}</span>
              </p>
              
              <div className="flex flex-wrap gap-2 pt-1.5">
                <Badge variant="info">Stage: {selectedLead?.stage}</Badge>
                <Badge variant={selectedLead?.status === "Won" ? "success" : selectedLead?.status === "Lost" ? "destructive" : "warning"}>
                  Status: {selectedLead?.status}
                </Badge>
                {selectedLead?.client_id && (
                  <Link href={`/clients/${selectedLead.client_id}`}>
                    <Badge variant="secondary" className="flex items-center space-x-1 border-blue-200 text-blue-700 bg-blue-50 cursor-pointer">
                      <Link2 className="h-3 w-3" />
                      <span>Linked Client profile</span>
                    </Badge>
                  </Link>
                )}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-sm">
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Mobile Number</p>
                <p className="font-semibold text-slate-700 flex items-center mt-0.5">
                  <Phone className="h-4 w-4 mr-1.5 text-slate-400 shrink-0" />
                  {selectedLead?.mobile_number}
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Email Address</p>
                <p className="font-semibold text-slate-700 flex items-center mt-0.5">
                  <Mail className="h-4 w-4 mr-1.5 text-slate-400 shrink-0" />
                  {selectedLead?.email}
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Location</p>
                <p className="font-semibold text-slate-700 flex items-center mt-0.5">
                  <MapPin className="h-4 w-4 mr-1.5 text-slate-400 shrink-0" />
                  {selectedLead?.city}, {selectedLead?.state}
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Source</p>
                <p className="font-semibold text-slate-700 mt-0.5">
                  {selectedLead?.source}
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Budget</p>
                <p className="font-semibold text-slate-700 mt-0.5 flex items-center">
                  <DollarSign className="h-4 w-4 mr-0.5 text-slate-400 shrink-0" />
                  {selectedLead?.budget ? selectedLead.budget.toLocaleString() : "No budget specified"}
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Expected Closing Date</p>
                <p className="font-semibold text-slate-700 mt-0.5 flex items-center">
                  <Calendar className="h-4 w-4 mr-1.5 text-slate-400 shrink-0" />
                  {selectedLead?.expected_closing_date ? new Date(selectedLead.expected_closing_date).toLocaleDateString() : "No Date"}
                </p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Requirement Details</p>
              <div className="text-sm text-slate-600 mt-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200/50 whitespace-pre-wrap">
                {selectedLead?.requirement || "No requirement detailed."}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Notes</p>
              <div className="text-sm text-slate-600 mt-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200/50 whitespace-pre-wrap">
                {selectedLead?.notes || "No notes available."}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  setDialogOpen(false);
                  handleOpenEdit(selectedLead);
                }}
              >
                Edit Lead
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 block" htmlFor="company">
                  Company Name *
                </label>
                <Input
                  id="company"
                  required
                  value={formCompany}
                  onChange={(e) => setFormCompany(e.target.value)}
                  placeholder="e.g. Acme Corporation"
                  disabled={formSubmitting}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 block" htmlFor="contact">
                  Contact Person *
                </label>
                <Input
                  id="contact"
                  required
                  value={formContact}
                  onChange={(e) => setFormContact(e.target.value)}
                  placeholder="e.g. John Doe"
                  disabled={formSubmitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 block" htmlFor="mobile">
                  Mobile Number
                </label>
                <Input
                  id="mobile"
                  value={formMobile}
                  onChange={(e) => setFormMobile(e.target.value)}
                  placeholder="e.g. 9876543210"
                  disabled={formSubmitting}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 block" htmlFor="email">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="e.g. john@acme.com"
                  disabled={formSubmitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 block" htmlFor="city">
                  City
                </label>
                <Input
                  id="city"
                  value={formCity}
                  onChange={(e) => setFormCity(e.target.value)}
                  placeholder="e.g. New York"
                  disabled={formSubmitting}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 block" htmlFor="state">
                  State
                </label>
                <Input
                  id="state"
                  value={formState}
                  onChange={(e) => setFormState(e.target.value)}
                  placeholder="e.g. New York"
                  disabled={formSubmitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Select
                  label="Source"
                  value={formSource}
                  onChange={(e) => setFormSource(e.target.value)}
                  disabled={formSubmitting}
                >
                  <option value="Website">Website</option>
                  <option value="Referral">Referral</option>
                  <option value="Cold Call">Cold Call</option>
                  <option value="Cold Email">Cold Email</option>
                  <option value="Partner">Partner</option>
                  <option value="Event">Event</option>
                  <option value="Other">Other</option>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 block" htmlFor="budget">
                  Budget
                </label>
                <Input
                  id="budget"
                  type="number"
                  value={formBudget}
                  onChange={(e) => setFormBudget(e.target.value)}
                  placeholder="e.g. 50000"
                  disabled={formSubmitting}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 block" htmlFor="closing">
                  Closing Date
                </label>
                <Input
                  id="closing"
                  type="date"
                  value={formClosingDate}
                  onChange={(e) => setFormClosingDate(e.target.value)}
                  disabled={formSubmitting}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 block" htmlFor="requirement">
                Requirements
              </label>
              <textarea
                id="requirement"
                value={formRequirement}
                onChange={(e) => setFormRequirement(e.target.value)}
                placeholder="What are the lead requirements?"
                className="w-full min-h-[60px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
                disabled={formSubmitting}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 block" htmlFor="notes">
                Internal Notes
              </label>
              <textarea
                id="notes"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Add private notes for this opportunity..."
                className="w-full min-h-[60px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
                disabled={formSubmitting}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 block" htmlFor="assigned">
                  Assigned Date
                </label>
                <Input
                  id="assigned"
                  type="date"
                  value={formAssignedDate}
                  onChange={(e) => setFormAssignedDate(e.target.value)}
                  disabled={formSubmitting}
                />
              </div>

              <div className="space-y-1.5">
                <Select
                  label="Pipeline Stage"
                  value={formStage}
                  onChange={(e) => setFormStage(e.target.value)}
                  disabled={formSubmitting}
                >
                  {STAGES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1.5">
                <Select
                  label="Status"
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  disabled={formSubmitting}
                >
                  <option value="Active">Active</option>
                  <option value="Won">Won</option>
                  <option value="Lost">Lost</option>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
              <Button variant="outline" type="button" onClick={() => setDialogOpen(false)} disabled={formSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={formSubmitting}>
                {formSubmitting ? "Saving..." : dialogMode === "create" ? "Add Lead" : "Save Changes"}
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
}

export default function LeadsPage() {
  return (
    <React.Suspense fallback={<div className="py-8 text-center text-slate-500">Loading leads pipeline...</div>}>
      <LeadsContent />
    </React.Suspense>
  );
}
