import React, { useState, useEffect } from 'react';

const HelperDashboard = ({ user, onLogout, data = {}, addNote, isDarkMode, toggleDarkMode }) => {
  const [classmates, setClassmates] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);

  useEffect(() => {
    if (data.users) {
      const mates = data.users.filter(u => u.class === user.class && u.id !== user.id);
      setClassmates(mates);
      if (selectedStudent) {
        const updated = mates.find(m => m.id === selectedStudent.id);
        if (updated) setSelectedStudent(updated);
      }
    }
  }, [data.users, user.class, user.id, selectedStudent?.id]);

  const handleAddNote = () => {
    if (selectedStudent && noteText.trim()) {
      addNote(selectedStudent.id, noteText, user);
      setNoteText('');
      setShowNoteModal(false);
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 80) return 'high';
    if (rating >= 50) return 'medium';
    return 'low';
  };

  const currentUserData = data.users?.find(u => u.id === user.id) || user;

  return (
    <div className="dashboard-wrapper" style={{ background: isDarkMode ? '#1a1a1a' : '#ffffff' }}>
      {/* Theme Toggle */}
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
        title={isDarkMode ? 'Light theme' : 'Dark theme'}
      >
        {isDarkMode ? '○' : '●'}
      </button>

      <div className="dashboard-header" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 600 }}>Панель Помощника</h1>
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
        {/* User Info */}
        <div className="user-info" style={{
          background: isDarkMode ? '#2d2d2d' : 'white',
          color: isDarkMode ? '#e0e0e0' : '#212529',
          padding: '24px',
          borderRadius: '12px',
          marginBottom: '30px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '22px', fontWeight: 600 }}>Добро пожаловать, {user.name}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <p style={{ margin: 0 }}><strong>Класс:</strong> {user.class}</p>
            <p style={{ margin: 0 }}><strong>Роль:</strong> Помощник</p>
            <p style={{ margin: 0 }}><strong>Мой рейтинг:</strong> <span style={{ fontSize: '18px', color: '#667eea', fontWeight: 'bold' }}>{userData.rating || 0}</span></p>
          </div>
        </div>

        {/* Complaints on Helper */}
        {currentUserData.complaints && currentUserData.complaints.length > 0 && (
          <div style={{
            marginBottom: '30px',
            background: isDarkMode ? '#3d2d1d' : '#fff3cd',
            padding: '20px',
            borderRadius: '8px',
            borderLeft: '4px solid #ffc107'
          }}>
            <h3 style={{ marginTop: 0, color: isDarkMode ? '#ffc107' : '#856404' }}>Жалобы ({currentUserData.complaints.length})</h3>
            <div className="messages-container">
              {currentUserData.complaints.map((complaint, idx) => (
                <div key={idx} className="message-item complaint" style={{
                  background: isDarkMode ? '#2d2d2d' : 'white',
                  padding: '12px',
                  marginBottom: '8px',
                  borderRadius: '6px',
                  color: isDarkMode ? '#e0e0e0' : '#212529'
                }}>
                  <div className="message-header" style={{ fontWeight: 600, marginBottom: '8px' }}>Анонимная жалоба</div>
                  <div className="message-text" style={{ marginBottom: '6px' }}>{complaint.text}</div>
                  <div className="message-time" style={{ fontSize: '12px', color: isDarkMode ? '#b0b0b0' : '#6c757d' }}>{new Date(complaint.timestamp).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Classmates List */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>Одноклассники</h2>
          {classmates.length > 0 ? (
            <div className="students-list">
              {classmates.map(classmate => (
                <div
                  key={classmate.id}
                  className="student-item"
                  onClick={() => setSelectedStudent(classmate)}
                  style={{
                    background: selectedStudent?.id === classmate.id
                      ? (isDarkMode ? '#404040' : '#e8eaf6')
                      : (isDarkMode ? '#2d2d2d' : 'white'),
                    color: isDarkMode ? '#e0e0e0' : '#212529',
                    padding: '16px',
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
                  <div className="student-info">
                    <h4 style={{ margin: '0 0 6px 0', fontWeight: 600 }}>{classmate.name}</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: isDarkMode ? '#b0b0b0' : '#6c757d' }}>ID: {classmate.id} | Роль: {classmate.role.toUpperCase()}</p>
                  </div>
                  {classmate.rating !== null && (
                    <span className={`rating-badge ${getRatingColor(classmate.rating)}`} style={{
                      background: classmate.rating >= 80 ? '#28a745' : classmate.rating >= 50 ? '#ffc107' : '#dc3545',
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: 600
                    }}>
                      {classmate.rating}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              background: isDarkMode ? '#2d2d2d' : 'white',
              padding: '40px',
              textAlign: 'center',
              borderRadius: '8px',
              color: isDarkMode ? '#b0b0b0' : '#6c757d'
            }}>
              <h3 style={{ margin: 0 }}>Нет других студентов в вашем классе</h3>
            </div>
          )}
        </div>

        {/* Selected Student Details */}
        {selectedStudent && (
          <div style={{
            background: isDarkMode ? '#2d2d2d' : 'white',
            color: isDarkMode ? '#e0e0e0' : '#212529',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>{selectedStudent.name}</h3>
              <button
                className="btn-primary"
                onClick={() => setShowNoteModal(true)}
                style={{
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Добавить заметку
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <p style={{ margin: 0 }}><strong>ID:</strong> {selectedStudent.id}</p>
              <p style={{ margin: 0 }}><strong>Роль:</strong> {selectedStudent.role}</p>
              {selectedStudent.rating !== null && (
                <p style={{ margin: 0 }}><strong>Рейтинг:</strong> <span style={{ fontSize: '16px', color: '#667eea', fontWeight: 'bold' }}>{selectedStudent.rating}</span></p>
              )}
            </div>

            {selectedStudent.complaints && selectedStudent.complaints.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ marginBottom: '12px', fontWeight: 600 }}>Жалобы ({selectedStudent.complaints.length})</h4>
                <div className="messages-container">
                  {selectedStudent.complaints.map((complaint, idx) => (
                    <div key={idx} className="message-item complaint" style={{
                      background: isDarkMode ? '#1a1a1a' : '#f8f9fa',
                      padding: '12px',
                      marginBottom: '8px',
                      borderRadius: '6px',
                      color: isDarkMode ? '#e0e0e0' : '#212529'
                    }}>
                      <div className="message-header" style={{ fontWeight: 600, marginBottom: '6px' }}>Анонимная жалоба</div>
                      <div className="message-text" style={{ marginBottom: '4px' }}>{complaint.text}</div>
                      <div className="message-time" style={{ fontSize: '12px', color: isDarkMode ? '#b0b0b0' : '#6c757d' }}>{new Date(complaint.timestamp).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedStudent.notes && selectedStudent.notes.length > 0 && (
              <div>
                <h4 style={{ marginBottom: '12px', fontWeight: 600 }}>Заметки ({selectedStudent.notes.length})</h4>
                <div className="messages-container">
                  {selectedStudent.notes.map((note, idx) => (
                    <div key={idx} className="message-item note" style={{
                      background: isDarkMode ? '#1a1a1a' : '#f8f9fa',
                      padding: '12px',
                      marginBottom: '8px',
                      borderRadius: '6px',
                      color: isDarkMode ? '#e0e0e0' : '#212529'
                    }}>
                      <div className="message-header" style={{ fontWeight: 600, marginBottom: '6px' }}>От: {note.fromUserName}</div>
                      <div className="message-text" style={{ marginBottom: '4px' }}>{note.text}</div>
                      <div className="message-time" style={{ fontSize: '12px', color: isDarkMode ? '#b0b0b0' : '#6c757d' }}>{new Date(note.timestamp).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Note Modal */}
        {showNoteModal && selectedStudent && (
          <div className="modal-overlay" onClick={() => setShowNoteModal(false)} style={{
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
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
            }}>
              <h2 style={{ marginTop: 0, fontWeight: 600 }}>Add Note</h2>
              <p><strong>Student:</strong> {selectedStudent.name}</p>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label htmlFor="note-text" style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Note Text:</label>
                <textarea
                  id="note-text"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Enter information about behavior or issues"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '6px',
                    border: `1px solid ${isDarkMode ? '#404040' : '#e0e0e0'}`,
                    background: isDarkMode ? '#1a1a1a' : '#fff',
                    color: isDarkMode ? '#e0e0e0' : '#212529',
                    fontFamily: 'inherit',
                    fontSize: '14px',
                    minHeight: '120px',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div className="button-group" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  className="btn-success"
                  onClick={handleAddNote}
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
                  Save
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setShowNoteModal(false);
                    setNoteText('');
                  }}
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

        {/* Statistics */}
        <div style={{
          marginTop: '40px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px'
        }}>
          {[
            { label: 'Classmates', value: classmates.length },
            { label: 'Excellent', value: classmates.filter(c => (c.rating || 0) >= 80).length },
            { label: 'Total Notes', value: classmates.reduce((sum, s) => sum + (s.notes?.length || 0), 0) },
            { label: 'Total Complaints', value: classmates.reduce((sum, s) => sum + (s.complaints?.length || 0), 0) }
          ].map((stat, idx) => (
            <div key={idx} style={{
              background: isDarkMode ? '#2d2d2d' : 'white',
              color: isDarkMode ? '#e0e0e0' : '#212529',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#667eea', fontSize: '24px', fontWeight: 700 }}>{stat.value}</h3>
              <p style={{ margin: 0, fontSize: '13px', color: isDarkMode ? '#b0b0b0' : '#6c757d' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HelperDashboard;

