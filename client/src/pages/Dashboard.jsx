import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { useState, useEffect } from "react";
import ThemeToggle from "../components/ThemeToggle";
import "../styles/Dashboard.css";

const API_URL = "http://localhost:3000";

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [classmates, setClassmates] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [notes, setNotes] = useState([]);
    const [selectedTab, setSelectedTab] = useState("profile");
    const [loading, setLoading] = useState(true);
    const [showComplaintForm, setShowComplaintForm] = useState(false);
    const [complaintForm, setComplaintForm] = useState({
        targetId: "",
        title: "",
        description: ""
    });
    const [showNoteForm, setShowNoteForm] = useState(false);
    const [noteForm, setNoteForm] = useState({
        targetId: "",
        title: "",
        content: ""
    });

    useEffect(() => {
        if (user && !["user", "helper"].includes(user.role)) {
            navigate("/unauthorized");
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
                // Правильная фильтрация
                const classmates = users.filter(u => {
                    if (u.class !== user?.class || u.id === user?.id || u.role === 'admin') {
                        return false;
                    }
                    // User видит только user
                    if (user?.role === 'user') {
                        return u.role === 'user';
                    }
                    // Helper видит user и других helper
                    if (user?.role === 'helper') {
                        return u.role === 'user' || (u.role === 'helper' && u.id !== user?.id);
                    }
                    return true;
                });
                setClassmates(classmates);
            }

            if (complaintsRes.ok) {
                const complaints = await complaintsRes.json();
                setComplaints(complaints.filter(c => c.userId === user?.id) || []);
            }

            if (notesRes.ok) {
                const notes = await notesRes.json();
                setNotes(notes.filter(n => n.userId === user?.id) || []);
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

    const handleComplaintSubmit = async (e) => {
        e.preventDefault();
        if (!complaintForm.targetId || !complaintForm.title) return;

        try {
            const res = await fetch(`${API_URL}/api/complaints`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    title: complaintForm.title,
                    description: complaintForm.description,
                    userId: user?.id,
                    targetId: parseInt(complaintForm.targetId),
                    isAnonymous: true
                })
            });

            if (res.ok) {
                setComplaintForm({ targetId: "", title: "", description: "" });
                setShowComplaintForm(false);
                fetchData();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleNoteSubmit = async (e) => {
        e.preventDefault();
        if (!noteForm.targetId || !noteForm.title) return;

        try {
            const res = await fetch(`${API_URL}/api/notes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    title: noteForm.title,
                    content: noteForm.content,
                    userId: user?.id,
                    targetId: parseInt(noteForm.targetId)
                })
            });

            if (res.ok) {
                setNoteForm({ targetId: "", title: "", content: "" });
                setShowNoteForm(false);
                fetchData();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const isHelper = user?.role === "helper";

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <p>Загрузка профиля...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="header-left">
                        <h1>Личный кабинет</h1>
                        <p className="header-subtitle">
                            {isHelper ? "🌟 Старост класса" : "👤 Ученик"}
                        </p>
                    </div>
                    <div className="header-right">
                        <ThemeToggle />
                        <button onClick={handleLogout} className="logout-btn">Выход</button>
                    </div>
                </div>
            </header>

            <main className="dashboard-content">
                <div className="profile-card">
                    <div className="profile-header">
                        <div className="profile-avatar">
                            {user?.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <div className="profile-info">
                            <h2>{user?.fullName}</h2>
                            <p className="profile-class">Класс: <strong>{user?.class}</strong></p>
                            <div className="profile-rating">
                                <span className="rating-label">Рейтинг:</span>
                                <span className="rating-value">{user?.rating || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="tabs-section">
                    <div className="tabs">
                        <button
                            className={`tab ${selectedTab === "profile" ? "active" : ""}`}
                            onClick={() => setSelectedTab("profile")}
                        >
                            📋 Информация
                        </button>
                        <button
                            className={`tab ${selectedTab === "complaints" ? "active" : ""}`}
                            onClick={() => setSelectedTab("complaints")}
                        >
                            ⚠️ Жалобы ({complaints.length})
                        </button>
                        {isHelper && (
                            <button
                                className={`tab ${selectedTab === "notes" ? "active" : ""}`}
                                onClick={() => setSelectedTab("notes")}
                            >
                                📝 Заметки ({notes.length})
                            </button>
                        )}
                    </div>

                    <div className="tab-content">
                        {selectedTab === "profile" && (
                            <div className="profile-section">
                                <div className="section-card">
                                    <h3>📚 Информация о классе</h3>
                                    <p>Одноклассники в вашем классе:</p>
                                    {classmates.length === 0 ? (
                                        <p className="no-data">Нет одноклассников</p>
                                    ) : (
                                        <div className="classmates-grid">
                                            {classmates.map((mate) => (
                                                <div key={mate.id} className="classmate-card">
                                                    <div className="mate-avatar">
                                                        {mate.fullName?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <h4>{mate.fullName}</h4>
                                                    <p className="mate-role">
                                                        {mate.role === "helper" ? "🌟 Старост." : "👤 Ученик"}
                                                    </p>
                                                    <div className="mate-rating">Рейтинг: {mate.rating}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {selectedTab === "complaints" && (
                            <div className="complaints-section">
                                <div className="section-header">
                                    <h3>⚠️ Мои жалобы</h3>
                                    <button
                                        className="btn-primary"
                                        onClick={() => setShowComplaintForm(!showComplaintForm)}
                                    >
                                        {showComplaintForm ? "Отмена" : "+ Написать жалобу"}
                                    </button>
                                </div>

                                {showComplaintForm && (
                                    <form className="form-card" onSubmit={handleComplaintSubmit}>
                                        <div className="form-group">
                                            <label>На кого жалоба:</label>
                                            <select
                                                value={complaintForm.targetId}
                                                onChange={(e) => setComplaintForm({
                                                    ...complaintForm,
                                                    targetId: e.target.value
                                                })}
                                                required
                                            >
                                                <option value="">Выберите ученика</option>
                                                {classmates.map((mate) => (
                                                    <option key={mate.id} value={mate.id}>
                                                        {mate.fullName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>Заголовок:</label>
                                            <input
                                                type="text"
                                                value={complaintForm.title}
                                                onChange={(e) => setComplaintForm({
                                                    ...complaintForm,
                                                    title: e.target.value
                                                })}
                                                placeholder="Кратко опишите проблему"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Описание:</label>
                                            <textarea
                                                value={complaintForm.description}
                                                onChange={(e) => setComplaintForm({
                                                    ...complaintForm,
                                                    description: e.target.value
                                                })}
                                                placeholder="Подробнее о происшествии..."
                                                rows="4"
                                            ></textarea>
                                        </div>

                                        <button type="submit" className="btn-submit">Отправить жалобу</button>
                                    </form>
                                )}

                                <div className="items-list">
                                    {complaints.length === 0 ? (
                                        <p className="no-data">Жалоб нет</p>
                                    ) : (
                                        complaints.map((complaint) => (
                                            <div key={complaint.id} className="item-card">
                                                <div className="item-header">
                                                    <h4>{complaint.title}</h4>
                                                    <span className="item-date">
                                                        {new Date(complaint.createdAt).toLocaleDateString('ru-RU')}
                                                    </span>
                                                </div>
                                                <p className="item-desc">{complaint.description}</p>
                                                <span className="item-status">{complaint.status || 'обработана'}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {isHelper && selectedTab === "notes" && (
                            <div className="notes-section">
                                <div className="section-header">
                                    <h3>📝 Мои заметки</h3>
                                    <button
                                        className="btn-primary"
                                        onClick={() => setShowNoteForm(!showNoteForm)}
                                    >
                                        {showNoteForm ? "Отмена" : "+ Добавить заметку"}
                                    </button>
                                </div>

                                {showNoteForm && (
                                    <form className="form-card" onSubmit={handleNoteSubmit}>
                                        <div className="form-group">
                                            <label>На кого заметка:</label>
                                            <select
                                                value={noteForm.targetId}
                                                onChange={(e) => setNoteForm({
                                                    ...noteForm,
                                                    targetId: e.target.value
                                                })}
                                                required
                                            >
                                                <option value="">Выберите ученика</option>
                                                {classmates.filter(m => m.role === 'user').map((mate) => (
                                                    <option key={mate.id} value={mate.id}>
                                                        {mate.fullName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>Заголовок:</label>
                                            <input
                                                type="text"
                                                value={noteForm.title}
                                                onChange={(e) => setNoteForm({
                                                    ...noteForm,
                                                    title: e.target.value
                                                })}
                                                placeholder="Тема заметки"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Содержание:</label>
                                            <textarea
                                                value={noteForm.content}
                                                onChange={(e) => setNoteForm({
                                                    ...noteForm,
                                                    content: e.target.value
                                                })}
                                                placeholder="Описание поведения или информация..."
                                                rows="4"
                                            ></textarea>
                                        </div>

                                        <button type="submit" className="btn-submit">Добавить заметку</button>
                                    </form>
                                )}

                                <div className="items-list">
                                    {notes.length === 0 ? (
                                        <p className="no-data">Заметок нет</p>
                                    ) : (
                                        notes.map((note) => (
                                            <div key={note.id} className="item-card">
                                                <div className="item-header">
                                                    <h4>{note.title}</h4>
                                                    <span className="item-date">
                                                        {new Date(note.createdAt).toLocaleDateString('ru-RU')}
                                                    </span>
                                                </div>
                                                <p className="item-desc">{note.content}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

