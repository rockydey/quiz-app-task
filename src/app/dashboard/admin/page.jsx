import Link from "next/link";
import { listPositions, createPosition } from "@/actions/admin/position";
import { revalidatePath } from "next/cache";

const AdminPositionsPage = async () => {
  const positions = await listPositions();

  async function addPosition(formData) {
    "use server";
    const name = formData.get("name");
    await createPosition(name);
    revalidatePath("/dashboard/admin");
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Positions</h1>
      <form action={addPosition} className="flex gap-2">
        <input
          name="name"
          placeholder="e.g. Frontend Developer"
          className="border px-3 py-2 rounded w-80"
        />
        <button className="bg-black text-white px-4 py-2 rounded">Add</button>
      </form>
      <div className="space-y-2">
        {positions.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between border p-3 rounded"
          >
            <div>{p.name}</div>
            <Link
              className="underline"
              href={`/dashboard/admin/positions/${p.id}/quizzes`}
            >
              Manage quizzes
            </Link>
          </div>
        ))}
        {positions.length === 0 && (
          <div className="text-sm text-gray-500">No positions</div>
        )}
      </div>
    </div>
  );
};

export default AdminPositionsPage;
