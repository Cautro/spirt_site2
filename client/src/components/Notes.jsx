import React, { useState } from 'react';

const Notes = ({ user, onAddNote }) => {
  const [note, setNote] = useState('');

  const handleAddNote = () => {
    if (note.trim()) {
      onAddNote(user.id, note);
      setNote('');
    }
  };

  return (
    <div>
      <h3>Заметки</h3>
      <ul>
        {user.notes.map((n, index) => (
          <li key={index}>{n}</li>
        ))}
      </ul>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Напишите заметку"
      />
      <button onClick={handleAddNote}>Добавить заметку</button>
    </div>
  );
};

export default Notes;
