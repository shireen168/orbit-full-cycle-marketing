import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { AudienceStudioModule } from "@/components/orbit/audience-studio-module";
import type { OrbitProject } from "@/types/orbit";

export default async function AudienceStudioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;
  const { data: project } = await supabase
    .from("orbit_projects")
    .select("id, name, brand_foundation, audience_studio")
    .eq("id", id)
    .eq("user_id", userId)
    .single<
      Pick<OrbitProject, "id" | "name" | "brand_foundation" | "audience_studio">
    >();

  if (!project) redirect("/dashboard");

  return (
    <AudienceStudioModule
      projectId={id}
      projectName={project.name}
      initialData={project.audience_studio}
      brandFoundation={project.brand_foundation}
    />
  );
}
