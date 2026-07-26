"use client";

import { toast } from "sonner";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { LeadStatus } from "@/lib/validations/lead";

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  closed: "Closed",
};

export function StatusSelect({
  id,
  status,
  onOptimisticChange,
}: {
  id: string;
  status: LeadStatus;
  onOptimisticChange: (id: string, next: LeadStatus, previous: LeadStatus) => void;
}) {
  const handleChange = async (next: string) => {
    const nextStatus = next as LeadStatus;
    if (nextStatus === status) return;

    const previous = status;
    // Optimistic update — the UI reflects the new status immediately.
    onOptimisticChange(id, nextStatus, previous);

    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) {
        onOptimisticChange(id, previous, previous);
        toast.error("Couldn't update status — reverted.");
        return;
      }

      toast.success(`Marked ${STATUS_LABEL[nextStatus].toLowerCase()}.`);
    } catch {
      onOptimisticChange(id, previous, previous);
      toast.error("Network error — reverted.");
    }
  };

  return (
    <Select value={status} onValueChange={handleChange}>
      <SelectTrigger className="w-[150px]">
        <SelectValue>
          <Badge variant={status}>{STATUS_LABEL[status]}</Badge>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(STATUS_LABEL) as LeadStatus[]).map((s) => (
          <SelectItem key={s} value={s}>
            {STATUS_LABEL[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
