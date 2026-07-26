"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { StatusSelect } from "@/components/status-select";
import type { LeadStatus } from "@/lib/validations/lead";
import { Search } from "lucide-react";

export type Lead = {
  id: string;
  full_name: string;
  email: string;
  company: string | null;
  message: string;
  status: LeadStatus;
  created_at: string;
};

export function LeadsTable({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter(
      (lead) =>
        lead.full_name.toLowerCase().includes(q) ||
        lead.email.toLowerCase().includes(q)
    );
  }, [leads, query]);

  const handleOptimisticChange = (
    id: string,
    next: LeadStatus,
    _previous: LeadStatus
  ) => {
    setLeads((prev) =>
      prev.map((lead) => (lead.id === id ? { ...lead, status: next } : lead))
    );
  };

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
          aria-label="Search leads by name or email"
        />
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Logged</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  {leads.length === 0
                    ? "No leads logged yet."
                    : "Nothing matches that search."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.full_name}</TableCell>
                  <TableCell className="ledger-row text-sm">{lead.email}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {lead.company || "—"}
                  </TableCell>
                  <TableCell className="ledger-row text-xs text-muted-foreground">
                    {new Date(lead.created_at).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </TableCell>
                  <TableCell>
                    <StatusSelect
                      id={lead.id}
                      status={lead.status}
                      onOptimisticChange={handleOptimisticChange}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
