import { useNavigate } from "react-router-dom";
import "../styles/Unauthorized.css";

export default function Unauthorized() {
    const navigate = useNavigate();

    return (
        <div className="unauthorized-container">
            <div className="error-box">
                <h1>🚫 Доступ запрещён</h1>
                <p>У вас нет прав доступа к этому разделу.</p>
                <button onClick={() => navigate("/")} className="back-btn">
                    Вернуться на главную
                </button>
            </div>
        </div>
    );
}

