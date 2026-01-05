import React, { useState, useEffect } from 'react';

const AdminDashboard = ({ user, onLogout, data = {}, updateUserData, deleteComplaint, deleteNote, isDarkMode, toggleDarkMode }) => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [ratingChange, setRatingChange] = useState(0);
  const [showRatingModal, setShowRatingModal] = useState(false);

  useEffect(() => {
    if (data.users) {
      const userClasses = [...new Set(data.users.map(u => u.class).filter(c => c))];
      setClasses(userClasses);

      if (selectedClass) {
        const classStudents = data.users.filter(u => u.class === selectedClass);
        setStudents(classStudents);

        if (selectedStudent) {
          const updated = classStudents.find(s => s.id === selectedStudent.id);
          if (updated) setSelectedStudent(updated);
        }
      }
    }
  }, [data.users, selectedClass, selectedStudent?.id]);

  const handleSelectClass = (className) => {
    setSelectedClass(className);
    setSelectedStudent(null);
    const classStudents = data.users.filter(u => u.class === className);
    setStudents(classStudents);
  };

  const handleRatingChange = (type) => {
    if (selectedStudent && ratingChange > 0) {
      let newRating;
      if (type === 'increase') {
        newRating = (selectedStudent.rating || 0) + parseInt(ratingChange);
      } else {
        newRating = Math.max(0, (selectedStudent.rating || 0) - parseInt(ratingChange));
      }

      const updated = { ...selectedStudent, rating: newRating };
      updateUserData(updated);
      setSelectedStudent(updated);
      setRatingChange(0);
      setShowRatingModal(false);
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 80) return '#28a745';
    if (rating >= 50) return '#ffc107';
    return '#dc3545';
  };

  const adminClass = user.class || 'All';

  return (
    <div className="dashboard-wrapper" style={{ background: isDarkMode ? '#0f0f0f' : '#f8f9fa', minHeight: '100vh' }}>
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 600 }}>Панель Учителя</h1>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <p style={{ margin: 0 }}><strong>Класс:</strong> {adminClass}</p>
            <p style={{ margin: 0 }}><strong>Роль:</strong> Учитель</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>Классы</h2>
            <div className="classes-list">
              {classes.length > 0 ? (
                classes.map(className => (
                  <button
                    key={className}
                    onClick={() => handleSelectClass(className)}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '12px 16px',
                      marginBottom: '8px',
                      background: selectedClass === className
                        ? '#667eea'
                        : (isDarkMode ? '#2d2d2d' : 'white'),
                      color: selectedClass === className ? 'white' : (isDarkMode ? '#e0e0e0' : '#212529'),
                      border: `1px solid ${isDarkMode ? '#404040' : '#e0e0e0'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 500,
                      textAlign: 'left',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {className}
                  </button>
                ))
              ) : (
                <p style={{ color: isDarkMode ? '#b0b0b0' : '#6c757d' }}>Нет классов</p>
              )}
            </div>
          </div>

          <div>
            {selectedClass ? (
              <>
                <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>Ученики в {selectedClass}</h2>
                <div className="students-list">
                  {students.length > 0 ? (
                    students.map(student => (
                      <div
                        key={student.id}
                        onClick={() => setSelectedStudent(student)}
                        style={{
                          background: selectedStudent?.id === student.id
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
                        <div>
                          <h4 style={{ margin: '0 0 4px 0', fontWeight: 600 }}>{student.name}</h4>
                          <p style={{ margin: 0, fontSize: '13px', color: isDarkMode ? '#b0b0b0' : '#6c757d' }}>{student.role}</p>
                        </div>
                        {student.rating !== null && (
                          <span style={{
                            background: getRatingColor(student.rating),
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontWeight: 600,
                            fontSize: '13px'
                          }}>
                            {student.rating}
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <p style={{ color: isDarkMode ? '#b0b0b0' : '#6c757d' }}>Нет учеников в этом классе</p>
                  )}
                </div>
              </>
            ) : (
              <div style={{
                background: isDarkMode ? '#2d2d2d' : 'white',
                padding: '40px',
                textAlign: 'center',
                borderRadius: '8px',
                color: isDarkMode ? '#b0b0b0' : '#6c757d'
              }}>
                <h3 style={{ margin: 0 }}>Выберите класс для просмотра учеников</h3>
              </div>
            )}
          </div>
        </div>

        {selectedStudent && (
          <div style={{
            marginTop: '30px',
            background: isDarkMode ? '#2d2d2d' : 'white',
            color: isDarkMode ? '#e0e0e0' : '#212529',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>{selectedStudent.name}</h3>
              <button
                onClick={() => setShowRatingModal(true)}
                style={{
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Change Rating
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <p style={{ margin: 0 }}><strong>ID:</strong> {selectedStudent.id}</p>
              <p style={{ margin: 0 }}><strong>Role:</strong> {selectedStudent.role}</p>
              {selectedStudent.rating !== null && (
                <p style={{ margin: 0 }}><strong>Current Rating:</strong> <span style={{ fontSize: '18px', color: '#667eea', fontWeight: 'bold' }}>{selectedStudent.rating}</span></p>
              )}
            </div>

            {selectedStudent.complaints && selectedStudent.complaints.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ marginBottom: '12px', fontWeight: 600 }}>Complaints ({selectedStudent.complaints.length})</h4>
                <div>
                  {selectedStudent.complaints.map((complaint, idx) => (
                    <div key={idx} style={{
                      background: isDarkMode ? '#1a1a1a' : '#f8f9fa',
                      padding: '12px',
                      marginBottom: '8px',
                      borderRadius: '6px',
                      color: isDarkMode ? '#e0e0e0' : '#212529'
                    }}>
                      <div style={{ fontWeight: 600, marginBottom: '6px' }}>Anonymous Complaint</div>
                      <div style={{ marginBottom: '6px' }}>{complaint.text}</div>
                      <div style={{ fontSize: '12px', color: isDarkMode ? '#b0b0b0' : '#6c757d' }}>{new Date(complaint.timestamp).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedStudent.notes && selectedStudent.notes.length > 0 && (
              <div>
                <h4 style={{ marginBottom: '12px', fontWeight: 600 }}>Notes ({selectedStudent.notes.length})</h4>
                <div>
                  {selectedStudent.notes.map((note, idx) => (
                    <div key={idx} style={{
                      background: isDarkMode ? '#1a1a1a' : '#f8f9fa',
                      padding: '12px',
                      marginBottom: '8px',
                      borderRadius: '6px',
                      color: isDarkMode ? '#e0e0e0' : '#212529'
                    }}>
                      <div style={{ fontWeight: 600, marginBottom: '6px' }}>From: {note.fromUserName}</div>
                      <div style={{ marginBottom: '6px' }}>{note.text}</div>
                      <div style={{ fontSize: '12px', color: isDarkMode ? '#b0b0b0' : '#6c757d' }}>{new Date(note.timestamp).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {showRatingModal && selectedStudent && (
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
              <p><strong>Student:</strong> {selectedStudent.name}</p>
              <p><strong>Current Rating:</strong> {selectedStudent.rating || 0}</p>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label htmlFor="rating-change" style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Rating Change:</label>
                <input
                  id="rating-change"
                  type="number"
                  value={ratingChange}
                  onChange={(e) => setRatingChange(parseInt(e.target.value) || 0)}
                  min="0"
                  max="100"
                  style={{
                    width: '100%',
                    padding: '12px',
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
                    padding: '10px 20px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 600
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
                    padding: '10px 20px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 600
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
      </div>
    </div>
  );
};

export default AdminDashboard;

