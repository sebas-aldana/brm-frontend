import api from "@/lib/axios";

const API_URL = "/auth";

const setAuthData = (data) => {
  if (data.token) {
    localStorage.setItem("token", data.token);
    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
    }
  }
};

export const register = async ({ name, email, password, role }) => {
  try {
    const { data } = await api.post(`${API_URL}/register`, {
      name,
      email,
      password,
      role,
    });

    setAuthData(data);
    return data;
  } catch (error) {
    console.error("Registration error:", error);
    throw new Error(
      error.response?.data?.message || "Error al registrar el usuario"
    );
  }
};

export const login = async ({ email, password }) => {
  try {
    const { data } = await api.post(`${API_URL}/login`, { email, password });
    setAuthData(data);
    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};
