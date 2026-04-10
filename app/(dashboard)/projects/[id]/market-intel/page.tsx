import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { MarketIntelModule } from "@/components/orbit/market-intel-module";
import type { OrbitProject } from "@/types/orbit";

export default async function MarketIntelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;
  const { data: project } = await supabase
    .from("orbit_projects")
    .select("id, name, market_intel")
    .eq("id", id)
    .eq("user_id", userId)
    .single<Pick<OrbitProject, "id" | "name" | "market_intel">>();

  if (!project) redirect("/dashboard");

  return (
    <MarketIntelModule
      projectId={id}
      projectName={project.name}
      initialData={project.market_intel}
    />
  );
}
