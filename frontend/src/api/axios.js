import axios from "axios";

const api = axios.create({
	baseURL: "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
	const storedUser = localStorage.getItem("userInfo");

	if (storedUser) {
		const { token } = JSON.parse(storedUser);
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
	}

	return config;
});
api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response && error.response.status === 401) {
			localStorage.removeItem("userInfo");
			window.dispatchEvent(new Event("auth:unauthorized"));
		}
		return Promise.reject(error);
	}
);

export default api;
