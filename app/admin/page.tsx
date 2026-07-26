import { createClient } from "@/lib/supabase/server";
import { LeadsTable, type Lead } from "@/components/leads-table";
import { AdminHeader } from "@/components/admin-header";
import { Footer } from "@/components/footer";

// Middleware already guarantees a session exists before this renders,
// but route protection for data access is enforced independently by
// Postgres RLS (see supabase/schema.sql) — not by this check alone.
export default async function AdminPage() {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data: leads } = await supabase
    .from("leads")
    .select("id, full_name, email, company, message, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <AdminHeader email={session?.user.email ?? null} />
          <LeadsTable initialLeads={(leads as Lead[]) ?? []} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
