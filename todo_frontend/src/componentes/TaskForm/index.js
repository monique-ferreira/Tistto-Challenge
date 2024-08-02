import React, { useState } from 'react';
import axios from 'axios';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://127.0.0.1:8000';

const createTask = async (taskData) => {
  try {
    const response = await axios.post('/api/tasks/create/', taskData);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    return null;
  }
};

function TaskForm({ onTaskCreated }) {
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    const taskData = { title, details, isComplete };
    const newTask = await createTask(taskData);

    if (newTask) {
      onTaskCreated(newTask);
      setTitle('');
      setDetails('');
      setIsComplete(false);
      setError('');
    } else {
      setError('Não foi possível criar a tarefa. Verifique os dados e tente novamente.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Título:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Detalhes:</label>
        <input
          type="text"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        />
      </div>
      <div>
        <label>
          Completa:
          <input
            type="checkbox"
            checked={isComplete}
            onChange={(e) => setIsComplete(e.target.checked)}
          />
        </label>
      </div>
      <button type="submit">Adicionar Tarefa</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}

export default TaskForm;
