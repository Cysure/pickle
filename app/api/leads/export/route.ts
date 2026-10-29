import { leadsCsv, leadsEnabled } from "@/lib/leads/runner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!leadsEnabled()) return new Response("Not found", { status: 404 });
  return new Response(leadsCsv(), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pickle-bali-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
