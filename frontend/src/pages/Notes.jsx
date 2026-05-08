import React, { useEffect, useRef, useState } from "react";
import api from "../api/axios";

const initialForm = { subjectId: "", title: "", content: "", tags: "" };
const parseTags = v => v.split(",").map(t => t.trim()).filter(Boolean);

const Notes = () => {
  const [subjects, setSubjects] = useState([]);
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [expanded, setExpanded] = useState(null);   // expanded note id
  const formRef = useRef(null);
  const fileInputRef = useRef(null);

  const load = async () => {
    try {
      setLoading(true);
      const [s, n] = await Promise.all([api.get("/subjects"), api.get("/notes")]);
      setSubjects(s.data);
      setNotes(n.data);
      if (!form.subjectId && s.data.length > 0)
        setForm(p => ({ ...p, subjectId: s.data[0]._id }));
    } catch (e) { setError(e.response?.data?.message || "Failed to load"); }
    finally { setLoading(false); }
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
    const payload = { ...form, tags: parseTags(form.tags) };
    try {
      editingId ? await api.put(`/notes/${editingId}`, payload)
        : await api.post("/notes", payload);
      reset(); load();
    } catch (e) { setError(e.response?.data?.message || "Failed to save"); }
    finally { setSaving(false); }
  };

  const startEdit = note => {
    setEditingId(note._id);
    setForm({ subjectId: note.subjectId?._id || "", title: note.title, content: note.content, tags: Array.isArray(note.tags) ? note.tags.join(", ") : "" });
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const handleDelete = async id => {
    if (!confirm("Delete this note?")) return;
    try { await api.delete(`/notes/${id}`); if (editingId === id) reset(); load(); }
    catch (e) { setError(e.response?.data?.message || "Failed to delete"); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      setError("");
      const { data } = await api.post("/ai/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setForm(prev => ({ 
        ...prev, 
        title: file.name.split('.')[0], 
        content: data.text 
      }));
      setShowForm(true);
      setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      const status = err.response?.status;
      let message = err.response?.data?.message || "Failed to extract text from file";
      
      if (status === 429) {
        message = "AI service rate limited. Please wait 30-60 seconds and try again.";
      } else if (status === 500 && message.includes("rate limiting")) {
        message = "AI service rate limited. Please wait 30-60 seconds and try again.";
      } else if (status === 413) {
        message = "File too large. Maximum supported size is 10MB.";
      }
      
      setError(message);
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase()) ||
    (Array.isArray(n.tags) && n.tags.some(t => t.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <div className="p-container-padding flex flex-col gap-stack-gap">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-surface-border pb-4 card-enter">
        <div>
          <h1 className="text-h1 font-h1 text-text-primary mb-1">Notes</h1>
          <p className="text-text-muted">Capture and organise your study reviewers.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative hidden md:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 block leading-none text-text-muted text-[18px] pointer-events-none">search</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes…" className="input-field pl-9 w-48 focus:w-60 transition-all" />
          </div>

          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="application/pdf,image/*,.txt,.doc,.docx,text/plain" className="hidden" />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex-icon bg-secondary/10 text-secondary border border-secondary/20 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-secondary hover:text-white transition-all shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">{uploading ? "sync" : "upload_file"}</span>
            {uploading ? "Processing..." : "Import"}
          </button>

          <button
            onClick={() => { setShowForm(v => !v); if (showForm) reset(); }}
            className="flex-icon bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-semibold hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(192,193,255,0.4)] transition-all shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">{showForm ? "close" : "add"}</span>
            {showForm ? "Cancel" : "New Note"}
          </button>
        </div>
      </div>

      {error && <div className="bg-danger/15 text-danger px-4 py-3 rounded-lg border border-danger/30 text-sm card-enter">{error}</div>}

      {/* Form */}
      {showForm && (
        <div ref={formRef} className="glass-panel rounded-xl p-6 card-enter">
          <h2 className="text-h3 font-h3 text-text-primary mb-4">{editingId ? "Edit Note" : "New Note"}</h2>
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
                  <input name="title" placeholder="e.g. Chapter 1 Summary" value={form.title} onChange={handleChange} required className="input-field" />
                </label>
              </div>
              <label className="flex flex-col gap-1 text-sm text-slate-300 font-medium">
                Content *
                <textarea 
                  name="content" 
                  placeholder="Write your study notes here… (or paste an image/PDF to extract text)" 
                  value={form.content} 
                  onChange={handleChange} 
                  onPaste={(e) => {
                    const items = e.clipboardData.items;
                    for (let i = 0; i < items.length; i++) {
                      if (items[i].kind === 'file') {
                        const file = items[i].getAsFile();
                        handleFileUpload({ target: { files: [file] } });
                        e.preventDefault();
                      }
                    }
                  }}
                  required 
                  rows={6} 
                  className="input-field resize-none font-mono text-sm" 
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-slate-300 font-medium">
                Tags <span className="text-text-muted font-normal">(comma‑separated)</span>
                <input name="tags" placeholder="e.g. exam, chapter-1, important" value={form.tags} onChange={handleChange} className="input-field" />
              </label>
              <div className="flex gap-3">
                <button type="submit" disabled={saving} className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-lg text-sm font-semibold hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(192,193,255,0.4)] transition-all disabled:opacity-50">
                  {saving ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Saving…</> : editingId ? "Update Note" : "Save Note"}
                </button>
                {editingId && <button type="button" onClick={reset} className="px-5 py-2.5 rounded-lg text-sm font-medium border border-surface-border text-text-muted hover:bg-white/5 transition-all">Cancel</button>}
              </div>
            </form>
          )}
        </div>
      )}

      {/* Notes grid */}
      {loading ? (
        <div className="flex items-center gap-3 text-text-muted p-8"><div className="spinner" /> Loading notes…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((note, i) => (
            <div
              key={note._id}
              className="card-enter glass-panel rounded-xl overflow-hidden hover:-translate-y-1 transition-all duration-300 flex flex-col"
              style={{ borderLeft: `3px solid ${note.subjectId?.color || '#c0c1ff'}`, animationDelay: `${i * 50}ms` }}
            >
              <div className="p-5 flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-base text-text-primary leading-tight pr-4">{note.title}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded border shrink-0" style={{ color: note.subjectId?.color || '#c0c1ff', borderColor: `${note.subjectId?.color || '#c0c1ff'}44`, background: `${note.subjectId?.color || '#c0c1ff'}18` }}>
                    {note.subjectId?.name || "—"}
                  </span>
                </div>

                {/* Content preview / expanded */}
                <div
                  className={`bg-black/20 rounded-lg p-3 font-mono text-xs text-slate-300 cursor-pointer transition-all duration-300 ${expanded === note._id ? "max-h-none" : "max-h-24 overflow-hidden relative"}`}
                  onClick={() => setExpanded(expanded === note._id ? null : note._id)}
                >
                  <pre className="whitespace-pre-wrap m-0">{note.content}</pre>
                  {expanded !== note._id && (
                    <div className="absolute bottom-0 left-0 right-0 h-10 bg-linear-to-t from-[#1e293b]/80 to-transparent pointer-events-none" />
                  )}
                </div>
                <button
                  onClick={() => setExpanded(expanded === note._id ? null : note._id)}
                  className="mt-1 text-[10px] text-primary hover:text-primary-container transition-colors"
                >
                  {expanded === note._id ? "Show less ▲" : "Show more ▼"}
                </button>

                {/* Tags */}
                {Array.isArray(note.tags) && note.tags.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap mt-3">
                    {note.tags.map((tag, j) => (
                      <span key={j} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 px-5 py-3 border-t border-surface-border">
                <button onClick={() => startEdit(note)} className="flex items-center gap-1 text-xs text-slate-400 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[14px]">edit</span> Edit
                </button>
                <a href="/flashcards" className="flex items-center gap-1 text-xs text-slate-400 hover:text-secondary transition-colors">
                  <span className="material-symbols-outlined text-[14px]">style</span> Flashcards
                </a>
                <button onClick={() => handleDelete(note._id)} className="flex items-center gap-1 text-xs text-slate-400 hover:text-danger transition-colors ml-auto">
                  <span className="material-symbols-outlined text-[14px]">delete</span>
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full glass-panel rounded-xl p-12 text-center text-text-muted">
              <span className="material-symbols-outlined text-5xl block mb-3 opacity-30">description</span>
              {search ? `No notes matching "${search}"` : "No notes yet. Click + New Note to start."}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notes;
