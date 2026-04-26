import React from 'react';
import { Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Flashcards from "./pages/Flashcards";
import Login from "./pages/Login";
import Notes from "./pages/Notes";
import Planner from "./pages/Planner";
import Register from "./pages/Register";
import Subjects from "./pages/Subjects";
import Tasks from "./pages/Tasks";
import Settings from "./pages/Settings";
import ProtectedRoute from "./routes/ProtectedRoute";
import Layout from "./components/Layout";

export default function App() {
	return (
		<Routes>
			<Route path="/" element={<Navigate to="/dashboard" replace />} />
			<Route path="/login" element={<Login />} />
			<Route path="/register" element={<Register />} />

			<Route
				path="/dashboard"
				element={
					<ProtectedRoute>
						<Layout>
							<Dashboard />
						</Layout>
					</ProtectedRoute>
				}
			/>
			<Route
				path="/subjects"
				element={
					<ProtectedRoute>
						<Layout>
							<Subjects />
						</Layout>
					</ProtectedRoute>
				}
			/>
			<Route
				path="/tasks"
				element={
					<ProtectedRoute>
						<Layout>
							<Tasks />
						</Layout>
					</ProtectedRoute>
				}
			/>
			<Route
				path="/notes"
				element={
					<ProtectedRoute>
						<Layout>
							<Notes />
						</Layout>
					</ProtectedRoute>
				}
			/>
			<Route
				path="/planner"
				element={
					<ProtectedRoute>
						<Layout>
							<Planner />
						</Layout>
					</ProtectedRoute>
				}
			/>
			<Route
				path="/flashcards"
				element={
					<ProtectedRoute>
						<Layout>
							<Flashcards />
						</Layout>
					</ProtectedRoute>
				}
			/>
			<Route
				path="/settings"
				element={
					<ProtectedRoute>
						<Layout>
							<Settings />
						</Layout>
					</ProtectedRoute>
				}
			/>
		</Routes>
	);
}
