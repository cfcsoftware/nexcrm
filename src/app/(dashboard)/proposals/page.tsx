"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  getProposalsAction,
  getRelationsListAction,
  createProposalAction,
  updateProposalAction,
  deleteProposalAction,
} from "@/app/actions/proposals";
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
  Eye,
  Edit2,
  Trash2,
  AlertCircle,
  Calendar,
  DollarSign,
  Briefcase,
  Layers,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

function ProposalsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL parameters query (e.g. from global search redirection)
  const queryId = searchParams.get("id");

  // States
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    accepted: 0,
    rejected: 0,
    pending: 0,
    totalValue: 0,
    acceptedValue: 0,
    pendingValue: 0,
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Dropdown relations
  const [clientsList, setClientsList] = useState<any[]>([]);
  const [leadsList, setLeadsList] = useState<any[]>([]);

  // Dialog Modals
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view">("create");
  const [selectedProposal, setSelectedProposal] = useState<any>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState("");
  const [formClientId, setFormClientId] = useState("");
  const [formLeadId, setFormLeadId] = useState("");
  const [formPropDate, setFormPropDate] = useState("");
  const [formExpiryDate, setFormExpiryDate] = useState("");
  const [formValue, setFormValue] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formStatus, setFormStatus] = useState("Draft");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Load Proposals
  const loadProposals = async () => {
    setLoading(true);
    try {
      const res = await getProposalsAction(search, statusFilter);
      if (res.success && res.proposals) {
        setProposals(res.proposals);
        setStats(res.stats);

        // If queryId is in URL, open the proposal detail view
        if (queryId) {
          const foundProp = res.proposals.find((p) => p.id === queryId);
          if (foundProp) {
            handleViewProposal(foundProp);
            // Clear URL param
            router.replace("/proposals");
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load Dropdowns
  const loadDropdowns = async () => {
    try {
      const res = await getRelationsListAction();
      if (res.success) {
        setClientsList(res.clients || []);
        setLeadsList(res.leads || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadProposals();
  }, [search, statusFilter, queryId]);

  useEffect(() => {
    loadDropdowns();
  }, []);

  // Form handlers
  const handleOpenCreate = () => {
    setDialogMode("create");
    setSelectedProposal(null);
    setFormTitle("");
    setFormClientId(clientsList[0]?.id || "");
    setFormLeadId("");
    setFormPropDate(new Date().toISOString().substring(0, 10));
    setFormExpiryDate("");
    setFormValue("");
    setFormDesc("");
    setFormStatus("Draft");
    setFormError(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (prop: any) => {
    setDialogMode("edit");
    setSelectedProposal(prop);
    setFormTitle(prop.title);
    setFormClientId(prop.client_id || "");
    setFormLeadId(prop.lead_id || "");
    setFormPropDate(prop.proposal_date ? prop.proposal_date.substring(0, 10) : "");
    setFormExpiryDate(prop.expiry_date ? prop.expiry_date.substring(0, 10) : "");
    setFormValue(prop.value ? prop.value.toString() : "");
    setFormDesc(prop.description || "");
    setFormStatus(prop.status);
    setFormError(null);
    setDialogOpen(true);
  };

  const handleViewProposal = (prop: any) => {
    setDialogMode("view");
    setSelectedProposal(prop);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSubmitting(true);

    if (!formClientId) {
      setFormError("Please select a Client.");
      setFormSubmitting(false);
      return;
    }

    const payload = {
      title: formTitle,
      client_id: formClientId,
      lead_id: formLeadId || undefined,
      proposal_date: formPropDate,
      expiry_date: formExpiryDate || undefined,
      value: parseFloat(formValue) || 0,
      description: formDesc,
      status: formStatus,
    };

    try {
      let res;
      if (dialogMode === "create") {
        res = await createProposalAction(payload);
      } else {
        res = await updateProposalAction(selectedProposal.id, payload);
      }

      if (res.success) {
        setDialogOpen(false);
        loadProposals();
      } else {
        setFormError(res.error || "Failed to save proposal.");
      }
    } catch (err) {
      setFormError("An unexpected error occurred.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this proposal?")) return;
    try {
      const res = await deleteProposalAction(id);
      if (res.success) {
        loadProposals();
      } else {
        alert(res.error || "Failed to delete proposal.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Proposals Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Manage, draft, and track sent contracts value.</p>
        </div>
        <Button onClick={handleOpenCreate} className="flex items-center space-x-1">
          <Plus className="h-4 w-4" />
          <span>Create Proposal</span>
        </Button>
      </div>

      {/* Proposals statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-50/50 border-slate-200/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Proposals</p>
              <p className="text-xl font-bold text-slate-950 mt-1">{stats.total}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">${stats.totalValue.toLocaleString()}</p>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-100 text-slate-700">
              <FileText className="h-5 w-5 shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50/30 border-green-100/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Accepted Proposals</p>
              <p className="text-xl font-bold text-green-950 mt-1">{stats.accepted}</p>
              <p className="text-[10px] text-green-600 mt-0.5">${stats.acceptedValue.toLocaleString()}</p>
            </div>
            <div className="bg-white p-2 rounded-lg border border-green-100 text-green-600">
              <CheckCircle className="h-5 w-5 shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50/30 border-blue-100/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Pending Proposals</p>
              <p className="text-xl font-bold text-blue-950 mt-1">{stats.pending}</p>
              <p className="text-[10px] text-blue-600 mt-0.5">${stats.pendingValue.toLocaleString()}</p>
            </div>
            <div className="bg-white p-2 rounded-lg border border-blue-100 text-blue-600">
              <Clock className="h-5 w-5 shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50/30 border-red-100/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">Rejected Proposals</p>
              <p className="text-xl font-bold text-red-950 mt-1">{stats.rejected}</p>
              <p className="text-[10px] text-red-400 mt-0.5">Lost Opportunity</p>
            </div>
            <div className="bg-white p-2 rounded-lg border border-red-100 text-red-600">
              <XCircle className="h-5 w-5 shrink-0" />
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
              placeholder="Search proposals by title or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full bg-slate-50/30"
            />
          </div>
          
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-40 h-10 shrink-0"
          >
            <option value="all">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
          </Select>
        </CardContent>
      </Card>

      {/* Proposals List Table */}
      <Card className="shadow-sm border-slate-200 overflow-hidden bg-white">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-500">
              <svg className="animate-spin h-6 w-6 text-blue-600 mb-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-xs">Fetching proposal documents...</span>
            </div>
          ) : proposals.length === 0 ? (
            <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center">
              <FileText className="h-10 w-10 text-slate-300 mb-3" />
              <p className="font-semibold text-sm">No proposals found</p>
              <p className="text-xs text-slate-400 mt-1">Generate a proposal to start recording values.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proposal No</TableHead>
                  <TableHead>Proposal Title</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Proposal Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proposals.map((prop) => (
                  <TableRow key={prop.id}>
                    <TableCell className="align-middle font-mono font-bold text-xs text-slate-500">
                      {prop.proposal_number}
                    </TableCell>
                    <TableCell className="align-middle">
                      <div className="flex flex-col">
                        <span
                          className="font-semibold text-slate-950 cursor-pointer hover:text-blue-600"
                          onClick={() => handleViewProposal(prop)}
                        >
                          {prop.title}
                        </span>
                        {prop.leads && (
                          <span className="text-[10px] text-slate-400 mt-0.5">
                            Lead Ref: {prop.leads.company_name}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="align-middle font-semibold text-slate-700">
                      {prop.clients?.company_name || "Unassigned"}
                    </TableCell>
                    <TableCell className="align-middle font-bold text-slate-900">
                      ${prop.value?.toLocaleString()}
                    </TableCell>
                    <TableCell className="align-middle text-xs">
                      {prop.proposal_date ? new Date(prop.proposal_date).toLocaleDateString() : "No Date"}
                    </TableCell>
                    <TableCell className="align-middle">
                      <Badge
                        variant={
                          prop.status === "Accepted"
                            ? "success"
                            : prop.status === "Rejected"
                            ? "destructive"
                            : prop.status === "Sent"
                            ? "info"
                            : "secondary"
                        }
                      >
                        {prop.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="align-middle text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => handleViewProposal(prop)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-50 cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(prop)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-blue-50/50 cursor-pointer"
                          title="Edit Proposal"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(prop.id)}
                          className="p-1.5 text-slate-400 hover:text-red-650 rounded-md hover:bg-red-50 cursor-pointer"
                          title="Delete Proposal"
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
            ? "Create Proposal Document"
            : dialogMode === "edit"
            ? "Edit Proposal Details"
            : "Proposal Document Details"
        }
      >
        {dialogMode === "view" ? (
          /* VIEW VIEW */
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="font-mono font-bold text-xs text-slate-400 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">
                {selectedProposal?.proposal_number}
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-2">{selectedProposal?.title}</h3>
              <div className="flex flex-wrap gap-2 pt-1.5">
                <Badge variant={selectedProposal?.status === "Accepted" ? "success" : selectedProposal?.status === "Rejected" ? "destructive" : selectedProposal?.status === "Sent" ? "info" : "secondary"}>
                  Status: {selectedProposal?.status}
                </Badge>
                <Badge variant="outline" className="font-bold text-slate-800">
                  Value: ${selectedProposal?.value?.toLocaleString()}
                </Badge>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-2.5 text-sm">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Client Company</p>
                <p className="font-semibold text-slate-700 mt-0.5">
                  {selectedProposal?.clients?.company_name || "Unassigned"}
                </p>
              </div>

              {selectedProposal?.leads && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Related Lead</p>
                  <p className="font-semibold text-slate-700 mt-0.5">
                    {selectedProposal?.leads?.company_name} ({selectedProposal?.leads?.contact_person})
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Proposal Date</p>
                  <p className="font-semibold text-slate-700 mt-0.5 flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-slate-400" />
                    {selectedProposal?.proposal_date ? new Date(selectedProposal.proposal_date).toLocaleDateString() : "No Date"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Expiry Date</p>
                  <p className="font-semibold text-slate-700 mt-0.5 flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-slate-400" />
                    {selectedProposal?.expiry_date ? new Date(selectedProposal.expiry_date).toLocaleDateString() : "No Date"}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Scope of Work Description</p>
              <div className="text-sm text-slate-600 mt-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200/50 whitespace-pre-wrap min-h-[100px]">
                {selectedProposal?.description || "No description provided."}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  setDialogOpen(false);
                  handleOpenEdit(selectedProposal);
                }}
              >
                Edit Proposal
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
                Proposal Title *
              </label>
              <Input
                id="title"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Website development contract"
                disabled={formSubmitting}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Select
                  label="Client Selection *"
                  value={formClientId}
                  onChange={(e) => setFormClientId(e.target.value)}
                  disabled={formSubmitting}
                >
                  <option value="">-- Choose Client --</option>
                  {clientsList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company_name} ({c.contact_person})
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1.5">
                <Select
                  label="Related Lead (Optional)"
                  value={formLeadId}
                  onChange={(e) => setFormLeadId(e.target.value)}
                  disabled={formSubmitting}
                >
                  <option value="">-- Choose Lead (None) --</option>
                  {leadsList.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.company_name} ({l.contact_person})
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 block" htmlFor="value">
                  Proposal Value ($) *
                </label>
                <Input
                  id="value"
                  type="number"
                  required
                  value={formValue}
                  onChange={(e) => setFormValue(e.target.value)}
                  placeholder="e.g. 15000"
                  disabled={formSubmitting}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 block" htmlFor="prop_date">
                  Proposal Date *
                </label>
                <Input
                  id="prop_date"
                  type="date"
                  required
                  value={formPropDate}
                  onChange={(e) => setFormPropDate(e.target.value)}
                  disabled={formSubmitting}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 block" htmlFor="expiry_date">
                  Expiry Date
                </label>
                <Input
                  id="expiry_date"
                  type="date"
                  value={formExpiryDate}
                  onChange={(e) => setFormExpiryDate(e.target.value)}
                  disabled={formSubmitting}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 block" htmlFor="desc">
                Scope of Work Description
              </label>
              <textarea
                id="desc"
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Details of deliverables, timelines, milestones, etc..."
                className="w-full min-h-[120px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
                disabled={formSubmitting}
              />
            </div>

            <div className="space-y-1.5">
              <Select
                label="Status"
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value)}
                disabled={formSubmitting}
              >
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
              </Select>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
              <Button variant="outline" type="button" onClick={() => setDialogOpen(false)} disabled={formSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={formSubmitting}>
                {formSubmitting ? "Generating..." : dialogMode === "create" ? "Create Proposal" : "Save Changes"}
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
}

export default function ProposalsPage() {
  return (
    <React.Suspense fallback={<div className="py-8 text-center text-slate-500">Loading proposals...</div>}>
      <ProposalsContent />
    </React.Suspense>
  );
}
