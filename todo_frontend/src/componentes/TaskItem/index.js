import React from 'react';
import axios from 'axios';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://127.0.0.1:8000';

const formatStatus = (isComplete) => (isComplete ? 'Completa' : 'Incompleta');

const deleteTask = async (taskId) => {
  try {
    await axios.delete(`/api/tasks/${taskId}/delete/`);
  } catch (error) {
    console.error('Erro ao excluir tarefa:', error);
  }
};

function TaskItem({ task, onUpdate }) {
  const handleStatusChange = async () => {
    const updatedTask = await onUpdate(task.id, { isComplete: !task.isComplete });
    if (updatedTask) {
    }
  };

  const handleDelete = async () => {
    await deleteTask(task.id);
  };

  return (
    <li>
      <h3>{task.title}</h3>
      {task.details && <p>{task.details}</p>}
      <p>Status: {formatStatus(task.isComplete)}</p>
      <button onClick={handleStatusChange}>
        Marcar como {task.isComplete ? 'Incompleta' : 'Completa'}
      </button>
      <button onClick={handleDelete}>Excluir</button>
    </li>
  );
}

export default TaskItem;
