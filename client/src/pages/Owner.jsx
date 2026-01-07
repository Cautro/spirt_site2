import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { useEffect, useState } from "react";
import ThemeToggle from "../components/ThemeToggle";
import "../styles/Owner.css";

const API_URL = "http://localhost:3000";

export default function Owner() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [allUsers, setAllUsers] = useState([]);
    const [allComplaints, setAllComplaints] = useState([]);
    const [allNotes, setAllNotes] = useState([]);
    const [selectedTab, setSelectedTab] = useState("users");
    const [loading, setLoading] = useState(true);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [newUserForm, setNewUserForm] = useState({
        login: "",
        password: "",
        role: "user",
        fullName: "",
        class: ""
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (user?.role !== 'owner' && user?.role !== 'secret-user') {
            navigate('/unauthorized');
            return;
        }
        fetchData();
    }, [user, navigate]);

    const fetchData = async () => {
        try {
            const [usersRes, complaintsRes, notesRes] = await Promise.all([
                fetch(`${API_URL}/api/users`, { credentials: "include" }),
                fetch(`${API_URL}/api/complaints`, { credentials: "include" }),
                fetch(`${API_URL}/api/notes`, { credentials: "include" })
            ]);

            if (usersRes.ok) {
                const users = await usersRes.json();
                setAllUsers(users);
            }

            if (complaintsRes.ok) {
                const complaints = await complaintsRes.json();
                setAllComplaints(complaints);
            }

            if (notesRes.ok) {
                const notes = await notesRes.json();
                setAllNotes(notes);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const getUserName = (userId) => {
        const foundUser = allUsers.find(u => u.id === userId);
        return foundUser ? foundUser.fullName : `Пользователь ${userId}`;
    };

    const getRoleLabel = (role) => {
        const labels = {
            admin: 'Учитель',
            helper: 'Старост.',
            user: 'Ученик'
        };
        return labels[role] || role;
    };

    const handleDeleteComplaint = async (id) => {
        if (!window.confirm("Вы уверены, что хотите удалить эту жалобу?")) return;

        try {
            const res = await fetch(`${API_URL}/api/complaints/${id}`, {
                method: "DELETE",
                credentials: "include"
            });

            if (res.ok) {
                setAllComplaints(allComplaints.filter(c => c.id !== id));
                setSuccess("Жалоба удалена");
                setTimeout(() => setSuccess(""), 3000);
            }
        } catch (err) {
            console.error(err);
            setError("Ошибка при удалении жалобы");
        }
    };

    const handleDeleteNote = async (id) => {
        if (!window.confirm("Вы уверены, что хотите удалить эту заметку?")) return;

        try {
            const res = await fetch(`${API_URL}/api/notes/${id}`, {
                method: "DELETE",
                credentials: "include"
            });

            if (res.ok) {
                setAllNotes(allNotes.filter(n => n.id !== id));
                setSuccess("Заметка удалена");
                setTimeout(() => setSuccess(""), 3000);
            }
        } catch (err) {
            console.error(err);
            setError("Ошибка при удалении заметки");
        }
    };

    const handleDeleteUser = async (id) => {
        if (id === user?.id) {
            setError("Вы не можете удалить собственный аккаунт");
            return;
        }

        if (!window.confirm("Вы уверены, что хотите удалить этого пользователя?")) return;

        try {
            const res = await fetch(`${API_URL}/api/users/${id}`, {
                method: "DELETE",
                credentials: "include"
            });

            if (res.ok) {
                setAllUsers(allUsers.filter(u => u.id !== id));
                setSuccess("Пользователь удален");
                setTimeout(() => setSuccess(""), 3000);
            } else {
                setError("Ошибка при удалении пользователя");
            }
        } catch (err) {
            console.error(err);
            setError("Ошибка при удалении пользователя");
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setError("");

        if (!newUserForm.login || !newUserForm.password || !newUserForm.fullName) {
            setError("Заполните все обязательные поля");
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/users`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    login: newUserForm.login,
                    password: newUserForm.password,
                    role: newUserForm.role,
                    fullName: newUserForm.fullName,
                    class: newUserForm.class || null
                })
            });

            if (res.status === 409) {
                setError("Пользователь с таким логином уже существует");
                return;
            }

            if (res.ok) {
                const newUser = await res.json();
                setAllUsers([...allUsers, newUser]);
                setShowAddUserModal(false);
                setNewUserForm({
                    login: "",
                    password: "",
                    role: "user",
                    fullName: "",
                    class: ""
                });
                setSuccess("Пользователь добавлен успешно");
                setTimeout(() => setSuccess(""), 3000);
            } else {
                const data = await res.json();
                setError(data.message || "Ошибка при добавлении пользователя");
            }
        } catch (err) {
            console.error(err);
            setError("Ошибка при добавлении пользователя");
        }
    };

    const stats = {
        totalUsers: allUsers.filter(u => u.role !== 'owner').length,
        students: allUsers.filter(u => u.role === 'user').length,
        helpers: allUsers.filter(u => u.role === 'helper').length,
        admins: allUsers.filter(u => u.role === 'admin').length,
        totalComplaints: allComplaints.length,
        totalNotes: allNotes.length,
    };

    return (
        <div className="owner-container">
            <header className="owner-header">
                <div className="owner-header-left">
                    <h1>Панель управления</h1>
                    <p className="owner-badge">Управление пользователями • Контроль жалоб и заметок</p>
                </div>
                <div className="owner-header-right">
                    <div className="user-info">
                        <span>{user?.fullName}</span>
                        <small>{user?.role}</small>
                    </div>
                    <ThemeToggle />
                    {user?.role === "secret-user" && (
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="logout-btn"
                        >
                            Назад
                        </button>
                    )}
                    <button onClick={handleLogout} className="logout-btn">Выход</button>
                </div>
            </header>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <main className="owner-content">
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon"></div>
                        <h3>Пользователей</h3>
                        <p className="stat-number">{stats.totalUsers}</p>
                        <div className="stat-breakdown">
                            <span>Учеников: {stats.students}</span>
                            <span>Старост: {stats.helpers}</span>
                            <span>Учителей: {stats.admins}</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon"></div>
                        <h3>Жалоб</h3>
                        <p className="stat-number">{stats.totalComplaints}</p>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon"></div>
                        <h3>Заметок</h3>
                        <p className="stat-number">{stats.totalNotes}</p>
                    </div>
                </div>

                <div className="tabs-container">
                    <div className="tabs">
                        <button
                            className={`tab ${selectedTab === 'users' ? 'active' : ''}`}
                            onClick={() => setSelectedTab('users')}
                        >
                            Пользователи
                        </button>
                        <button
                            className={`tab ${selectedTab === 'complaints' ? 'active' : ''}`}
                            onClick={() => setSelectedTab('complaints')}
                        >
                            Жалобы ({stats.totalComplaints})
                        </button>
                        <button
                            className={`tab ${selectedTab === 'notes' ? 'active' : ''}`}
                            onClick={() => setSelectedTab('notes')}
                        >
                            Заметки ({stats.totalNotes})
                        </button>
                    </div>

                    <div className="tab-content">
                        {selectedTab === 'users' && (
                            <div className="users-section">
                                <div className="section-header">
                                    <h2>Управление пользователями</h2>
                                    <button
                                        className="btn-primary"
                                        onClick={() => setShowAddUserModal(true)}
                                    >
                                        + Добавить пользователя
                                    </button>
                                </div>
                                {loading ? (
                                    <p>Загрузка...</p>
                                ) : (
                                    <div className="table-wrapper">
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>ФИО</th>
                                                    <th>Логин</th>
                                                    <th>Класс</th>
                                                    <th>Роль</th>
                                                    <th>Рейтинг</th>
                                                    <th>Действия</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {allUsers.filter(u => u.role !== 'owner').map((u) => (
                                                    <tr key={u.id} className={`role-${u.role}`}>
                                                        <td className="name-cell">{u.fullName}</td>
                                                        <td className="login-cell"><code>{u.login}</code></td>
                                                        <td className="class-cell">{u.class || '—'}</td>
                                                        <td>
                                                            <span className={`role-badge role-${u.role}`}>
                                                                {getRoleLabel(u.role)}
                                                            </span>
                                                        </td>
                                                        <td className="rating-cell">{u.rating !== null ? u.rating : '—'}</td>
                                                        <td className="actions-cell">
                                                            <button
                                                                className="btn-delete-small"
                                                                onClick={() => handleDeleteUser(u.id)}
                                                                title="Удалить пользователя"
                                                            >
                                                                ×
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {selectedTab === 'complaints' && (
                            <div className="complaints-section">
                                <h2>Все жалобы в системе</h2>
                                <p className="section-desc">Отправителя видны только владельцу</p>
                                {loading ? (
                                    <p>Загрузка...</p>
                                ) : allComplaints.length === 0 ? (
                                    <p className="no-data">Жалоб нет</p>
                                ) : (
                                    <div className="items-grid">
                                        {allComplaints.map((complaint) => (
                                            <div key={complaint.id} className="complaint-card">
                                                <div className="card-header">
                                                    <div className="header-left">
                                                        <h4>{complaint.title}</h4>
                                                        <span className="status-badge">{complaint.status || 'open'}</span>
                                                    </div>
                                                    <button
                                                        className="btn-delete"
                                                        onClick={() => handleDeleteComplaint(complaint.id)}
                                                        title="Удалить жалобу"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                                <p className="card-desc">{complaint.description}</p>
                                                <div className="card-meta">
                                                    <span className="sender">
                                                        <strong>От:</strong> {getUserName(complaint.userId)}
                                                    </span>
                                                    <span className="date">
                                                        {new Date(complaint.createdAt).toLocaleDateString('ru-RU')}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {selectedTab === 'notes' && (
                            <div className="notes-section">
                                <h2>Все заметки в системе</h2>
                                <p className="section-desc">Заметки от старост о поведении учеников</p>
                                {loading ? (
                                    <p>Загрузка...</p>
                                ) : allNotes.length === 0 ? (
                                    <p className="no-data">Заметок нет</p>
                                ) : (
                                    <div className="items-grid">
                                        {allNotes.map((note) => (
                                            <div key={note.id} className="note-card">
                                                <div className="card-header">
                                                    <div className="header-left">
                                                        <h4>{note.title}</h4>
                                                        <span className="author">От: {getUserName(note.userId)}</span>
                                                    </div>
                                                    <button
                                                        className="btn-delete"
                                                        onClick={() => handleDeleteNote(note.id)}
                                                        title="Удалить заметку"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                                <p className="card-desc">{note.content}</p>
                                                <div className="card-meta">
                                                    <span className="target">
                                                        <strong>На:</strong> {getUserName(note.targetId)}
                                                    </span>
                                                    <span className="date">
                                                        {new Date(note.createdAt).toLocaleDateString('ru-RU')}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {showAddUserModal && (
                <div className="modal-overlay" onClick={() => setShowAddUserModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Добавить нового пользователя</h2>
                            <button
                                className="modal-close"
                                onClick={() => setShowAddUserModal(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleAddUser} className="modal-form">
                            <div className="form-group">
                                <label>ФИО *</label>
                                <input
                                    type="text"
                                    value={newUserForm.fullName}
                                    onChange={(e) => setNewUserForm({...newUserForm, fullName: e.target.value})}
                                    placeholder="Введите полное имя"
                                />
                            </div>
                            <div className="form-group">
                                <label>Логин *</label>
                                <input
                                    type="text"
                                    value={newUserForm.login}
                                    onChange={(e) => setNewUserForm({...newUserForm, login: e.target.value})}
                                    placeholder="Введите логин"
                                />
                            </div>
                            <div className="form-group">
                                <label>Пароль *</label>
                                <input
                                    type="password"
                                    value={newUserForm.password}
                                    onChange={(e) => setNewUserForm({...newUserForm, password: e.target.value})}
                                    placeholder="Введите пароль"
                                />
                            </div>
                            <div className="form-group">
                                <label>Класс</label>
                                <input
                                    type="text"
                                    value={newUserForm.class}
                                    onChange={(e) => setNewUserForm({...newUserForm, class: e.target.value})}
                                    placeholder="Например: 8А"
                                />
                            </div>
                            <div className="form-group">
                                <label>Роль *</label>
                                <select
                                    value={newUserForm.role}
                                    onChange={(e) => setNewUserForm({...newUserForm, role: e.target.value})}
                                >
                                    <option value="user">Ученик</option>
                                    <option value="helper">Старост</option>
                                    <option value="admin">Учитель</option>
                                </select>
                            </div>
                            <div className="modal-buttons">
                                <button type="submit" className="btn-primary">Добавить</button>
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setShowAddUserModal(false)}
                                >
                                    Отмена
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

