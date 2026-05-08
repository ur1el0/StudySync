import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const Settings = () => {
  const { user, logout } = useAuth();
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      // Mock API call for profile update
      // await api.put("/auth/profile", { fullName: form.fullName, email: form.email });
      setTimeout(() => {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        setLoading(false);
      }, 800);
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Update failed" });
      setLoading(false);
    }
  };

  const sections = [
    { id: "profile", label: "Profile", icon: "person" },
    { id: "appearance", label: "Appearance", icon: "palette" },
    { id: "notifications", label: "Notifications", icon: "notifications" },
    { id: "security", label: "Security", icon: "security" },
  ];

  const [activeSection, setActiveSection] = useState("profile");

  return (
    <div className="p-container-padding flex flex-col gap-stack-gap h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-surface-border pb-4 card-enter">
        <div>
          <h1 className="text-h1 font-h1 text-text-primary mb-1">Settings</h1>
          <p className="text-text-muted">Manage your account preferences and application settings.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 mt-2">
        {/* Sidebar Nav */}
        <div className="w-full lg:w-64 flex flex-col gap-1 card-enter" style={{ animationDelay: '100ms' }}>
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`flex-icon px-4 py-3 rounded-xl transition-all duration-300 ${
                activeSection === s.id
                  ? "bg-primary/20 text-primary border border-primary/20 shadow-glow"
                  : "text-text-muted hover:bg-white/5 hover:text-text-primary border border-transparent"
              }`}
            >
              <span className={`material-symbols-outlined text-[22px] ${activeSection === s.id ? "fill-icon" : ""}`} style={activeSection === s.id ? { fontVariationSettings: "'FILL' 1" } : {}}>
                {s.icon}
              </span>
              <span className="font-semibold">{s.label}</span>
            </button>
          ))}
          
          <div className="mt-8 border-t border-surface-border pt-4">
             <button onClick={logout} className="flex-icon w-full px-4 py-3 rounded-xl text-danger hover:bg-danger/10 transition-all duration-300">
                <span className="material-symbols-outlined text-[22px]">logout</span>
                <span className="font-semibold">Sign Out</span>
             </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 card-enter" style={{ animationDelay: '200ms' }}>
          <div className="glass-panel rounded-2xl p-8 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -right-24 -top-24 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
            
            {activeSection === "profile" && (
              <div className="relative z-10">
                <h2 className="text-h3 font-h3 text-text-primary mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">account_circle</span>
                  Profile Information
                </h2>
                
                <form onSubmit={handleUpdateProfile} className="flex flex-col gap-6 max-w-xl">
                  {message.text && (
                    <div className={`px-4 py-3 rounded-xl border text-sm ${message.type === "success" ? "bg-success/10 border-success/30 text-success" : "bg-danger/10 border-danger/30 text-danger"}`}>
                      {message.text}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex flex-col gap-2 text-sm font-medium text-slate-300">
                      Full Name
                      <input name="fullName" value={form.fullName} onChange={handleChange} className="input-field" placeholder="Your Name" />
                    </label>
                    <label className="flex flex-col gap-2 text-sm font-medium text-slate-300">
                      Email Address
                      <input name="email" type="email" value={form.email} onChange={handleChange} className="input-field" placeholder="you@example.com" />
                    </label>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-300">Profile Picture</label>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="w-16 h-16 rounded-full bg-linear-to-br from-primary/30 to-secondary/30 border border-white/10 flex items-center justify-center text-primary text-2xl font-bold shadow-lg">
                        {user?.fullName?.charAt(0) || "U"}
                      </div>
                      <button type="button" className="px-4 py-2 rounded-lg border border-surface-border text-sm font-semibold hover:bg-white/5 transition-all">Change Avatar</button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-surface-border mt-2">
                    <button type="submit" disabled={loading} className="flex-icon bg-primary text-on-primary px-6 py-2.5 rounded-xl font-bold hover:-translate-y-0.5 hover:shadow-glow transition-all">
                      {loading ? <div className="spinner w-4 h-4" /> : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeSection === "appearance" && (
              <div className="relative z-10">
                <h2 className="text-h3 font-h3 text-text-primary mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">palette</span>
                  Appearance Settings
                </h2>
                
                <div className="flex flex-col gap-8">
                  <div className="flex flex-col gap-3">
                    <p className="text-sm font-medium text-slate-300">Theme Preference</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {['Dark', 'Light', 'System'].map((t) => (
                        <button key={t} className={`p-4 rounded-xl border flex flex-col gap-3 items-center transition-all ${t === 'Dark' ? 'border-primary bg-primary/10' : 'border-surface-border bg-white/5 hover:border-white/20'}`}>
                          <div className={`w-full h-20 rounded-lg ${t === 'Dark' ? 'bg-slate-900' : t === 'Light' ? 'bg-slate-100' : 'bg-linear-to-r from-slate-900 to-slate-100'}`} />
                          <span className="text-sm font-semibold">{t}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-surface-border">
                    <div>
                      <p className="text-sm font-semibold text-text-primary">Glassmorphism Intensity</p>
                      <p className="text-xs text-text-muted">Adjust the background blur effect.</p>
                    </div>
                    <input type="range" className="accent-primary w-32" />
                  </div>
                </div>
              </div>
            )}

            {activeSection === "notifications" && (
              <div className="relative z-10">
                <h2 className="text-h3 font-h3 text-text-primary mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">notifications</span>
                  Notification Preferences
                </h2>
                <div className="flex flex-col gap-4">
                  {[
                    { title: "Task Reminders", desc: "Get notified before a task is due." },
                    { title: "Study Goal Alerts", desc: "Weekly summary of your study progress." },
                    { title: "System Updates", desc: "Announcements about new features." },
                  ].map((n, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-surface-border">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-text-primary">{n.title}</p>
                        <p className="text-xs text-text-muted">{n.desc}</p>
                      </div>
                      <div className="w-12 h-6 rounded-full bg-primary/30 relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-primary shadow-sm" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === "security" && (
              <div className="relative z-10">
                <h2 className="text-h3 font-h3 text-text-primary mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">security</span>
                  Security & Privacy
                </h2>
                
                <form className="flex flex-col gap-6 max-w-xl">
                  <div className="flex flex-col gap-4">
                    <label className="flex flex-col gap-2 text-sm font-medium text-slate-300">
                      Current Password
                      <input name="currentPassword" type="password" className="input-field" placeholder="••••••••" />
                    </label>
                    <label className="flex flex-col gap-2 text-sm font-medium text-slate-300">
                      New Password
                      <input name="newPassword" type="password" className="input-field" placeholder="••••••••" />
                    </label>
                  </div>
                  <div className="pt-4">
                    <button type="button" className="flex-icon bg-surface-container border border-surface-border px-6 py-2.5 rounded-xl font-bold hover:bg-white/10 transition-all text-sm">
                      Update Password
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
