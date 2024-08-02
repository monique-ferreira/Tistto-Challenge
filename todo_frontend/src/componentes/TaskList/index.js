import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TaskItem from '../TaskItem';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://127.0.0.1:8000';

const fetchTasks = async () => {
  try {
    const response = await axios.get('/api/tasks/');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error);
    return [];
  }
};

const updateTask = async (taskId, taskData) => {
  try {
    const response = await axios.patch(`/api/tasks/${taskId}/update/`, taskData);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
  }
};

function TaskList({ onTaskCreated }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTasks = async () => {
      const data = await fetchTasks();
      setTasks(data);
      setLoading(false);
    };

    loadTasks();
  }, []);

  const handleTaskUpdate = async (taskId, updatedData) => {
    const updatedTask = await updateTask(taskId, updatedData);
    if (updatedTask) {
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? updatedTask : task))
      );
    }
  };

  if (loading) {
    return <p>Carregando tarefas...</p>;
  }

  return (
    <div>
      {tasks.length === 0 ? (
        <p>Não há tarefas pendentes</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onUpdate={handleTaskUpdate}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

export default TaskList;
