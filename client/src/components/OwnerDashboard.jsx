import React, { useState, useEffect } from 'react';

const OwnerDashboard = ({ user, onLogout, data = {}, updateUserData, addUser, deleteUser, deleteComplaint, deleteNote, isDarkMode, toggleDarkMode }) => {
  const [logs, setLogs] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingChange, setRatingChange] = useState(0);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    username: '',
    password: '',
    class: '',
    role: 'user',
    rating: 0
  });

  useEffect(() => {
    if (data.logs) {
      setLogs(data.logs);
    }
    if (data.users) {
      setAllUsers(data.users);
    }
  }, [data]);

  const handleAddUser = () => {
    if (newUserForm.name && newUserForm.username && newUserForm.password) {
      const maxId = Math.max(...allUsers.map(u => parseInt(u.id)), 0);
      const newUserObj = {
        id: maxId + 1,
        name: newUserForm.name,
        username: newUserForm.username,
        password: newUserForm.password,
        class: newUserForm.class || null,
        role: newUserForm.role,
        rating: newUserForm.role === 'user' ? parseInt(newUserForm.rating) : null,
        complaints: [],
        notes: []
      };
      addUser(newUserObj);
      setNewUserForm({
        name: '',
        username: '',
        password: '',
        class: '',
        role: 'user',
        rating: 0
      });
      setShowAddUserModal(false);
    } else {
      alert('Please fill in all required fields');
    }
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure? This action cannot be undone!')) {
      deleteUser(userId);
      if (selectedUser?.id === userId) {
        setSelectedUser(null);
      }
    }
  };

  const handleRatingChange = (type) => {
    if (selectedUser && ratingChange > 0 && selectedUser.role === 'user') {
      let newRating;
      if (type === 'increase') {
        newRating = (selectedUser.rating || 0) + parseInt(ratingChange);
      } else {
        newRating = Math.max(0, (selectedUser.rating || 0) - parseInt(ratingChange));
      }

      const updated = { ...selectedUser, rating: newRating };
      updateUserData(updated);
      setSelectedUser(updated);
      setRatingChange(0);
      setShowRatingModal(false);
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 80) return '#28a745';
    if (rating >= 50) return '#ffc107';
    return '#dc3545';
  };

  const getRoleColor = (role) => {
    const colors = {
      owner: '#764ba2',
      admin: '#667eea',
      helper: '#ffc107',
      user: '#28a745'
    };
    return colors[role] || '#6c757d';
  };

  return (
    <div className="dashboard-wrapper" style={{ background: isDarkMode ? '#1a1a1a' : '#ffffff' }}>
      <button
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: isDarkMode ? '#ffc107' : '#2c3e50',
          color: isDarkMode ? '#000' : '#fff',
          border: 'none',
          padding: '10px 14px',
          borderRadius: '50px',
          cursor: 'pointer',
          fontSize: '18px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          zIndex: 1000,
          transition: 'all 0.3s ease',
          fontWeight: 'bold'
        }}
        onClick={toggleDarkMode}
        title={isDarkMode ? 'Светлая тема' : 'Тёмная тема'}
      >
        {isDarkMode ? '○' : '●'}
      </button>

      <div className="dashboard-header" style={{
        background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
        color: 'white'
      }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 600 }}>Администраторская панель</h1>
        <button className="logout-button" onClick={onLogout} style={{
          background: 'rgba(255,255,255,0.2)',
          color: 'white',
          border: '1px solid rgba(255,255,255,0.3)',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px'
        }}>Выход</button>
      </div>

      <div className="dashboard-content" style={{
        background: isDarkMode ? '#0f0f0f' : '#f8f9fa',
        color: isDarkMode ? '#e0e0e0' : '#212529',
        minHeight: '100vh',
        padding: '30px'
      }}>
        <div className="user-info" style={{
          background: isDarkMode ? '#2d2d2d' : 'white',
          color: isDarkMode ? '#e0e0e0' : '#212529',
          padding: '24px',
          borderRadius: '12px',
          marginBottom: '30px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '22px', fontWeight: 600 }}>Добро пожаловать, {user.name}</h2>
          <p style={{ margin: 0 }}><strong>Роль:</strong> Администратор системы</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>All Users</h2>
              <button
                onClick={() => setShowAddUserModal(true)}
                style={{
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600
                }}
              >
                Добавить пользователя
              </button>
            </div>

            <div className="users-list" style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {allUsers.length > 0 ? (
                allUsers.map(usr => (
                  <div
                    key={usr.id}
                    onClick={() => setSelectedUser(usr)}
                    style={{
                      background: selectedUser?.id === usr.id
                        ? (isDarkMode ? '#404040' : '#e8eaf6')
                        : (isDarkMode ? '#2d2d2d' : 'white'),
                      color: isDarkMode ? '#e0e0e0' : '#212529',
                      padding: '12px',
                      borderRadius: '8px',
                      marginBottom: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: `1px solid ${isDarkMode ? '#404040' : '#e0e0e0'}`,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 4px 0', fontWeight: 600, fontSize: '14px' }}>{usr.name}</h4>
                      <p style={{ margin: 0, fontSize: '12px', color: isDarkMode ? '#b0b0b0' : '#6c757d' }}>{usr.username}</p>
                    </div>
                    <span style={{
                      background: getRoleColor(usr.role),
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      whiteSpace: 'nowrap'
                    }}>
                      {usr.role.toUpperCase()}
                    </span>
                  </div>
                ))
              ) : (
                <p style={{ color: isDarkMode ? '#b0b0b0' : '#6c757d' }}>Нет пользователей</p>
              )}
            </div>
          </div>

          <div>
            {selectedUser ? (
              <div style={{
                background: isDarkMode ? '#2d2d2d' : 'white',
                color: isDarkMode ? '#e0e0e0' : '#212529',
                padding: '24px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>{selectedUser.name}</h3>
                  <button
                    onClick={() => handleDeleteUser(selectedUser.id)}
                    style={{
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 600
                    }}
                  >
                    Удалить
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  <p style={{ margin: 0 }}><strong>ID:</strong> {selectedUser.id}</p>
                  <p style={{ margin: 0 }}><strong>Логин:</strong> {selectedUser.username}</p>
                  <p style={{ margin: 0 }}><strong>Роль:</strong> {selectedUser.role}</p>
                  {selectedUser.class && <p style={{ margin: 0 }}><strong>Класс:</strong> {selectedUser.class}</p>}
                  {selectedUser.rating !== null && (
                    <>
                      <p style={{ margin: 0 }}><strong>Рейтинг:</strong> <span style={{ fontSize: '16px', color: getRatingColor(selectedUser.rating), fontWeight: 'bold' }}>{selectedUser.rating}</span></p>
                      <button
                        onClick={() => setShowRatingModal(true)}
                        style={{
                          background: '#667eea',
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 600
                        }}
                      >
                        Изменить рейтинг
                      </button>
                    </>
                  )}
                </div>

                {selectedUser.complaints && selectedUser.complaints.length > 0 && (
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ marginBottom: '12px', fontWeight: 600 }}>Жалобы ({selectedUser.complaints.length})</h4>
                    <div>
                      {selectedUser.complaints.map((complaint, idx) => (
                        <div key={idx} style={{
                          background: isDarkMode ? '#1a1a1a' : '#f8f9fa',
                          padding: '12px',
                          marginBottom: '8px',
                          borderRadius: '6px',
                          color: isDarkMode ? '#e0e0e0' : '#212529'
                        }}>
                          <div style={{ fontWeight: 600, marginBottom: '6px' }}>Анонимная жалоба</div>
                          <div style={{ marginBottom: '6px', fontSize: '14px' }}>{complaint.text}</div>
                          <div style={{ fontSize: '12px', color: isDarkMode ? '#b0b0b0' : '#6c757d' }}>{new Date(complaint.timestamp).toLocaleString()}</div>
                          <button
                            onClick={() => deleteComplaint(selectedUser.id, idx)}
                            style={{
                              background: '#dc3545',
                              color: 'white',
                              border: 'none',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '11px',
                              marginTop: '6px'
                            }}
                          >
                            Удалить
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedUser.notes && selectedUser.notes.length > 0 && (
                  <div>
                    <h4 style={{ marginBottom: '12px', fontWeight: 600 }}>Заметки ({selectedUser.notes.length})</h4>
                    <div>
                      {selectedUser.notes.map((note, idx) => (
                        <div key={idx} style={{
                          background: isDarkMode ? '#1a1a1a' : '#f8f9fa',
                          padding: '12px',
                          marginBottom: '8px',
                          borderRadius: '6px',
                          color: isDarkMode ? '#e0e0e0' : '#212529'
                        }}>
                          <div style={{ fontWeight: 600, marginBottom: '6px' }}>От: {note.fromUserName}</div>
                          <div style={{ marginBottom: '6px', fontSize: '14px' }}>{note.text}</div>
                          <div style={{ fontSize: '12px', color: isDarkMode ? '#b0b0b0' : '#6c757d' }}>{new Date(note.timestamp).toLocaleString()}</div>
                          <button
                            onClick={() => deleteNote(selectedUser.id, idx)}
                            style={{
                              background: '#dc3545',
                              color: 'white',
                              border: 'none',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '11px',
                              marginTop: '6px'
                            }}
                          >
                            Удалить
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                background: isDarkMode ? '#2d2d2d' : 'white',
                padding: '40px',
                textAlign: 'center',
                borderRadius: '8px',
                color: isDarkMode ? '#b0b0b0' : '#6c757d'
              }}>
                <h3 style={{ margin: 0 }}>Выберите пользователя для просмотра деталей</h3>
              </div>
            )}
          </div>
        </div>

        {logs.length > 0 && (
          <div style={{ marginTop: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>Логи системы (Последние 20)</h2>
            <div style={{
              background: isDarkMode ? '#2d2d2d' : 'white',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {logs.slice(-20).reverse().map((log, idx) => (
                  <div key={idx} style={{
                    padding: '12px 16px',
                    borderBottom: `1px solid ${isDarkMode ? '#404040' : '#e0e0e0'}`,
                    color: isDarkMode ? '#e0e0e0' : '#212529',
                    fontSize: '13px'
                  }}>
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                      {log.action}
                      {log.targetUserId && ` - User #${log.targetUserId}`}
                    </div>
                    <div style={{ fontSize: '12px', color: isDarkMode ? '#b0b0b0' : '#6c757d' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {showAddUserModal && (
          <div className="modal-overlay" onClick={() => setShowAddUserModal(false)} style={{
            background: 'rgba(0,0,0,0.5)',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 999
          }}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{
              background: isDarkMode ? '#2d2d2d' : 'white',
              color: isDarkMode ? '#e0e0e0' : '#212529',
              padding: '24px',
              borderRadius: '8px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
            }}>
              <h2 style={{ marginTop: 0, fontWeight: 600 }}>Add New User</h2>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '14px' }}>Name *</label>
                <input
                  type="text"
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({...newUserForm, name: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: `1px solid ${isDarkMode ? '#404040' : '#e0e0e0'}`,
                    background: isDarkMode ? '#1a1a1a' : '#fff',
                    color: isDarkMode ? '#e0e0e0' : '#212529',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '14px' }}>Username *</label>
                <input
                  type="text"
                  value={newUserForm.username}
                  onChange={(e) => setNewUserForm({...newUserForm, username: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: `1px solid ${isDarkMode ? '#404040' : '#e0e0e0'}`,
                    background: isDarkMode ? '#1a1a1a' : '#fff',
                    color: isDarkMode ? '#e0e0e0' : '#212529',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '14px' }}>Password *</label>
                <input
                  type="password"
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({...newUserForm, password: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: `1px solid ${isDarkMode ? '#404040' : '#e0e0e0'}`,
                    background: isDarkMode ? '#1a1a1a' : '#fff',
                    color: isDarkMode ? '#e0e0e0' : '#212529',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '14px' }}>Class</label>
                <input
                  type="text"
                  value={newUserForm.class}
                  onChange={(e) => setNewUserForm({...newUserForm, class: e.target.value})}
                  placeholder="e.g., 9A, 10B"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: `1px solid ${isDarkMode ? '#404040' : '#e0e0e0'}`,
                    background: isDarkMode ? '#1a1a1a' : '#fff',
                    color: isDarkMode ? '#e0e0e0' : '#212529',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '14px' }}>Role *</label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({...newUserForm, role: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: `1px solid ${isDarkMode ? '#404040' : '#e0e0e0'}`,
                    background: isDarkMode ? '#1a1a1a' : '#fff',
                    color: isDarkMode ? '#e0e0e0' : '#212529',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="user">User</option>
                  <option value="helper">Helper</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {newUserForm.role === 'user' && (
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '14px' }}>Initial Rating</label>
                  <input
                    type="number"
                    value={newUserForm.rating}
                    onChange={(e) => setNewUserForm({...newUserForm, rating: e.target.value})}
                    min="0"
                    max="100"
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '6px',
                      border: `1px solid ${isDarkMode ? '#404040' : '#e0e0e0'}`,
                      background: isDarkMode ? '#1a1a1a' : '#fff',
                      color: isDarkMode ? '#e0e0e0' : '#212529',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              )}

              <div className="button-group" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleAddUser}
                  style={{
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Create
                </button>
                <button
                  onClick={() => setShowAddUserModal(false)}
                  style={{
                    background: isDarkMode ? '#404040' : '#e0e0e0',
                    color: isDarkMode ? '#e0e0e0' : '#212529',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showRatingModal && selectedUser && (
          <div className="modal-overlay" onClick={() => setShowRatingModal(false)} style={{
            background: 'rgba(0,0,0,0.5)',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 999
          }}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{
              background: isDarkMode ? '#2d2d2d' : 'white',
              color: isDarkMode ? '#e0e0e0' : '#212529',
              padding: '24px',
              borderRadius: '8px',
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
            }}>
              <h2 style={{ marginTop: 0, fontWeight: 600 }}>Change Rating</h2>
              <p><strong>User:</strong> {selectedUser.name}</p>
              <p><strong>Current Rating:</strong> {selectedUser.rating}</p>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label htmlFor="rating-change" style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Change Amount:</label>
                <input
                  id="rating-change"
                  type="number"
                  value={ratingChange}
                  onChange={(e) => setRatingChange(parseInt(e.target.value) || 0)}
                  min="0"
                  max="100"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: `1px solid ${isDarkMode ? '#404040' : '#e0e0e0'}`,
                    background: isDarkMode ? '#1a1a1a' : '#fff',
                    color: isDarkMode ? '#e0e0e0' : '#212529',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div className="button-group" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => handleRatingChange('decrease')}
                  style={{
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    padding: '10px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '13px'
                  }}
                >
                  Decrease
                </button>
                <button
                  onClick={() => handleRatingChange('increase')}
                  style={{
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '10px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '13px'
                  }}
                >
                  Increase
                </button>
                <button
                  onClick={() => {
                    setShowRatingModal(false);
                    setRatingChange(0);
                  }}
                  style={{
                    background: isDarkMode ? '#404040' : '#e0e0e0',
                    color: isDarkMode ? '#e0e0e0' : '#212529',
                    border: 'none',
                    padding: '10px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '13px'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;

