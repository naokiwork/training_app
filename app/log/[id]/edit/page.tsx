import { EditLogForm } from "./EditLogForm";

export default async function EditLogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditLogForm sessionId={id} />;
}
