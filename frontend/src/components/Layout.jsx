import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { path: "/subjects", label: "Study Groups", icon: "group" },
  { path: "/tasks", label: "Tasks", icon: "task_alt" },
  { path: "/notes", label: "Notes", icon: "description" },
  { path: "/planner", label: "Calendar", icon: "calendar_today" },
  { path: "/flashcards", label: "Flashcards", icon: "style" },
];

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // trigger re-mount animation on route change
  const [pageKey, setPageKey] = useState(location.pathname);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setPageKey(location.pathname);
    setIsSidebarOpen(false); // Close sidebar on mobile when navigating
  }, [location.pathname]);

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-background">
      {/* Ambient orbs */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/10 blur-[120px] pointer-events-none z-0" />

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <nav className={`fixed left-0 top-0 h-full w-64 border-r border-white/5 shadow-2xl bg-slate-900/90 lg:bg-slate-900/60 backdrop-blur-xl z-50 flex flex-col p-4 gap-2 font-['Plus_Jakarta_Sans'] transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}>
        {/* Brand */}
        <div className="flex items-center gap-3 px-4 py-6 mb-2">
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_15px_rgba(192,193,255,0.35)]">
            <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
          </div>
          <div>
            <h2 className="text-[17px] font-bold text-white leading-tight">StudySync</h2>
            <p className="text-[11px] text-primary/80 font-medium">Deep Focus Mode</p>
          </div>
        </div>

        {/* Start session CTA */}
        <button className="w-full py-2.5 mb-4 rounded-lg bg-primary-container text-on-primary-container text-sm font-semibold flex justify-center items-center gap-2 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(128,131,255,0.5)] transition-all duration-300">
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
          Start Session
        </button>

        {/* Nav links */}
        <div className="flex flex-col gap-1 grow">
          {navItems.map((item, i) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{ animationDelay: `${i * 40}ms` }}
                className={`slide-in flex items-center gap-3 px-4 py-2.5 rounded-lg border-l-4 text-sm font-medium transition-all duration-300 ${active
                    ? "bg-indigo-500/20 text-indigo-300 border-indigo-500 shadow-[inset_0_0_10px_rgba(99,102,241,0.2)]"
                    : "border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200 hover:translate-x-1"
                  }`}
              >
                <span
                  className="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110"
                  style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-auto border-t border-white/5 pt-4 flex flex-col gap-1">
          <div className="px-4 py-2 mb-2">
            <p className="text-xs text-slate-500">Signed in as</p>
            <p className="text-sm font-semibold text-slate-200 truncate">{user?.fullName}</p>
          </div>
          <Link to="/settings" className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-400 hover:bg-white/5 hover:text-slate-200 hover:translate-x-1 transition-all duration-300 text-sm">
            <span className="material-symbols-outlined text-[18px] hover:rotate-45 transition-transform">settings</span>
            <span>Settings</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-400 hover:bg-danger/10 hover:text-danger transition-all duration-300 text-sm text-left w-full"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </nav>

      {/* ── Main area ── */}
      <div className="lg:ml-64 flex flex-col min-h-screen relative z-10 transition-all duration-300">
        {/* TopAppBar */}
        <header className="flex justify-between items-center w-full px-4 lg:px-8 h-16 sticky top-0 z-40 bg-slate-950/50 backdrop-blur-2xl border-b border-white/10 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:bg-white/5 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[24px]">menu</span>
            </button>
            <span className="text-xl font-black tracking-tighter text-indigo-400">StudySync</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative group hidden sm:flex items-center">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] group-focus-within:text-primary transition-colors">search</span>
              <input
                className="w-44 focus:w-60 bg-slate-900/60 border border-white/5 rounded-full py-1.5 pl-9 pr-4 text-sm text-text-primary placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                placeholder="Search…"
                type="text"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 active:scale-95 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              <span className="ring-pulse absolute top-1.75 right-1.75 w-2 h-2 rounded-full bg-danger" />
            </button>

            {/* Avatar */}
            <Link to="/settings" className="w-9 h-9 rounded-full flex items-center justify-center bg-linear-to-br from-primary/30 to-secondary/30 border border-white/10 text-slate-300 hover:border-primary/50 transition-all duration-200">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>account_circle</span>
            </Link>
          </div>
        </header>

        {/* Page content with animated transition */}
        <main key={pageKey} className="flex-1 page-enter">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
