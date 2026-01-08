import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext(null);

const API_URL = "http://localhost:3000";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null);

    useEffect(() => {
        const initAuth = async () => {
            const savedToken = localStorage.getItem("token");
            const savedUser = localStorage.getItem("user");

            if (savedToken && savedUser) {
                try {
                    const response = await fetch(`${API_URL}/auth/me`, {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${savedToken}`,
                            "Content-Type": "application/json"
                        },
                        credentials: "include"
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setUser(data.user);
                        setToken(savedToken);
                    } else {
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                    }
                } catch (error) {
                    console.error("Failed to validate session:", error);
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = (userData, tokenData) => {
        setUser(userData);
        setToken(tokenData);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", tokenData);
    };

    const logout = async () => {
        try {
            await fetch(`${API_URL}/auth/logout`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });
        } catch (error) {
            console.error("Logout error:", error);
        }
        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, token }}>
            {children}
        </AuthContext.Provider>
    );
}

