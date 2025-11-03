"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { startOrGetSession, saveAnswer, submitTest } from "@/actions/interviewee/test";

export default function Page({ params }) {
  const { testId } = params;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const timerRef = useRef(null);
  const [now, setNow] = useState(Date.now());

  const durationMin = data?.test?.durationMin ?? 0;
  const startedAt = data?.session?.startedAt ? new Date(data.session.startedAt).getTime() : null;
  const deadline = useMemo(() => (startedAt ? startedAt + durationMin * 60 * 1000 : null), [startedAt, durationMin]);
  const remainingMs = Math.max(0, (deadline ?? 0) - now);
  const remainingMin = Math.floor(remainingMs / 60000);
  const remainingSec = Math.floor((remainingMs % 60000) / 1000);
  const isSubmitted = !!data?.session?.submitted || remainingMs === 0;

  useEffect(() => {
    (async () => {
      const res = await startOrGetSession(testId);
      if (!res?.ok) {
        setError(res?.error || "Failed to load");
      } else {
        setData(res);
      }
      setLoading(false);
    })();
  }, [testId]);

  useEffect(() => {
    if (!deadline || isSubmitted) return;
    timerRef.current = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timerRef.current);
  }, [deadline, isSubmitted]);

  useEffect(() => {
    if (!data || !deadline) return;
    if (Date.now() >= deadline && !data.session.submitted) {
      // auto-submit
      submitTest({ testSessionId: data.session.id }).then((x) => {
        setData((d) => ({ ...d, session: x.session || d.session }));
      });
    }
  }, [deadline, data]);

  const mapAnswers = useMemo(() => {
    const m = new Map();
    for (const a of data?.answers || []) m.set(a.questionId, a.response);
    return m;
  }, [data]);

  const onAnswer = async (question, value) => {
    if (isSubmitted) return;
    setSaving(true);
    try {
      const res = await saveAnswer({
        testSessionId: data.session.id,
        questionId: question.id,
        response: value,
      });
      if (res?.success) {
        setData((prev) => {
          const next = { ...prev };
          const existing = next.answers.find((a) => a.questionId === question.id);
          if (existing) existing.response = Array.isArray(value) ? value.join(",") : String(value ?? "");
          else next.answers.push({
            id: res.answerId,
            testSessionId: prev.session.id,
            questionId: question.id,
            response: Array.isArray(value) ? value.join(",") : String(value ?? ""),
            autoScore: res.autoScore ?? null,
          });
          return next;
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const onSubmit = async () => {
    if (!data) return;
    const res = await submitTest({ testSessionId: data.session.id });
    if (res?.session) setData((d) => ({ ...d, session: res.session }));
  };

  if (loading) return (<div className="p-6">Loading...</div>);
  if (error) return (<div className="p-6 text-red-600">{error}</div>);

  const items = data?.test?.testQuestions || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{data?.test?.name}</h1>
          <p className="text-muted-foreground">Duration: {durationMin} min</p>
        </div>
        <div className={"px-3 py-1 rounded text-white " + (remainingMs <= 5 * 60 * 1000 ? "bg-red-600" : "bg-black")}> 
          {isSubmitted ? "Submitted" : `${String(remainingMin).padStart(2, "0")}:${String(remainingSec).padStart(2, "0")}`}
        </div>
      </div>

      <div className="space-y-6">
        {items.map((tq, idx) => {
          const q = tq.question;
          const current = mapAnswers.get(q.id) || "";
          const disabled = isSubmitted || saving;
          return (
            <div key={tq.id} className="border rounded p-4">
              <div className="font-medium">{idx + 1}. {q.text} <span className="text-xs text-gray-500">({q.type}, {q.score} pt)</span></div>
              {q.type === "TEXT" && (
                <textarea
                  className="mt-2 w-full border rounded p-2"
                  rows={4}
                  disabled={disabled}
                  defaultValue={current}
                  onBlur={(e) => onAnswer(q, e.target.value)}
                />
              )}
              {q.type === "MCQ" && (
                <div className="mt-2 space-y-2">
                  {q.choices.sort((a,b)=>a.index-b.index).map((c) => {
                    const selected = String(current || "").split(",").filter(Boolean).map(Number);
                    const isChecked = selected.includes(c.index);
                    return (
                      <label key={c.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          disabled={disabled}
                          defaultChecked={isChecked}
                          onChange={(e) => {
                            const next = new Set(selected);
                            if (e.target.checked) next.add(c.index); else next.delete(c.index);
                            onAnswer(q, Array.from(next));
                          }}
                        />
                        {c.text}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        {items.length === 0 && (
          <div className="text-sm text-gray-500">No questions available.</div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onSubmit}
          disabled={isSubmitted}
          className="bg-black text-white px-4 py-2 rounded"
        >
          {isSubmitted ? "Already submitted" : "Submit Test"}
        </button>
        {saving && <span className="text-xs text-gray-500">Saving...</span>}
      </div>
    </div>
  );
}
