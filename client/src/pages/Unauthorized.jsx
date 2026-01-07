import { useNavigate } from "react-router-dom";
import "../styles/Unauthorized.css";

export default function Unauthorized() {
    const navigate = useNavigate();

    return (
        <div className="unauthorized-container">
            <div className="error-box">
                <h1>Доступ запрещён</h1>
                <p>У вас нет прав доступа к этому разделу.</p>
                <div className="button-group">
                    <button onClick={() => navigate("/login")} className="back-btn">
                        Вход
                    </button>
                    <button onClick={() => navigate("/")} className="back-btn secondary">
                        На главную
                    </button>
                </div>
            </div>
        </div>
    );
}

