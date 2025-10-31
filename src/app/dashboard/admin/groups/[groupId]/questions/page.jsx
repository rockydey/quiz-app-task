"use client";

import { useEffect, useState } from "react";
import { listQuestionsByGroup, createQuestion } from "@/actions/admin/question";
import { useRouter } from "next/navigation";

const GroupQuestionsPage = ({ params }) => {
  const { groupId } = params;
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [type, setType] = useState("MCQ");
  const [text, setText] = useState("");
  const [score, setScore] = useState(1);
  const [choices, setChoices] = useState([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);

  useEffect(() => {
    (async () => {
      const data = await listQuestionsByGroup(groupId);
      setQuestions(data);
    })();
  }, [groupId]);

  const submit = async (e) => {
    e.preventDefault();
    const payload = { groupId, text, type, score, choices };
    const res = await createQuestion(payload);
    if (res?.success) {
      setText("");
      setChoices([
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ]);
      const data = await listQuestionsByGroup(groupId);
      setQuestions(data);
      router.refresh();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Questions</h1>

      <form onSubmit={submit} className="space-y-3 border p-4 rounded">
        <div className="flex gap-2 items-center">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="MCQ">MCQ</option>
            <option value="TEXT">Open Text</option>
          </select>
          <input
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className="border px-3 py-2 rounded w-24"
            placeholder="Score"
          />
        </div>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Question text"
          className="border px-3 py-2 rounded w-full"
        />
        {type === "MCQ" && (
          <div className="space-y-2">
            {choices.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={c.text}
                  onChange={(e) => {
                    const next = [...choices];
                    next[i].text = e.target.value;
                    setChoices(next);
                  }}
                  placeholder={`Choice ${i + 1}`}
                  className="border px-3 py-2 rounded flex-1"
                />
                <label className="text-sm flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={c.isCorrect}
                    onChange={(e) => {
                      const next = [...choices];
                      next[i].isCorrect = e.target.checked;
                      setChoices(next);
                    }}
                  />
                  Correct
                </label>
              </div>
            ))}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setChoices([...choices, { text: "", isCorrect: false }])
                }
                className="px-3 py-2 border rounded"
              >
                Add choice
              </button>
              {choices.length > 2 && (
                <button
                  type="button"
                  onClick={() => setChoices(choices.slice(0, -1))}
                  className="px-3 py-2 border rounded"
                >
                  Remove last
                </button>
              )}
            </div>
          </div>
        )}
        <button className="bg-black text-white px-4 py-2 rounded">
          Create question
        </button>
      </form>

      <div className="space-y-2">
        {questions.map((q) => (
          <div key={q.id} className="border p-3 rounded">
            <div className="font-medium">
              {q.text}{" "}
              <span className="text-xs text-gray-500">
                ({q.type}, {q.score} pt)
              </span>
            </div>
            {q.type === "MCQ" && (
              <ul className="list-disc pl-6 mt-1">
                {q.choices.map((c) => (
                  <li key={c.id} className={c.isCorrect ? "font-semibold" : ""}>
                    {c.text} {c.isCorrect ? "(correct)" : ""}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
        {questions.length === 0 && (
          <div className="text-sm text-gray-500">No questions</div>
        )}
      </div>
    </div>
  );
};

export default GroupQuestionsPage;
