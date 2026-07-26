import { LeadForm } from "@/components/lead-form";
import { Footer } from "@/components/footer";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <p className="stamp mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Intake Desk
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              Tell us what you need
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Log a lead below — it lands on our desk the moment you hit submit.
            </p>
          </div>

          <div className="perforated-divider mb-8" />

          <LeadForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
