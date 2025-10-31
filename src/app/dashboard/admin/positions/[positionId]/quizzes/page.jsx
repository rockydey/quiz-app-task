import Link from "next/link";
import { listQuizzesByPosition, createQuiz } from "@/actions/admin/quiz";
import { revalidatePath } from "next/cache";

const PositionQuizzesPage = async ({ params }) => {
  const { positionId } = params;
  const quizzes = await listQuizzesByPosition(positionId);

  async function addQuiz(formData) {
    "use server";
    const name = formData.get("name");
    const durationMin = formData.get("durationMin");
    const date = formData.get("date");
    await createQuiz({ positionId, name, durationMin, date });
    revalidatePath(`/dashboard/admin/positions/${positionId}/quizzes`);
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Quizzes</h1>
      <form action={addQuiz} className="flex gap-2 items-center flex-wrap">
        <input
          name="name"
          placeholder="Quiz name"
          className="border px-3 py-2 rounded"
        />
        <input
          name="durationMin"
          placeholder="Duration (min)"
          className="border px-3 py-2 rounded w-40"
        />
        <input type="date" name="date" className="border px-3 py-2 rounded" />
        <button className="bg-black text-white px-4 py-2 rounded">Add</button>
      </form>
      <div className="space-y-2">
        {quizzes.map((q) => (
          <div
            key={q.id}
            className="flex items-center justify-between border p-3 rounded"
          >
            <div>
              <div className="font-medium">{q.name}</div>
              <div className="text-xs text-gray-500">{q.durationMin} min</div>
            </div>
            <Link
              className="underline"
              href={`/dashboard/admin/quizzes/${q.id}/groups`}
            >
              Manage groups
            </Link>
          </div>
        ))}
        {quizzes.length === 0 && (
          <div className="text-sm text-gray-500">No quizzes</div>
        )}
      </div>
    </div>
  );
};

export default PositionQuizzesPage;
