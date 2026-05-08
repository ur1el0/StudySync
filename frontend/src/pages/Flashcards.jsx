import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import React from "react";

const Flashcards = () => {
	const [notes, setNotes] = useState([]);
	const [selectedNoteId, setSelectedNoteId] = useState("");
	const [flashcards, setFlashcards] = useState([]);
	const [loading, setLoading] = useState(true);
	const [generating, setGenerating] = useState(false);
	const [error, setError] = useState("");

	const loadNotes = async () => {
		try {
			setLoading(true);
			const { data } = await api.get("/notes");
			setNotes(data);

			if (!selectedNoteId && data.length > 0) {
				const firstNoteId = data[0]._id;
				setSelectedNoteId(firstNoteId);
				await loadFlashcards(firstNoteId);
			} else if (selectedNoteId) {
				await loadFlashcards(selectedNoteId);
			}
		} catch (requestError) {
			setError(requestError.response?.data?.message || "Failed to load notes");
		} finally {
			setLoading(false);
		}
	};

	const loadFlashcards = async (noteId) => {
		if (!noteId) {
			setFlashcards([]);
			return;
		}

		try {
			const { data } = await api.get(`/flashcards/note/${noteId}`);
			setFlashcards(data);
		} catch (requestError) {
			setError(requestError.response?.data?.message || "Failed to load flashcards");
		}
	};

	useEffect(() => {
		loadNotes();
	}, []);

	const handleNoteChange = async (event) => {
		const nextNoteId = event.target.value;
		setSelectedNoteId(nextNoteId);
		setError("");
		await loadFlashcards(nextNoteId);
	};

	const handleGenerate = async () => {
		if (!selectedNoteId) {
			setError("Please select a note first.");
			return;
		}

		try {
			setGenerating(true);
			setError("");
			await api.post("/flashcards/generate", { noteId: selectedNoteId });
			await loadFlashcards(selectedNoteId);
		} catch (requestError) {
			setError(requestError.response?.data?.message || "Failed to generate flashcards");
		} finally {
			setGenerating(false);
		}
	};

	const handleDeleteAll = async () => {
		if (!selectedNoteId) return;

		try {
			setError("");
			await api.delete(`/flashcards/note/${selectedNoteId}`);
			setFlashcards([]);
		} catch (requestError) {
			setError(requestError.response?.data?.message || "Failed to delete flashcards");
		}
	};

	return (
		<div className="p-container-padding flex flex-col gap-stack-gap">
			{/* Header */}
			<div className="flex items-center justify-between border-b border-surface-border pb-4 card-enter">
				<div>
					<h1 className="text-h1 font-h1 text-text-primary mb-1">Flashcards</h1>
					<p className="text-text-muted">Generate study cards from your saved notes.</p>
				</div>
			</div>

			{error && <div className="bg-danger/15 text-danger px-4 py-3 rounded-lg border border-danger/30 text-sm card-enter">{error}</div>}

			{loading ? (
				<div className="flex items-center gap-3 text-text-muted p-8"><div className="spinner" /> Loading flashcards…</div>
			) : notes.length === 0 ? (
				<div className="glass-panel rounded-xl p-12 text-center text-text-muted card-enter">
					<span className="material-symbols-outlined text-5xl block mb-3 opacity-30">description</span>
					<p>No notes found to generate cards from.</p>
					<Link to="/notes" className="flex-icon mx-auto mt-4 w-fit bg-primary text-on-primary px-5 py-2 rounded-lg text-sm font-semibold hover:-translate-y-0.5 transition-all">
						<span className="material-symbols-outlined text-[20px]">add</span>
						Create a Note First
					</Link>
				</div>
			) : (
				<section className="flex flex-col gap-6">
					<div className="glass-panel rounded-xl p-6 card-enter">
						<div className="flex flex-col md:flex-row items-end gap-4">
							<label className="flex-1 flex flex-col gap-1.5 text-sm font-medium text-slate-300">
								Select Note to Study
								<select value={selectedNoteId} onChange={handleNoteChange} className="input-field">
									{notes.map((note) => (
										<option key={note._id} value={note._id}>
											{note.title}
										</option>
									))}
								</select>
							</label>

							<div className="flex gap-3">
								<button 
									type="button" 
									onClick={handleGenerate} 
									disabled={generating}
									className="flex-icon bg-primary text-on-primary px-5 py-2.5 rounded-lg text-sm font-semibold hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(192,193,255,0.4)] transition-all disabled:opacity-70"
								>
									<span className="material-symbols-outlined text-[20px]">{generating ? "sync" : "magic_button"}</span>
									{generating ? "AI Generating..." : "Generate"}
								</button>
								<button type="button" onClick={handleDeleteAll} disabled={flashcards.length === 0 || generating} className="flex-icon bg-danger/10 text-danger border border-danger/20 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-danger hover:text-white transition-all disabled:opacity-50">
									<span className="material-symbols-outlined text-[20px]">delete_sweep</span>
									Clear
								</button>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{flashcards.map((card, idx) => (
							<div key={card._id} className="card-enter glass-panel rounded-xl p-6 flex flex-col gap-4 border-l-4 hover:-translate-y-1 transition-all duration-300" style={{ borderLeftColor: 'var(--color-primary)', animationDelay: `${idx * 50}ms` }}>
								<div className="flex justify-between items-center">
									<span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">CARD #{idx + 1}</span>
								</div>
								
								<div>
									<p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1">Question</p>
									<h3 className="text-base font-semibold text-text-primary leading-relaxed">{card.question}</h3>
								</div>

								<div className="p-4 bg-black/20 rounded-lg border border-white/5">
									<p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1">Answer</p>
									<p className="text-sm text-slate-300 whitespace-pre-wrap">{card.answer}</p>
								</div>
							</div>
						))}
					</div>

					{flashcards.length === 0 && (
						<div className="glass-panel rounded-xl p-12 text-center text-text-muted card-enter">
							<span className="material-symbols-outlined text-5xl block mb-3 opacity-30">style</span>
							<p>No flashcards generated for this note yet.</p>
							<p className="text-sm opacity-60">Click "Generate" above to create them automatically.</p>
						</div>
					)}
				</section>
			)}
		</div>
	);
};

export default Flashcards;
