import { useEffect, useState } from "react";
import { ListTodo, Plus, CheckCircle2, Circle, Trash2 } from "lucide-react";
import ClientToolShell from "@/components/client/ClientToolShell";
import { useAuth } from "@/hooks/AuthProvider";

type Task = { id: string; title: string; done: boolean; createdAt: string };

const STARTERS = [
  "Upload ID to Document Vault",
  "Book a discovery consultation",
  "Complete rental readiness checklist",
  "Message advisor about insurance questions",
  "Set housing budget and preferred cities",
];

export default function TaskCenter() {
  const { user } = useAuth();
  const key = `fswg:tasks:${user?._id || "guest"}`;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(key) || "null");
      if (Array.isArray(raw)) setTasks(raw);
      else {
        const seeded = STARTERS.map((t, i) => ({
          id: `seed-${i}`,
          title: t,
          done: false,
          createdAt: new Date().toISOString(),
        }));
        setTasks(seeded);
        localStorage.setItem(key, JSON.stringify(seeded));
      }
    } catch {
      setTasks([]);
    }
  }, [key]);

  const persist = (next: Task[]) => {
    setTasks(next);
    localStorage.setItem(key, JSON.stringify(next));
  };

  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <ClientToolShell
      eyebrow="In-app · 07"
      title="Task center"
      description="Personal action list for rentals, consultations, docs, and follow-ups. Stays in your client hub."
      icon={ListTodo}
    >
      <div className="border-b border-[#E5EAF0] pb-8">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-[#6B7280]">
            <span className="font-bold text-[#12213E]">{doneCount}</span> of {tasks.length} complete
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim()) return;
            persist([
              {
                id: String(Date.now()),
                title: title.trim(),
                done: false,
                createdAt: new Date().toISOString(),
              },
              ...tasks,
            ]);
            setTitle("");
          }}
          className="mb-5 flex gap-2"
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a task…"
            className="flex-1 border-0 border-b border-[#E5EAF0] bg-transparent px-4 py-3 text-sm outline-none focus:border-[#C69259]"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#12213E] px-4 py-3 text-sm font-semibold text-white"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </form>
        <ul className="space-y-2">
          {tasks.map((t) => (
            <li
              key={t.id}
              className="flex items-center gap-3  px-3 py-3"
            >
              <button
                type="button"
                onClick={() =>
                  persist(tasks.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)))
                }
              >
                {t.done ? (
                  <CheckCircle2 className="h-5 w-5 text-[#65A30D]" />
                ) : (
                  <Circle className="h-5 w-5 text-[#94A3B8]" />
                )}
              </button>
              <span
                className={`flex-1 text-sm ${
                  t.done ? "text-[#9CA3AF] line-through" : "font-medium text-[#12213E]"
                }`}
              >
                {t.title}
              </span>
              <button
                type="button"
                onClick={() => persist(tasks.filter((x) => x.id !== t.id))}
                className="rounded-lg p-2 text-red-400 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </ClientToolShell>
  );
}
