import Link from "next/link";
import { listGroupsByTest, createGroup } from "@/actions/admin/group";
import { revalidatePath } from "next/cache";

const QuizGroupsPage = async ({ params }) => {
  const { testId } = params;
  const groups = await listGroupsByTest(testId);

  async function addGroup(formData) {
    "use server";
    const name = formData.get("name");
    await createGroup({ testId, name });
    revalidatePath(`/dashboard/admin/quizzes/${testId}/groups`);
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Groups</h1>
      <form action={addGroup} className="flex gap-2">
        <input
          name="name"
          placeholder="e.g. Logic"
          className="border px-3 py-2 rounded"
        />
        <button className="bg-black text-white px-4 py-2 rounded">Add</button>
      </form>
      <div className="space-y-2">
        {groups.map((g) => (
          <div
            key={g.id}
            className="flex items-center justify-between border p-3 rounded"
          >
            <div>{g.name}</div>
            <Link
              className="underline"
              href={`/dashboard/admin/groups/${g.id}/questions`}
            >
              Manage questions
            </Link>
          </div>
        ))}
        {groups.length === 0 && (
          <div className="text-sm text-gray-500">No groups</div>
        )}
      </div>
    </div>
  );
};

export default QuizGroupsPage;
