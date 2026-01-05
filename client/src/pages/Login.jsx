import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import "../styles/Login.css";

const API_URL = "http://localhost:3000";

export default function Login() {
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login: loginUser } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ login, password }),
                credentials: "include"
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Ошибка входа");
            }

            const data = await response.json();
            loginUser(data.user);
            navigate(data.user.role === "owner" ? "/owner" : data.user.role === "admin" ? "/admin" : "/dashboard");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1>CSPIRT</h1>
                <p className="subtitle">Система управления жалобами и заметками</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="login">Логин</label>
                        <input
                            id="login"
                            type="text"
                            value={login}
                            onChange={(e) => setLogin(e.target.value)}
                            placeholder="Введите логин"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Пароль</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Введите пароль"
                            disabled={loading}
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" disabled={loading}>
                        {loading ? "Вход..." : "Войти"}
                    </button>
                </form>

                <div className="demo-credentials">
                    <h3>Демо-учётные данные:</h3>
                    <p><strong>Овнер (владелец):</strong> owner / password</p>
                    <p><strong>Админ (кл. рук):</strong> admin / password</p>
                    <p><strong>Хелпер (староста):</strong> helper1 / password</p>
                    <p><strong>Ученик:</strong> user1 / password</p>
                </div>
            </div>
        </div>
    );
}

