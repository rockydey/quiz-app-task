import Link from "next/link";
import { listAssignedTestsForCurrentUser } from "@/actions/interviewee/assigned-tests";

function formatDate(d) {
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return "";
  }
}

function minutes(ms) {
  return Math.max(0, Math.floor(ms / 60000));
}

function computeCard(a) {
  const { latestSession, test } = a;
  const totalQuestions = test?.testQuestions?.length || 0;
  if (!latestSession)
    return {
      status: "Not Started",
      progressPct: 0,
      remaining: test?.durationMin,
    };
  const answered = 0; // can be derived if we store per-question progress
  const progressPct = totalQuestions
    ? Math.round((answered / totalQuestions) * 100)
    : 0;
  const now = Date.now();
  const started = new Date(latestSession.startedAt).getTime();
  const endAt = started + (test?.durationMin || 0) * 60 * 1000;
  const remainingMin = minutes(endAt - now);
  const status = latestSession.submitted ? "Completed" : "In Progress";
  return { status, progressPct, remaining: remainingMin };
}

export default async function Page() {
  const items = await listAssignedTestsForCurrentUser();

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">My Tests</h1>
        <p className="text-muted-foreground">
          View and take your assigned tests
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {items.map((a) => {
          const meta = computeCard(a);
          const t = a.test;
          const questions = t?.testQuestions?.length || 0;
          return (
            <div
              key={a.id}
              className="border rounded-xl p-5 shadow-sm bg-white"
            >
              <div className="flex items-center justify-between">
                <div className="text-sm px-2 py-1 rounded-full bg-gray-100">
                  {meta.status}
                </div>
                {meta.status === "Completed" && (
                  <div className="text-emerald-600 text-sm font-semibold">
                    Score
                  </div>
                )}
              </div>

              <div className="mt-3 space-y-1">
                <div className="font-semibold">{t?.name}</div>
                <div className="text-xs text-gray-500">{t?.position?.name}</div>
              </div>

              <div className="mt-3 grid grid-cols-3 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  {t?.durationMin} min
                </div>
                <div className="flex items-center gap-1">
                  {questions} questions
                </div>
                <div className="flex items-center gap-1">
                  Assigned: {formatDate(a.assignedAt)}
                </div>
              </div>

              {meta.status !== "Not Started" && !a.latestSession?.submitted && (
                <div className="mt-3">
                  <div className="h-2 bg-gray-100 rounded">
                    <div
                      className="h-2 bg-black rounded"
                      style={{ width: `${meta.progressPct}%` }}
                    />
                  </div>
                  <div className="text-xs mt-1 text-red-500">
                    {meta.remaining} minutes remaining
                  </div>
                </div>
              )}

              <div className="mt-4">
                {meta.status === "Not Started" && (
                  <Link
                    href={`/dashboard/my-tests/${t.id}`}
                    className="inline-flex items-center justify-center w-full bg-black text-white rounded-md py-2"
                  >
                    Start Test
                  </Link>
                )}
                {meta.status === "In Progress" &&
                  !a.latestSession?.submitted && (
                    <Link
                      href={`/dashboard/my-tests/${t.id}`}
                      className="inline-flex items-center justify-center w-full bg-black text-white rounded-md py-2"
                    >
                      Continue Test
                    </Link>
                  )}
                {a.latestSession?.submitted && (
                  <div className="text-sm text-gray-500 py-2 text-center border rounded-md">
                    Completed
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {items.length === 0 && (
          <div className="text-sm text-gray-500">No tests assigned.</div>
        )}
      </div>
    </div>
  );
}
