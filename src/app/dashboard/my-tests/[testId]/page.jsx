export default async function Page({ params }) {
  const { testId } = await params;
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Test #{testId}</h1>
      <p className="text-muted-foreground">Test interface will appear here.</p>
    </div>
  );
}
