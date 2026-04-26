import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import React from "react";

const initialForm = {
	name: "",
	code: "",
	instructor: "",
	color: "#6366f1",
};

const Subjects = () => {
	const [subjects, setSubjects] = useState([]);
	const [form, setForm] = useState(initialForm);
	const [editingId, setEditingId] = useState(null);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(true);

	const loadSubjects = async () => {
		try {
			setLoading(true);
			const { data } = await api.get("/subjects");
			setSubjects(data);
		} catch (requestError) {
			setError(requestError.response?.data?.message || "Failed to load subjects");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadSubjects();
	}, []);

	const handleChange = (event) => {
		setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
	};

	const resetForm = () => {
		setForm(initialForm);
		setEditingId(null);
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		setError("");

		try {
			if (editingId) {
				await api.put(`/subjects/${editingId}`, form);
			} else {
				await api.post("/subjects", form);
			}

			resetForm();
			loadSubjects();
		} catch (requestError) {
			setError(requestError.response?.data?.message || "Failed to save subject");
		}
	};

	const startEdit = (subject) => {
		setEditingId(subject._id);
		setForm({
			name: subject.name,
			code: subject.code || "",
			instructor: subject.instructor || "",
			color: subject.color || "#6366f1",
		});
	};

	const handleDelete = async (id) => {
		try {
			await api.delete(`/subjects/${id}`);
			if (editingId === id) {
				resetForm();
			}
			loadSubjects();
		} catch (requestError) {
			setError(requestError.response?.data?.message || "Failed to delete subject");
		}
	};

	return (
		<div className="p-container-padding flex flex-col gap-stack-gap min-h-full">
			<div className="flex items-center justify-between border-b border-surface-border pb-4">
				<div>
					<h1 className="font-h1 text-h1 text-text-primary mb-1">Study Groups & Subjects</h1>
					<p className="text-text-muted font-body text-body">Manage your subjects and courses</p>
				</div>
			</div>

			{error && <div className="bg-danger/20 text-danger px-4 py-3 rounded-lg border border-danger/30">{error}</div>}

			<div className="flex flex-col lg:flex-row gap-stack-gap">
				{/* Form Column */}
				<section className="w-full lg:w-1/3 min-w-[300px] flex flex-col gap-4 bg-surface backdrop-blur-xl border border-surface-border rounded-xl p-6 shadow-lg h-fit">
					<div className="flex justify-between items-center mb-4">
						<h2 className="font-h3 text-h3 text-on-surface">{editingId ? "Edit Subject" : "New Subject"}</h2>
						<span className="material-symbols-outlined text-primary">{editingId ? "edit" : "add_circle"}</span>
					</div>

					<form onSubmit={handleSubmit} className="flex flex-col gap-4">
						<label className="flex flex-col gap-1 text-sm font-label text-slate-300">
							Subject Name
							<input
								name="name"
								placeholder="e.g. Mathematics"
								value={form.name}
								onChange={handleChange}
								required
								className="w-full px-4 py-2 bg-slate-900/60 border border-surface-border rounded-lg text-slate-50 font-sans text-sm transition-all duration-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
							/>
						</label>
						
						<label className="flex flex-col gap-1 text-sm font-label text-slate-300">
							Code (Optional)
							<input 
								name="code" 
								placeholder="e.g. MATH101" 
								value={form.code} 
								onChange={handleChange} 
								className="w-full px-4 py-2 bg-slate-900/60 border border-surface-border rounded-lg text-slate-50 font-sans text-sm transition-all duration-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" 
							/>
						</label>

						<label className="flex flex-col gap-1 text-sm font-label text-slate-300">
							Instructor (Optional)
							<input
								name="instructor"
								placeholder="e.g. Dr. Smith"
								value={form.instructor}
								onChange={handleChange}
								className="w-full px-4 py-2 bg-slate-900/60 border border-surface-border rounded-lg text-slate-50 font-sans text-sm transition-all duration-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
							/>
						</label>
						
						<label className="flex flex-col gap-1 text-sm font-label text-slate-300">
							Color Marker
							<div className="flex items-center gap-3">
								<input 
									name="color" 
									type="color" 
									value={form.color} 
									onChange={handleChange} 
									className="w-12 h-10 p-0 bg-transparent border-0 rounded cursor-pointer" 
								/>
								<span className="text-xs text-text-muted">{form.color}</span>
							</div>
						</label>

						<div className="flex gap-3 mt-4">
							<button type="submit" className="flex-1 bg-primary text-on-primary py-2 rounded-lg font-label text-label shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:translate-y-[-2px] transition-all duration-300">
								{editingId ? "Update" : "Add"}
							</button>
							{editingId && (
								<button type="button" onClick={resetForm} className="flex-1 bg-surface-container text-text-primary py-2 border border-surface-border rounded-lg font-label text-label hover:bg-white/5 transition-all">
									Cancel
								</button>
							)}
						</div>
					</form>
				</section>

				{/* Subjects List */}
				<section className="w-full lg:w-2/3 flex flex-col gap-4 bg-surface backdrop-blur-xl border border-surface-border rounded-xl p-6 shadow-lg">
					<div className="flex justify-between items-center mb-4">
						<h2 className="font-h3 text-h3 text-on-surface">Your Groups</h2>
					</div>

					{loading ? (
						<p className="text-text-muted">Loading subjects...</p>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
							{subjects.map((subject) => (
								<div
									key={subject._id}
									className="bg-surface-container-high rounded-lg p-5 border-l-[4px] cursor-pointer hover:translate-y-[-2px] transition-all relative overflow-hidden group hover:shadow-[0_0_15px_rgba(99,102,241,0.15)]"
									style={{ borderLeftColor: subject.color || "#6366f1" }}
								>
									<div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
										<span className="material-symbols-outlined text-4xl" style={{ color: subject.color || "#6366f1" }}>school</span>
									</div>
									<h3 className="font-label text-label font-bold text-white mb-1 truncate pr-8">{subject.name}</h3>
									
									<div className="flex items-center gap-2 mb-3">
										{subject.code && <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-slate-300 border border-white/5">{subject.code}</span>}
										{subject.instructor && <span className="text-xs text-text-muted truncate">{subject.instructor}</span>}
									</div>
									
									<div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
										<button type="button" onClick={() => startEdit(subject)} className="flex items-center gap-1 text-xs text-slate-400 hover:text-primary transition-colors">
											<span className="material-symbols-outlined text-[16px]">edit</span> Edit
										</button>
										<button type="button" onClick={() => handleDelete(subject._id)} className="flex items-center gap-1 text-xs text-slate-400 hover:text-danger transition-colors ml-auto">
											<span className="material-symbols-outlined text-[16px]">delete</span>
										</button>
									</div>
								</div>
							))}
							{subjects.length === 0 && <p className="col-span-full text-slate-400">No subjects yet. Add one to get started.</p>}
						</div>
					)}
				</section>
			</div>
		</div>
	);
};

export default Subjects;
