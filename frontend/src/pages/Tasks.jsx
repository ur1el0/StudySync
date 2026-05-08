import React, { useEffect, useState } from "react";
import api from "../api/axios";

const initialForm = { title: "", description: "", dueDate: "", priority: "Medium", status: "Pending", subjectId: "" };
const toDateInput  = v => v ? new Date(v).toISOString().slice(0, 10) : "";
const priorityMeta = { High: { color: "#ef4444", icon: "priority_high" }, Medium: { color: "#ffb783", icon: "remove" }, Low: { color: "#22c55e", icon: "arrow_downward" } };
const statusMeta   = { Pending: "#94a3b8", "In Progress": "#ffb783", Completed: "#22c55e" };

const Tasks = () => {
  const [tasks,     setTasks]     = useState([]);
  const [subjects,  setSubjects]  = useState([]);
  const [form,      setForm]      = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState("");
  const [filter,    setFilter]    = useState("All");
  const [showForm,  setShowForm]  = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const [s, t] = await Promise.all([api.get("/subjects"), api.get("/tasks")]);
      setSubjects(s.data);
      setTasks(t.data);
      if (!form.subjectId && s.data.length > 0)
        setForm(p => ({ ...p, subjectId: s.data[0]._id }));
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const reset = () => {
    setEditingId(null);
    setForm({ ...initialForm, subjectId: subjects[0]?._id || "" });
    setShowForm(false);
  };

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault(); setError(""); setSaving(true);
    try {
      editingId ? await api.put(`/tasks/${editingId}`, form)
                : await api.post("/tasks", form);
      reset(); load();
    } catch (e) { setError(e.response?.data?.message || "Failed to save"); }
    finally { setSaving(false); }
  };

  const startEdit = task => {
    setEditingId(task._id);
    setForm({ subjectId: task.subjectId?._id || "", title: task.title, description: task.description || "", dueDate: toDateInput(task.dueDate), priority: task.priority, status: task.status });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async id => {
    if (!confirm("Delete this task?")) return;
    try { await api.delete(`/tasks/${id}`); if (editingId === id) reset(); load(); }
    catch (e) { setError(e.response?.data?.message || "Failed to delete"); }
  };

  // Quick status toggle
  const toggleStatus = async task => {
    const next = task.status === "Completed" ? "Pending" : task.status === "Pending" ? "In Progress" : "Completed";
    try { await api.put(`/tasks/${task._id}`, { ...task, subjectId: task.subjectId?._id, status: next }); load(); }
    catch (_) {}
  };

  const filters = ["All", "Pending", "In Progress", "Completed"];
  const filtered = filter === "All" ? tasks : tasks.filter(t => t.status === filter);

  return (
    <div className="p-container-padding flex flex-col gap-stack-gap">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-surface-border pb-4 card-enter">
        <div>
          <h1 className="text-h1 font-h1 text-text-primary mb-1">Tasks</h1>
          <p className="text-text-muted">Track assignments by subject and priority.</p>
        </div>
        <button
          onClick={() => { setShowForm(v => !v); setEditingId(null); setForm({ ...initialForm, subjectId: subjects[0]?._id || "" }); }}
          className="flex-icon bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-semibold hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(192,193,255,0.4)] transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">{showForm ? "close" : "add"}</span>
          {showForm ? "Cancel" : "New Task"}
        </button>
      </div>

      {error && <div className="bg-danger/15 text-danger px-4 py-3 rounded-lg border border-danger/30 text-sm card-enter">{error}</div>}

      {/* Form */}
      {showForm && (
        <div className="glass-panel rounded-xl p-6 card-enter">
          <h2 className="text-h3 font-h3 text-text-primary mb-4">{editingId ? "Edit Task" : "New Task"}</h2>
          {subjects.length === 0 ? (
            <p className="text-text-muted text-sm">No subjects yet. <a href="/subjects" className="text-primary underline">Create one first.</a></p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1 text-sm text-slate-300 font-medium">
                  Subject
                  <select name="subjectId" value={form.subjectId} onChange={handleChange} required className="input-field">
                    {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-sm text-slate-300 font-medium">
                  Title *
                  <input name="title" placeholder="e.g. Finish Chapter 3 Review" value={form.title} onChange={handleChange} required className="input-field" />
                </label>
              </div>
              <label className="flex flex-col gap-1 text-sm text-slate-300 font-medium">
                Description
                <textarea name="description" placeholder="Additional details…" value={form.description} onChange={handleChange} rows={2} className="input-field resize-none" />
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="flex flex-col gap-1 text-sm text-slate-300 font-medium">
                  Due Date *
                  <input name="dueDate" type="date" value={form.dueDate} onChange={handleChange} required className="input-field" />
                </label>
                <label className="flex flex-col gap-1 text-sm text-slate-300 font-medium">
                  Priority
                  <select name="priority" value={form.priority} onChange={handleChange} className="input-field">
                    <option>Low</option><option>Medium</option><option>High</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-sm text-slate-300 font-medium">
                  Status
                  <select name="status" value={form.status} onChange={handleChange} className="input-field">
                    <option>Pending</option><option>In Progress</option><option>Completed</option>
                  </select>
                </label>
              </div>
              <div className="flex gap-3 mt-2">
                <button type="submit" disabled={saving} className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-lg text-sm font-semibold hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(192,193,255,0.4)] transition-all disabled:opacity-50">
                  {saving ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Saving…</> : editingId ? "Update Task" : "Add Task"}
                </button>
                {editingId && (
                  <button type="button" onClick={reset} className="px-5 py-2.5 rounded-lg text-sm font-medium border border-surface-border text-text-muted hover:bg-white/5 transition-all">Cancel</button>
                )}
              </div>
            </form>
          )}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap card-enter">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
              filter === f
                ? "bg-primary/20 text-primary border-primary/40 shadow-[0_0_10px_rgba(192,193,255,0.15)]"
                : "border-surface-border text-text-muted hover:border-primary/30 hover:text-primary"
            }`}
          >
            {f}
            {f === "All" ? ` (${tasks.length})` : ` (${tasks.filter(t => t.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Task cards */}
      {loading ? (
        <div className="flex items-center gap-3 text-text-muted p-8"><div className="spinner" /> Loading tasks…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((task, i) => {
            const pm = priorityMeta[task.priority] || priorityMeta.Medium;
            const sc = statusMeta[task.status] || "#94a3b8";
            const overdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "Completed";
            return (
              <div
                key={task._id}
                className="card-enter glass-panel rounded-xl p-5 relative overflow-hidden hover:-translate-y-1 transition-all duration-300 glow-hover"
                style={{ '--card-color': `${task.subjectId?.color || '#c0c1ff'}44`, borderLeft: `3px solid ${task.subjectId?.color || '#c0c1ff'}`, animationDelay: `${i * 50}ms` }}
              >
                {/* Status toggle */}
                <button
                  onClick={() => toggleStatus(task)}
                  title="Toggle status"
                  className="absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110"
                  style={{ borderColor: sc, background: `${sc}22` }}
                >
                  {task.status === "Completed" && <span className="material-symbols-outlined text-[14px]" style={{ color: sc }}>check</span>}
                </button>

                <h3 className={`font-semibold text-base mb-1 pr-8 ${task.status === "Completed" ? "line-through text-text-muted" : "text-text-primary"}`}>
                  {task.title}
                </h3>

                <div className="flex flex-wrap items-center gap-1.5 my-2">
                  {task.subjectId?.name && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded border" style={{ color: task.subjectId?.color || '#c0c1ff', borderColor: `${task.subjectId?.color || '#c0c1ff'}44`, background: `${task.subjectId?.color || '#c0c1ff'}18` }}>
                      {task.subjectId.name}
                    </span>
                  )}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded border" style={{ color: pm.color, borderColor: `${pm.color}44`, background: `${pm.color}18` }}>
                    {task.priority}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded border" style={{ color: sc, borderColor: `${sc}44`, background: `${sc}18` }}>
                    {task.status}
                  </span>
                </div>

                {task.description && <p className="text-xs text-text-muted mb-2 line-clamp-2">{task.description}</p>}

                <div className={`flex items-center gap-1 text-xs mt-2 ${overdue ? "text-danger" : "text-text-muted"}`}>
                  <span className="material-symbols-outlined text-[14px]">{overdue ? "warning" : "calendar_today"}</span>
                  {task.dueDate ? (overdue ? "Overdue · " : "Due · ") + toDateInput(task.dueDate) : "No due date"}
                </div>

                <div className="flex gap-2 mt-4 pt-3 border-t border-surface-border">
                  <button onClick={() => startEdit(task)} className="flex items-center gap-1 text-xs text-slate-400 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[14px]">edit</span> Edit
                  </button>
                  <button onClick={() => handleDelete(task._id)} className="flex items-center gap-1 text-xs text-slate-400 hover:text-danger transition-colors ml-auto">
                    <span className="material-symbols-outlined text-[14px]">delete</span> Delete
                  </button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full glass-panel rounded-xl p-12 text-center text-text-muted">
              <span className="material-symbols-outlined text-5xl block mb-3 opacity-30">assignment</span>
              No {filter !== "All" ? filter.toLowerCase() : ""} tasks yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Tasks;
