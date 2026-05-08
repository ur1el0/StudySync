import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const StatCard = ({ icon, color, label, value, delay = 0 }) => (
  <div
    className="card-enter glass-panel rounded-xl p-5 flex flex-col gap-3 border-l-4 hover:-translate-y-1 transition-all duration-300 shadow-lg"
    style={{ borderLeftColor: color, animationDelay: `${delay}ms` }}
  >
    <div className="flex justify-between items-center">
      <span className="text-xs font-semibold uppercase tracking-widest" style={{ color }}>{label}</span>
      <span className="material-symbols-outlined text-[22px]" style={{ color }}>{icon}</span>
    </div>
    <p className="text-4xl font-bold text-text-primary">{value}</p>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats]     = useState({ tasks: 0, notes: 0, subjects: 0, done: 0 });
  const [tasks,  setTasks]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [t, n, s] = await Promise.all([
          api.get("/tasks"),
          api.get("/notes"),
          api.get("/subjects"),
        ]);
        const allTasks = t.data;
        setTasks(allTasks.slice(0, 4));
        setStats({
          tasks:    allTasks.length,
          notes:    n.data.length,
          subjects: s.data.length,
          done:     allTasks.filter(t => t.status === "Completed").length,
        });
      } catch (_) { /* silent */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const completionPct = stats.tasks > 0
    ? Math.round((stats.done / stats.tasks) * 100)
    : 0;

  const priorityColor = { High: "#ef4444", Medium: "#ffb783", Low: "#22c55e" };
  const statusColor   = { Completed: "#22c55e", "In Progress": "#ffb783", Pending: "#94a3b8" };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="p-container-padding flex flex-col gap-stack-gap">
      {/* Header */}
      <div className="flex flex-col gap-1 card-enter">
        <h1 className="text-h1 font-h1 bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent pb-1">
          {greeting()}, {user?.fullName?.split(" ")[0] || "Student"} 👋
        </h1>
        <p className="text-text-muted text-body">Here's your study overview for today.</p>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="flex items-center gap-3 text-text-muted">
          <div className="spinner" /> Loading stats…
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="task_alt"   color="#c0c1ff" label="Total Tasks"    value={stats.tasks}    delay={0}   />
          <StatCard icon="check_circle" color="#22c55e" label="Completed"    value={stats.done}     delay={60}  />
          <StatCard icon="description" color="#ddb7ff" label="Notes"        value={stats.notes}    delay={120} />
          <StatCard icon="school"      color="#ffb783" label="Subjects"     value={stats.subjects} delay={180} />
        </div>
      )}

      {/* Progress card */}
      <div className="glass-panel rounded-xl p-6 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 shadow-lg card-enter" style={{ animationDelay: '220ms' }}>
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-primary/15 rounded-full blur-[80px] pointer-events-none group-hover:bg-primary/25 transition-colors duration-500" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex-1">
            <h3 className="text-h3 font-h3 text-text-primary mb-1">Task Completion</h3>
            <p className="text-text-muted text-sm mb-4">{stats.done} of {stats.tasks} tasks done this week.</p>
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-surface-container-highest rounded-full h-3 overflow-hidden border border-surface-border">
                <div
                  className="h-full bg-linear-to-r from-primary to-secondary rounded-full shadow-[0_0_10px_rgba(192,193,255,0.8)] transition-all duration-700"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
              <span className="text-h3 font-h3 text-primary min-w[44px]">{completionPct}%</span>
            </div>
          </div>

          {/* Mini stats */}
          <div className="flex gap-4">
            <div className="bg-surface-container/50 rounded-lg p-4 border border-surface-border text-center min-w[110px]">
              <span className="material-symbols-outlined text-secondary text-3xl block mb-1">timer</span>
              <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Pending</p>
              <p className="text-h3 font-h3 text-text-primary">{stats.tasks - stats.done}</p>
            </div>
            <div className="bg-surface-container/50 rounded-lg p-4 border border-surface-border text-center min-w-0[110px]">
              <span className="material-symbols-outlined text-success text-3xl block mb-1">task_alt</span>
              <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Done</p>
              <p className="text-h3 font-h3 text-text-primary">{stats.done}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks + Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Upcoming tasks */}
        <div className="lg:col-span-2 flex flex-col gap-3 card-enter" style={{ animationDelay: '280ms' }}>
          <div className="flex items-center justify-between px-1">
            <h2 className="text-h3 font-h3 text-text-primary">Upcoming Tasks</h2>
            <Link to="/tasks" className="text-sm text-primary hover:text-primary-container transition-colors">View all →</Link>
          </div>
          <div className="glass-panel rounded-xl overflow-hidden">
            {loading ? (
              <div className="p-6 flex items-center gap-3 text-text-muted"><div className="spinner" /> Loading…</div>
            ) : tasks.length === 0 ? (
              <div className="p-6 text-center text-text-muted">
                <span className="material-symbols-outlined text-4xl block mb-2 opacity-40">assignment</span>
                No tasks yet. <Link to="/tasks" className="text-primary underline">Add one</Link>
              </div>
            ) : (
              tasks.map((task, i) => (
                <div
                  key={task._id}
                  className="flex items-center gap-4 px-5 py-3.5 border-b border-surface-border/50 last:border-0 hover:bg-white/0.03 transition-colors"
                  style={{ borderLeft: `3px solid ${task.subjectId?.color || '#c0c1ff'}` }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">{task.title}</p>
                    <p className="text-xs text-text-muted mt-0.5">{task.subjectId?.name || "—"}</p>
                  </div>
                  <span
                    className="text-[10px] font-bold px-2 py-1 rounded-full border"
                    style={{ color: priorityColor[task.priority], borderColor: `${priorityColor[task.priority]}40`, background: `${priorityColor[task.priority]}18` }}
                  >
                    {task.priority}
                  </span>
                  <span
                    className="text-[10px] font-bold px-2 py-1 rounded-full border hidden sm:inline"
                    style={{ color: statusColor[task.status], borderColor: `${statusColor[task.status]}40`, background: `${statusColor[task.status]}18` }}
                  >
                    {task.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick links */}
        <div className="flex flex-col gap-3 card-enter" style={{ animationDelay: '340ms' }}>
          <h2 className="text-h3 font-h3 text-text-primary px-1">Quick Actions</h2>
          <div className="flex flex-col gap-2">
            {[
              { to: "/tasks",      icon: "add_task",    label: "New Task",       sub: "Add to your list",          color: "#c0c1ff" },
              { to: "/notes",      icon: "edit_note",   label: "Write a Note",   sub: "Capture ideas fast",        color: "#ddb7ff" },
              { to: "/subjects",   icon: "school",      label: "New Subject",    sub: "Organize your courses",     color: "#ffb783" },
              { to: "/flashcards", icon: "style",       label: "Study Cards",    sub: "Review & generate cards",   color: "#22c55e" },
            ].map((item, i) => (
              <Link
                key={item.to}
                to={item.to}
                className="card-enter glass-panel rounded-xl p-4 flex items-center gap-4 hover:-translate-y-0.5 hover:border-primary/30 transition-all duration-300"
                style={{ animationDelay: `${380 + i * 50}ms` }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${item.color}22`, border: `1px solid ${item.color}44` }}>
                  <span className="material-symbols-outlined text-[20px]" style={{ color: item.color }}>{item.icon}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{item.label}</p>
                  <p className="text-xs text-text-muted">{item.sub}</p>
                </div>
                <span className="material-symbols-outlined text-text-muted text-[18px] ml-auto">chevron_right</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
