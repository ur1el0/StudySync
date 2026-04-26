import React from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const storedUser = localStorage.getItem("userInfo");
		if (storedUser) {
			try {
				setUser(JSON.parse(storedUser));
			} catch (error) {
				localStorage.removeItem("userInfo");
			}
		}
		setLoading(false);
		const handleUnauthorized = () => {
			setUser(null);
		};

		window.addEventListener("auth:unauthorized", handleUnauthorized);

		return () => {
			window.removeEventListener("auth:unauthorized", handleUnauthorized);
		};
	}, []);

	const register = async (payload) => {
		const { data } = await api.post("/auth/register", payload);
		localStorage.setItem("userInfo", JSON.stringify(data));
		setUser(data);
		return data;
	};

	const login = async (payload) => {
		const { data } = await api.post("/auth/login", payload);
		localStorage.setItem("userInfo", JSON.stringify(data));
		setUser(data);
		return data;
	};

	const fetchProfile = async () => {
		const { data } = await api.get("/auth/profile");
		return data;
	};

	const logout = () => {
		localStorage.removeItem("userInfo");
		setUser(null);
	};

	const value = useMemo(
		() => ({
			user,
			loading,
			register,
			login,
			logout,
			fetchProfile,
		}),
		[user, loading]
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
	const context = useContext(AuthContext);

	if (!context) {
		throw new Error("useAuth must be used inside AuthProvider");
	}

	return context;
};
