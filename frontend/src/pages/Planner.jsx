import React, { useState, useEffect } from "react";
import api from "../api/axios";

const Planner = () => {
	const [currentDate, setCurrentDate] = useState(new Date());
	const [tasks, setTasks] = useState([]);
	const [loading, setLoading] = useState(true);

	const loadTasks = async () => {
		try {
			setLoading(true);
			const { data } = await api.get("/tasks");
			
			// Filter tasks for the selected date
			const filtered = data.filter(task => {
				if (!task.dueDate) return false;
				const taskDate = new Date(task.dueDate);
				return taskDate.toDateString() === currentDate.toDateString();
			});
			
			setTasks(filtered);
		} catch (e) {
			console.error("Failed to load tasks for planner", e);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadTasks();
	}, [currentDate]);

	const changeDay = (offset) => {
		const next = new Date(currentDate);
		next.setDate(currentDate.getDate() + offset);
		setCurrentDate(next);
	};

	const formatDate = (date) => {
		const today = new Date();
		if (date.toDateString() === today.toDateString()) return "Today";
		return date.toLocaleDateString("en-GB", { weekday: 'short', day: 'numeric', month: 'short' });
	};

	const timeSlots = Array.from({ length: 14 }, (_, i) => {
		const hour = i + 8; // 8 AM to 9 PM
		return {
			hour: hour > 12 ? hour - 12 : hour,
			ampm: hour >= 12 ? 'PM' : 'AM',
			military: hour
		};
	});

	// Helper to check if a task falls into an hour slot (mocking time for now if not present)
	const getTasksForHour = (hour) => {
		// Since our tasks only have 'date', we'll spread them out or just show them in the 9 AM slot if no time
		// In a real app, tasks would have a 'startTime'. 
		// For this demo, we'll assign them to 9AM + index if they don't have a time.
		return tasks.filter((_, i) => (i + 9) === hour);
	};

	return (
		<div className="p-container-padding flex flex-col gap-stack-gap h-full">
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-surface-border pb-4 card-enter">
				<div>
					<h1 className="font-h1 text-h1 text-text-primary mb-1">Calendar & Planner</h1>
					<p className="text-text-muted font-body text-body">Manage your schedule and deadlines.</p>
				</div>
				<div className="flex gap-2 h-fit bg-surface-container/50 p-1 rounded-xl border border-surface-border">
					<button className="px-4 py-1.5 rounded-lg text-text-muted hover:text-text-primary font-small text-small transition-colors">Week</button>
					<button className="px-4 py-1.5 rounded-lg bg-primary/20 text-primary border border-primary/30 font-semibold text-small shadow-glow">Day</button>
				</div>
			</div>

			<div className="flex-1 bg-surface backdrop-blur-xl rounded-2xl border border-surface-border flex flex-col overflow-hidden shadow-2xl min-h[600px] card-enter" style={{ animationDelay: '100ms' }}>
				<div className="flex justify-between items-center p-5 border-b border-surface-border bg-white/0.02">
					<div className="flex items-center gap-4">
						<button onClick={() => changeDay(-1)} className="p-2 rounded-full hover:bg-white/5 text-text-muted hover:text-primary transition-all flex items-center justify-center border border-transparent hover:border-surface-border">
							<span className="material-symbols-outlined">chevron_left</span>
						</button>
						<h2 className="font-h3 text-h3 text-text-primary min-w[120px] text-center">{formatDate(currentDate)}</h2>
						<button onClick={() => changeDay(1)} className="p-2 rounded-full hover:bg-white/5 text-text-muted hover:text-primary transition-all flex items-center justify-center border border-transparent hover:border-surface-border">
							<span className="material-symbols-outlined">chevron_right</span>
						</button>
					</div>
					<button className="flex-icon bg-primary text-on-primary px-4 py-2 rounded-xl font-bold text-sm hover:-translate-y-0.5 hover:shadow-glow transition-all">
						<span className="material-symbols-outlined text-[20px]">add</span>
						<span className="hidden sm:inline">New Event</span>
					</button>
				</div>

				<div className="flex-1 overflow-y-auto custom-scrollbar relative p-4 bg-slate-950/20">
					{/* Current Time Line Indicator */}
					{currentDate.toDateString() === new Date().toDateString() && (
						<div className="absolute w-full flex items-center z-20 pointer-events-none" style={{ top: `${((new Date().getHours() - 8) * 96) + (new Date().getMinutes() * 1.6) + 16}px` }}>
							<div className="w-16 flex justify-end pr-3">
								<span className="font-bold text-[10px] text-danger bg-danger/10 px-1.5 py-0.5 rounded border border-danger/20">
									{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
								</span>
							</div>
							<div className="flex-1 h-px bg-danger shadow-[0_0_10px_rgba(239,68,68,0.5)] relative">
								<div className="absolute -left-1.5 -top-1.5 w-3 h-3 rounded-full bg-danger shadow-[0_0_10px_rgba(239,68,68,1)]" />
							</div>
						</div>
					)}

					<div className="relative min-h[1200px] mt-2">
						{timeSlots.map((slot, index) => {
							const hourTasks = getTasksForHour(slot.military);
							return (
								<div key={index} className="flex border-b border-white/0.03 h-24 group">
									<div className="w-16 text-right pr-5 py-2 shrink-0">
										<span className="font-semibold text-[11px] text-text-muted group-hover:text-primary transition-colors">{slot.hour} {slot.ampm}</span>
									</div>
									<div className="flex-1 relative border-l border-white/0.05 transition-colors group-hover:bg-white/0.01">
										{hourTasks.map((task, i) => (
											<div 
												key={task._id} 
												className="absolute top-2 left-2 right-4 h-20 rounded-xl bg-primary/10 backdrop-blur-md border border-primary/30 border-l-4 p-3 shadow-lg hover:-translate-y-1 hover:shadow-glow transition-all duration-300 z-10 flex flex-col"
												style={{ borderLeftColor: task.subjectId?.color || 'var(--color-primary)' }}
											>
												<div className="flex justify-between items-start mb-1">
													<h3 className="text-sm font-bold text-text-primary truncate">{task.title}</h3>
													<span className="material-symbols-outlined text-text-muted text-xs">event_note</span>
												</div>
												<p className="text-[10px] text-text-muted flex items-center gap-1">
													<span className="material-symbols-outlined text-[12px]">book</span> {task.subjectId?.name || "No Subject"}
												</p>
												<div className="mt-auto flex gap-2">
													<span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
														task.priority === 'High' ? 'bg-danger/10 text-danger border-danger/20' : 
														task.priority === 'Medium' ? 'bg-secondary/10 text-secondary border-secondary/20' : 
														'bg-success/10 text-success border-success/20'
													}`}>
														{task.priority}
													</span>
												</div>
											</div>
										))}
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>
			
			{/* Mobile bottom spacer */}
			<div className="h-4 lg:hidden" />
		</div>
	);
};

export default Planner;
