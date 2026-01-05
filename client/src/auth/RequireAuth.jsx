import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";

export default function RequireAuth({ children, roles }) {
    const { user, loading } = useAuth();

    // ВАЖНО: Загрузка - блокируем экран полностью
    if (loading) {
        return (
            <div style={{
                width: '100%',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 9999
            }}>
                <div style={{
                    textAlign: 'center',
                    color: 'white'
                }}>
                    <h2>Загрузка...</h2>
                    <p>Проверка аутентификации</p>
                </div>
            </div>
        );
    }

    // Нет пользователя - редирект на логин
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Проверка ролей
    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    // Всё ОК - показываем контент
    return children;
}
