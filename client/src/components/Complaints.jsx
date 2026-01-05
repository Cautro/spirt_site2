import React, { useState } from 'react';

const Complaints = ({ user, onAddComplaint }) => {
  const [complaint, setComplaint] = useState('');

  const handleAddComplaint = () => {
    if (complaint.trim()) {
      onAddComplaint(user.id, complaint);
      setComplaint('');
    }
  };

  return (
    <div>
      <h3>Жалобы</h3>
      <ul>
        {user.complaints.map((c, index) => (
          <li key={index}>{c}</li>
        ))}
      </ul>
      <textarea
        value={complaint}
        onChange={(e) => setComplaint(e.target.value)}
        placeholder="Напишите жалобу"
      />
      <button onClick={handleAddComplaint}>Добавить жалобу</button>
    </div>
  );
};

export default Complaints;
