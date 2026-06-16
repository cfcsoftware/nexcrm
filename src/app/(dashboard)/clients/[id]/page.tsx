"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getClientProfileDataAction, updateClientNotesAction } from "@/app/actions/clients";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Badge, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui";
import {
  ArrowLeft,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  FileSpreadsheet,
  TrendingUp,
  FileText,
  Save,
  CheckCircle2,
  Calendar,
  DollarSign,
  AlertCircle,
  Tag,
} from "lucide-react";

interface ClientProfileProps {
  params: Promise<{ id: string }>;
}

export default function ClientProfilePage({ params }: ClientProfileProps) {
  const router = useRouter();
  
  // Unwrap params using React.use()
  const resolvedParams = use(params);
  const clientId = resolvedParams.id;

  // States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [notes, setNotes] = useState("");
  const [saveNotesLoading, setSaveNotesLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load profile data
  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await getClientProfileDataAction(clientId);
      if (res.success) {
        setProfileData(res);
        setNotes(res.client?.notes || "");
      } else {
        setError(res.error || "Failed to load profile details.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [clientId]);

  const handleSaveNotes = async () => {
    setSaveNotesLoading(true);
    setSaveSuccess(false);
    try {
      const res = await updateClientNotesAction(clientId, notes);
      if (res.success) {
        setSaveSuccess(true);
        // Hide success message after 3 seconds
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert(res.error || "Failed to save notes.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaveNotesLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-500">
        <svg className="animate-spin h-8 w-8 text-blue-600 mb-3" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-sm font-medium">Opening account profile...</span>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="space-y-4 max-w-md mx-auto py-12 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900">Profile Error</h3>
        <p className="text-sm text-slate-500">{error || "Failed to load account profile data."}</p>
        <Link href="/clients">
          <Button variant="outline" className="mt-4 flex items-center justify-center space-x-1 mx-auto">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to directory</span>
          </Button>
        </Link>
      </div>
    );
  }

  const { client, leads, proposals } = profileData;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Back navigation */}
      <div>
        <Link href="/clients" className="inline-flex items-center space-x-1 text-sm text-slate-500 hover:text-blue-600 transition-colors font-medium">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to directory</span>
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-start space-x-4">
          <div className="bg-blue-600 text-white p-3 rounded-2xl shadow-md shrink-0">
            <Building className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold text-xs text-slate-450 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                {client.client_id}
              </span>
              {client.gst_number && (
                <span className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                  GST: {client.gst_number}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">{client.company_name}</h1>
            <p className="text-sm text-slate-500 flex items-center font-medium">
              <User className="h-4 w-4 mr-1 text-slate-400" />
              <span>Contact Person: {client.contact_person}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Profile info & Notes */}
        <div className="lg:col-span-1 space-y-6">
          {/* Account Profile Card */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="border-b border-slate-50 py-4">
              <CardTitle className="text-sm font-bold text-slate-800">Account Profile</CardTitle>
              <CardDescription>Primary communication details</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-sm">
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Phone Number</p>
                <a href={`tel:${client.mobile}`} className="font-semibold text-slate-700 hover:text-blue-600 flex items-center mt-1">
                  <Phone className="h-4 w-4 mr-2 text-slate-400 shrink-0" />
                  {client.mobile}
                </a>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Email Address</p>
                <a href={`mailto:${client.email}`} className="font-semibold text-slate-700 hover:text-blue-600 flex items-center mt-1">
                  <Mail className="h-4 w-4 mr-2 text-slate-400 shrink-0" />
                  {client.email}
                </a>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Corporate Office Address</p>
                <p className="font-semibold text-slate-700 flex items-start mt-1">
                  <MapPin className="h-4 w-4 mr-2 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    {client.address ? `${client.address}, ` : ""}
                    {client.city ? `${client.city}, ` : ""}
                    {client.state || "No location address"}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Account Notes text area (Persistent and editable notes) */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="border-b border-slate-50 py-4">
              <CardTitle className="text-sm font-bold text-slate-800">Client Log & History</CardTitle>
              <CardDescription>Persistent background timeline</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Log business updates, context history, or project details..."
                className="w-full min-h-[160px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
                disabled={saveNotesLoading}
              />
              
              <div className="flex items-center justify-between">
                {saveSuccess ? (
                  <span className="text-xs text-green-600 font-semibold flex items-center space-x-1 animate-in fade-in duration-200">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Notes saved!</span>
                  </span>
                ) : (
                  <span />
                )}
                
                <Button
                  onClick={handleSaveNotes}
                  className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white shrink-0 cursor-pointer"
                  disabled={saveNotesLoading}
                  size="sm"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{saveNotesLoading ? "Saving..." : "Save Notes"}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Related Leads & Proposals lists */}
        <div className="lg:col-span-2 space-y-6">
          {/* Related Leads Section */}
          <Card className="shadow-sm border-slate-200 bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-100 py-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-800">Linked Leads Pipeline</CardTitle>
                <CardDescription>Opportunity history for this client account</CardDescription>
              </div>
              <Badge variant="secondary" className="font-bold">
                {leads.length} Leads
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              {leads.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No leads created for this client account.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lead ID</TableHead>
                      <TableHead>Contact Person</TableHead>
                      <TableHead>Pipeline Stage</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead: any) => (
                      <TableRow key={lead.id}>
                        <TableCell className="align-middle font-mono font-bold text-xs text-slate-400">
                          {lead.lead_id}
                        </TableCell>
                        <TableCell className="align-middle font-semibold text-slate-900">
                          {lead.contact_person}
                        </TableCell>
                        <TableCell className="align-middle">
                          <Badge variant="info">{lead.stage}</Badge>
                        </TableCell>
                        <TableCell className="align-middle">
                          <Badge variant={lead.status === "Won" ? "success" : lead.status === "Lost" ? "destructive" : "warning"}>
                            {lead.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="align-middle text-right">
                          <Link href={`/leads?id=${lead.id}`}>
                            <button className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer">
                              View details
                            </button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Related Proposals Section */}
          <Card className="shadow-sm border-slate-200 bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-100 py-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-800">Proposals & Values</CardTitle>
                <CardDescription>Proposals generated for this account</CardDescription>
              </div>
              <Badge variant="secondary" className="font-bold">
                {proposals.length} Proposals
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              {proposals.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No proposals generated for this client account yet.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Proposal No</TableHead>
                      <TableHead>Proposal Title</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Proposal Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {proposals.map((prop: any) => (
                      <TableRow key={prop.id}>
                        <TableCell className="align-middle font-mono font-bold text-xs text-slate-450">
                          {prop.proposal_number}
                        </TableCell>
                        <TableCell className="align-middle font-semibold text-slate-900">
                          {prop.title}
                        </TableCell>
                        <TableCell className="align-middle font-bold text-slate-850">
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
                          <Link href={`/proposals?id=${prop.id}`}>
                            <button className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer">
                              Open contract
                            </button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
