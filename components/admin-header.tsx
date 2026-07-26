"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function AdminHeader({ email }: { email: string | null }) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  };

  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="stamp text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Intake Desk
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight">Leads</h1>
        {email && <p className="mt-1 text-sm text-muted-foreground">Signed in as {email}</p>}
      </div>
      <Button variant="outline" size="sm" onClick={handleSignOut}>
        <LogOut className="mr-2 h-4 w-4" />
        Sign out
      </Button>
    </div>
  );
}
