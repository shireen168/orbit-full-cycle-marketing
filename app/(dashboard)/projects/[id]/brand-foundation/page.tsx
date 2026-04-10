import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { BrandFoundationModule } from "@/components/orbit/brand-foundation-module";
import type { OrbitProject } from "@/types/orbit";

export default async function BrandFoundationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;
  const { data: project } = await supabase
    .from("orbit_projects")
    .select("id, name, market_intel, brand_foundation")
    .eq("id", id)
    .eq("user_id", userId)
    .single<Pick<OrbitProject, "id" | "name" | "market_intel" | "brand_foundation">>();

  if (!project) redirect("/dashboard");

  return (
    <BrandFoundationModule
      projectId={id}
      projectName={project.name}
      initialData={project.brand_foundation}
      marketIntel={project.market_intel}
    />
  );
}
