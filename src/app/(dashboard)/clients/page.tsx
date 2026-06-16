"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getClientsAction, createClientAction, updateClientAction, deleteClientAction } from "@/app/actions/clients";
import {
  Button,
  Input,
  Card,
  CardContent,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Dialog,
} from "@/components/ui";
import { Plus, Search, Eye, Edit2, Trash2, AlertCircle, Phone, Mail, MapPin, Building, Building2 } from "lucide-react";

export default function ClientsPage() {
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  // Dialog modals
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selectedClient, setSelectedClient] = useState<any>(null);

  // Form Fields
  const [formCompany, setFormCompany] = useState("");
  const [formContact, setFormContact] = useState("");
  const [formMobile, setFormMobile] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formState, setFormState] = useState("");
  const [formGstNumber, setFormGstNumber] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Load clients
  const loadClients = async () => {
    setLoading(true);
    try {
      const res = await getClientsAction(search);
      if (res.success && res.clients) {
        setClients(res.clients);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, [search]);

  // Modal open helpers
  const handleOpenCreate = () => {
    setDialogMode("create");
    setSelectedClient(null);
    setFormCompany("");
    setFormContact("");
    setFormMobile("");
    setFormEmail("");
    setFormAddress("");
    setFormCity("");
    setFormState("");
    setFormGstNumber("");
    setFormNotes("");
    setFormError(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (client: any) => {
    setDialogMode("edit");
    setSelectedClient(client);
    setFormCompany(client.company_name);
    setFormContact(client.contact_person);
    setFormMobile(client.mobile);
    setFormEmail(client.email);
    setFormAddress(client.address || "");
    setFormCity(client.city || "");
    setFormState(client.state || "");
    setFormGstNumber(client.gst_number || "");
    setFormNotes(client.notes || "");
    setFormError(null);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSubmitting(true);

    const payload = {
      company_name: formCompany,
      contact_person: formContact,
      mobile: formMobile,
      email: formEmail,
      address: formAddress,
      city: formCity,
      state: formState,
      gst_number: formGstNumber,
      notes: formNotes,
    };

    try {
      let res;
      if (dialogMode === "create") {
        res = await createClientAction(payload);
      } else {
        res = await updateClientAction(selectedClient.id, payload);
      }

      if (res.success) {
        setDialogOpen(false);
        loadClients();
      } else {
        setFormError(res.error || "Failed to save client.");
      }
    } catch (err) {
      setFormError("An unexpected error occurred.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this client? This will delete all associated proposals too!")) return;
    try {
      const res = await deleteClientAction(id);
      if (res.success) {
        loadClients();
      } else {
        alert(res.error || "Failed to delete client.");
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Clients Directory</h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse and manage accounts, or view detailed history profiles.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="flex items-center space-x-1 shrink-0">
          <Plus className="h-4 w-4" />
          <span>Create Client</span>
        </Button>
      </div>

      {/* Filter and Search Panel */}
      <Card className="shadow-sm border-slate-200">
        <CardContent className="p-4 flex gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search clients by company name, contact, email, or client ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full bg-slate-50/30"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients List Directory */}
      <Card className="shadow-sm border-slate-200 overflow-hidden bg-white">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-500">
              <svg className="animate-spin h-6 w-6 text-blue-600 mb-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-xs">Accessing accounts directory...</span>
            </div>
          ) : clients.length === 0 ? (
            <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center">
              <Building className="h-10 w-10 text-slate-300 mb-3" />
              <p className="font-semibold text-sm">No clients registered</p>
              <p className="text-xs text-slate-400 mt-1">Convert a lead or add a client manually.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client ID</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="align-middle font-mono font-bold text-xs text-slate-500">
                      {client.client_id}
                    </TableCell>
                    <TableCell className="align-middle font-bold text-slate-900">
                      <Link href={`/clients/${client.id}`} className="hover:text-blue-650 hover:underline">
                        {client.company_name}
                      </Link>
                    </TableCell>
                    <TableCell className="align-middle">{client.contact_person}</TableCell>
                    <TableCell className="align-middle text-xs">{client.mobile}</TableCell>
                    <TableCell className="align-middle text-xs font-medium text-slate-650">{client.email}</TableCell>
                    <TableCell className="align-middle text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <Link href={`/clients/${client.id}`}>
                          <button
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-50 cursor-pointer"
                            title="View Profile"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleOpenEdit(client)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-blue-50/50 cursor-pointer"
                          title="Edit Account"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(client.id)}
                          className="p-1.5 text-slate-400 hover:text-red-650 rounded-md hover:bg-red-50 cursor-pointer"
                          title="Delete Account"
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

      {/* CREATE / EDIT DIALOG */}
      <Dialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={dialogMode === "create" ? "Add Client Account" : "Edit Client Details"}
      >
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
                placeholder="e.g. Acme Corp"
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
                Mobile Number *
              </label>
              <Input
                id="mobile"
                required
                value={formMobile}
                onChange={(e) => setFormMobile(e.target.value)}
                placeholder="e.g. 9876543210"
                disabled={formSubmitting}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 block" htmlFor="email">
                Email Address *
              </label>
              <Input
                id="email"
                type="email"
                required
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="e.g. john@acme.com"
                disabled={formSubmitting}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 block" htmlFor="address">
              Address
            </label>
            <Input
              id="address"
              value={formAddress}
              onChange={(e) => setFormAddress(e.target.value)}
              placeholder="e.g. 123 Business Road"
              disabled={formSubmitting}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 block" htmlFor="city">
                City
              </label>
              <Input
                id="city"
                value={formCity}
                onChange={(e) => setFormCity(e.target.value)}
                placeholder="New York"
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
                placeholder="New York"
                disabled={formSubmitting}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 block" htmlFor="gst">
                GST Number
              </label>
              <Input
                id="gst"
                value={formGstNumber}
                onChange={(e) => setFormGstNumber(e.target.value)}
                placeholder="e.g. 36AAAAA1111A1Z1"
                disabled={formSubmitting}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 block" htmlFor="notes">
              Client Account Notes
            </label>
            <textarea
              id="notes"
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="Private overview, history details..."
              className="w-full min-h-[80px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
              disabled={formSubmitting}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setDialogOpen(false)} disabled={formSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={formSubmitting}>
              {formSubmitting ? "Saving..." : dialogMode === "create" ? "Create Account" : "Save Changes"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
