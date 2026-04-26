import React from 'react';
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
	const navigate = useNavigate();
	const { login } = useAuth();
	const [form, setForm] = useState({ email: "", password: "" });
	const [error, setError] = useState("");
	const [submitting, setSubmitting] = useState(false);

	const handleChange = (event) => {
		setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		setError("");
		setSubmitting(true);

		try {
			await login(form);
			navigate("/dashboard");
		} catch (requestError) {
			const fallback = "Login failed. Please check your credentials.";
			setError(requestError.response?.data?.message || fallback);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="flex items-center justify-center min-h-screen p-4">
			<main className="w-full max-w-105 bg-surface backdrop-blur-xl border border-surface-border rounded-2xl p-8 shadow-lg animate-[fadeIn_0.4s_ease_forwards]">
				<h1 className="text-center mb-8 text-4xl font-semibold bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">StudySync</h1>
				<h2 className="text-xl font-semibold mb-6">Sign in to your account</h2>

				{error && (
					<div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 mb-4">
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} className="flex flex-col gap-5">
					<label className="flex flex-col gap-2 text-sm font-medium text-slate-50">
						Email address
						<input
							name="email"
							type="email"
							placeholder="you@example.com"
							value={form.email}
							onChange={handleChange}
							required
							className="w-full px-4 py-3 bg-slate-900/60 border border-surface-border rounded-lg text-slate-50 font-sans text-base transition-all duration-200 focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/20"
						/>
					</label>
					<label className="flex flex-col gap-2 text-sm font-medium text-slate-50">
						Password
						<input
							name="password"
							type="password"
							placeholder="••••••••"
							value={form.password}
							onChange={handleChange}
							required
							minLength={6}
							className="w-full px-4 py-3 bg-slate-900/60 border border-surface-border rounded-lg text-slate-50 font-sans text-base transition-all duration-200 focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/20"
						/>
					</label>
					<button type="submit" disabled={submitting} className="mt-2 inline-flex items-center justify-center px-6 py-3 bg-primary text-on-primary border-none rounded-lg font-semibold text-base cursor-pointer transition-all duration-200 shadow-sm hover:bg-primary-hover hover:-translate-y[2px] hover:shadow-[0_0_15px_rgba(192,193,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed">
						{submitting ? "Signing in..." : "Sign in"}
					</button>
				</form>
				<p className="text-center mt-6 text-slate-400">
					Don't have an account? <Link to="/register" className="text-primary hover:text-primary-hover hover:text-shadow-[0_0_8px_rgba(99,102,241,0.4)] transition-all duration-200">Create one</Link>
				</p>
			</main>
		</div>
	);
};

export default Login;
