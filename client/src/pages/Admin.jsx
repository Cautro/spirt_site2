import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { useEffect, useState } from "react";
import ThemeToggle from "../components/ThemeToggle";
import "../styles/Admin.css";

const API_URL = "http://localhost:3000";

export default function Admin() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [ratingChange, setRatingChange] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [complaints, setComplaints] = useState([]);
    const [notes, setNotes] = useState([]);
    const [selectedTab, setSelectedTab] = useState("students");
    const [newUserForm, setNewUserForm] = useState({
        login: "",
        password: "",
        fullName: "",
        class: ""
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (user?.role !== 'admin') {
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
                const filtered = users.filter(u =>
                    u.class === user?.class &&
                    (u.role === 'user' || u.role === 'helper')
                );
                setStudents(filtered);
            }

            if (complaintsRes.ok) {
                const complaintsData = await complaintsRes.json();
                setComplaints(complaintsData);
            }

            if (notesRes.ok) {
                const notesData = await notesRes.json();
                setNotes(notesData);
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

    const handleRatingChange = async (type) => {
        if (!selectedStudent || ratingChange === 0) return;

        const change = type === 'increase' ? parseInt(ratingChange) : -parseInt(ratingChange);
        const newRating = selectedStudent.rating + change;

        if (newRating < 0) {
            setError("Рейтинг не может быть ниже 0");
            return;
        }
        if (newRating > 500) {
            setError("Рейтинг не может быть выше 500");
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/users/${selectedStudent.id}/rating`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ rating: newRating })
            });

            if (res.ok) {
                setStudents(students.map(s =>
                    s.id === selectedStudent.id
                        ? { ...s, rating: newRating }
                        : s
                ));
                setSelectedStudent({ ...selectedStudent, rating: newRating });
                setRatingChange(0);
                setSuccess("Рейтинг обновлен");
                setTimeout(() => setSuccess(""), 3000);
            }
        } catch (err) {
            console.error(err);
            setError("Ошибка при обновлении рейтинга");
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
                    role: "user",
                    fullName: newUserForm.fullName,
                    class: newUserForm.class || user?.class
                })
            });

            if (res.status === 409) {
                setError("Пользователь с таким логином уже существует");
                return;
            }

            if (res.ok) {
                const newUser = await res.json();
                setStudents([...students, newUser]);
                setShowAddUserModal(false);
                setNewUserForm({
                    login: "",
                    password: "",
                    fullName: "",
                    class: ""
                });
                setSuccess("Ученик добавлен в класс");
                setTimeout(() => setSuccess(""), 3000);
            } else {
                const data = await res.json();
                setError(data.message || "Ошибка при добавлении ученика");
            }
        } catch (err) {
            console.error(err);
            setError("Ошибка при добавлении ученика");
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Вы уверены, что хотите удалить этого ученика?")) return;

        try {
            const res = await fetch(`${API_URL}/api/users/${id}`, {
                method: "DELETE",
                credentials: "include"
            });

            if (res.ok) {
                setStudents(students.filter(s => s.id !== id));
                if (selectedStudent?.id === id) {
                    setSelectedStudent(null);
                }
                setSuccess("Ученик удален из класса");
                setTimeout(() => setSuccess(""), 3000);
            } else {
                setError("Ошибка при удалении ученика");
            }
        } catch (err) {
            console.error(err);
            setError("Ошибка при удалении ученика");
        }
    };

    const handleDeleteComplaint = async (id) => {
        if (!window.confirm("Вы уверены, что хотите удалить эту жалобу?")) return;

        try {
            const res = await fetch(`${API_URL}/api/complaints/${id}`, {
                method: "DELETE",
                credentials: "include"
            });

            if (res.ok) {
                setComplaints(complaints.filter(c => c.id !== id));
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
                setNotes(notes.filter(n => n.id !== id));
                setSuccess("Заметка удалена");
                setTimeout(() => setSuccess(""), 3000);
            }
        } catch (err) {
            console.error(err);
            setError("Ошибка при удалении заметки");
        }
    };

    const getUserName = (userId) => {
        const foundUser = students.find(u => u.id === userId);
        return foundUser ? foundUser.fullName : `Пользователь ${userId}`;
    };

    const getStatistics = () => {
        const stats = {
            total: students.length,
            needsAttention: students.filter(s => s.rating < 50).length,
            good: students.filter(s => s.rating >= 50 && s.rating < 250).length,
            excellent: students.filter(s => s.rating >= 250).length,
            average: students.length > 0 ? Math.round(students.reduce((sum, s) => sum + s.rating, 0) / students.length) : 0
        };
        return stats;
    };

    const getRatingCategory = (rating) => {
        if (rating < 50) return { name: 'Требует внимания', color: '#ff6b6b' };
        if (rating < 250) return { name: 'Хороший уровень', color: '#ffc107' };
        return { name: 'Отличный уровень', color: '#4caf50' };
    };

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="loading-spinner"></div>
                <p>Загрузка администраторской панели...</p>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <header className="admin-header">
                <div className="header-content">
                    <div className="header-left">
                        <h1>Панель управления</h1>
                        <p className="header-subtitle">Управление рейтингом учеников класса {user?.class || '8А'}</p>
                    </div>
                    <div className="header-right">
                        <ThemeToggle />
                        <button onClick={handleLogout} className="logout-btn">Выход</button>
                    </div>
                </div>
            </header>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <main className="admin-content">
                {/* Вкладки */}
                <div className="admin-tabs">
                    <button
                        className={`admin-tab ${selectedTab === 'students' ? 'active' : ''}`}
                        onClick={() => setSelectedTab('students')}
                    >
                        Ученики
                    </button>
                    <button
                        className={`admin-tab ${selectedTab === 'complaints' ? 'active' : ''}`}
                        onClick={() => setSelectedTab('complaints')}
                    >
                        Жалобы ({complaints.length})
                    </button>
                    <button
                        className={`admin-tab ${selectedTab === 'notes' ? 'active' : ''}`}
                        onClick={() => setSelectedTab('notes')}
                    >
                        Заметки ({notes.length})
                    </button>
                </div>

                {selectedTab === 'students' && (
                <>
                {/* Статистика */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon"></div>
                        <h3>Всего учеников</h3>
                        <p className="stat-number">{getStatistics().total}</p>
                    </div>
                    <div className="stat-card warning">
                        <div className="stat-icon"></div>
                        <h3>Требуют внимания</h3>
                        <p className="stat-number">{getStatistics().needsAttention}</p>
                        <p className="stat-desc">Рейтинг: 0-49</p>
                    </div>
                    <div className="stat-card info">
                        <div className="stat-icon"></div>
                        <h3>Хорошие</h3>
                        <p className="stat-number">{getStatistics().good}</p>
                        <p className="stat-desc">Рейтинг: 50-249</p>
                    </div>
                    <div className="stat-card success">
                        <div className="stat-icon"></div>
                        <h3>Отличные</h3>
                        <p className="stat-number">{getStatistics().excellent}</p>
                        <p className="stat-desc">Рейтинг: 250+</p>
                    </div>
                    <div className="stat-card average">
                        <div className="stat-icon"></div>
                        <h3>Средний рейтинг</h3>
                        <p className="stat-number">{getStatistics().average}</p>
                        <p className="stat-desc">По классу</p>
                    </div>
                </div>

                <div className="admin-grid">
                    <div className="students-panel">
                        <div className="panel-header">
                            <h2>Ученики класса {user?.class}</h2>
                            <button
                                className="btn-primary-small"
                                onClick={() => setShowAddUserModal(true)}
                            >
                                + Добавить
                            </button>
                        </div>
                        {students.length === 0 ? (
                            <p className="no-data">Нет учеников в классе</p>
                        ) : (
                            <div className="students-list">
                                {students.map((student) => (
                                    <div
                                        key={student.id}
                                        className={`student-item ${selectedStudent?.id === student.id ? 'active' : ''}`}
                                    >
                                        <div
                                            className="student-item-content"
                                            onClick={() => {
                                                setSelectedStudent(student);
                                                setRatingChange(0);
                                            }}
                                            // Обработчики нажатия теперь здесь — на внутреннем блоке
                                            onMouseDown={(e) => {
                                                if (e.target.closest('.btn-delete-student')) return;
                                                e.currentTarget.parentElement.classList.add('pressed');
                                            }}
                                            onMouseUp={(e) => {
                                                e.currentTarget.parentElement.classList.remove('pressed');
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.parentElement.classList.remove('pressed');
                                            }}
                                        >
                                            <div className="student-avatar">
                                                {student.fullName?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="student-info">
                                                <h4>{student.fullName}</h4>
                                                <p className="student-rating">
                                                    <span className={`rating-badge rating-${student.rating < 50 ? 'warning' : student.rating < 250 ? 'good' : 'excellent'}`}>
                                                        {getRatingCategory(student.rating).name}
                                                    </span>
                                                    <span className="rating-value2"> {student.rating}</span>
                                                </p>
                                            </div>
                                            <div className="student-arrow">→</div>
                                        </div>
                                        <button
                                            className="btn-delete-student"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteUser(student.id);
                                            }}
                                            title="Удалить ученика"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="control-panel">
                        {selectedStudent ? (
                            <div className="selected-student">
                                <div className="student-header">
                                    <div className="large-avatar">
                                        {selectedStudent.fullName?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="student-details">
                                        <h2>{selectedStudent.fullName}</h2>
                                        <p className="class-info">Класс: {selectedStudent.class}</p>
                                        <p className="role-info">Роль: {selectedStudent.role === 'helper' ? 'Староста' : 'Ученик'}</p>
                                    </div>
                                </div>

                                <div className="rating-display">
                                    <span className="rating-label">Текущий рейтинг</span>
                                    <span className="rating-number">{selectedStudent.rating}</span>
                                </div>

                                <div className="rating-controls">
                                    <div className="control-group">
                                        <label>Изменение рейтинга:</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={ratingChange}
                                            onChange={(e) => setRatingChange(e.target.value)}
                                            placeholder="Введите количество очков"
                                        />
                                    </div>

                                    <div className="button-group">
                                        <button
                                            className="btn-increase"
                                            onClick={() => handleRatingChange('increase')}
                                            disabled={ratingChange === 0 || ratingChange === ''}
                                        >
                                            Повысить
                                        </button>
                                        <button
                                            className="btn-decrease"
                                            onClick={() => handleRatingChange('decrease')}
                                            disabled={ratingChange === 0 || ratingChange === ''}
                                        >
                                            Понизить
                                        </button>
                                    </div>
                                </div>

                                <button
                                    className="btn-clear"
                                    onClick={() => {
                                        setSelectedStudent(null);
                                        setRatingChange(0);
                                    }}
                                >
                                    Отмена
                                </button>
                            </div>
                        ) : (
                            <div className="empty-state">
                                <p>Выберите ученика из списка</p>
                                <p className="empty-hint">Нажмите на имя ученика чтобы изменить его рейтинг</p>
                            </div>
                        )}
                    </div>
                </div>
                </>
                )}

                {selectedTab === 'complaints' && (
                    <div className="complaints-section">
                        <h2>Жалобы учеников класса {user?.class || '8А'}</h2>
                        {complaints.length === 0 ? (
                            <p className="no-data">Жалоб нет</p>
                        ) : (
                            <div className="items-list">
                                {complaints.map((complaint) => (
                                    <div key={complaint.id} className="item-card complaint-card">
                                        <div className="item-header">
                                            <h4>{complaint.title}</h4>
                                            <button
                                                className="btn-delete-item"
                                                onClick={() => handleDeleteComplaint(complaint.id)}
                                                title="Удалить"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        <p className="item-desc">{complaint.description}</p>
                                        <div className="item-meta">
                                            <span className="item-date">
                                                {new Date(complaint.createdAt).toLocaleDateString('ru-RU')}
                                            </span>
                                            <span className={`item-status ${complaint.status === 'resolved' ? 'resolved' : ''}`}>
                                                {complaint.status === 'resolved' ? 'Рассмотрена' : 'Новая'}
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
                        <h2>Заметки от старост класса {user?.class || '8А'}</h2>
                        {notes.length === 0 ? (
                            <p className="no-data">Заметок нет</p>
                        ) : (
                            <div className="items-list">
                                {notes.map((note) => (
                                    <div key={note.id} className="item-card note-card">
                                        <div className="item-header">
                                            <h4>{note.title}</h4>
                                            <button
                                                className="btn-delete-item"
                                                onClick={() => handleDeleteNote(note.id)}
                                                title="Удалить"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        <p className="item-desc">{note.content}</p>
                                        <div className="item-meta">
                                            <span className="note-author">От: {getUserName(note.userId)}</span>
                                            <span className="note-target">На: {getUserName(note.targetId)}</span>
                                            <span className="item-date">
                                                {new Date(note.createdAt).toLocaleDateString('ru-RU')}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {showAddUserModal && (
                <div className="modal-overlay" onClick={() => setShowAddUserModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Добавить ученика в класс {user?.class}</h2>
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