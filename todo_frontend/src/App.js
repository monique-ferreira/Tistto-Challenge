import { useState } from 'react';
import TaskList from './componentes/TaskList';
import TaskForm from './componentes/TaskForm';
import Login from './componentes/Login';
import Register from './componentes/Register';
import axios from 'axios';
import './App.css';

const loginUser = async (userData) => {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (response.ok) {
      return true;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Falha na autenticação');
    }
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return false;
  }
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [setTasks] = useState([]);

  const handleLogin = async (userData) => {
    const success = await loginUser(userData);

    if (success) {
      setIsAuthenticated(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const handleRegister = async (userData) => {
    try {
      await axios.post('/api/register/', userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Erro ao registrar:', error);
    }
  };

  const handleTaskCreated = (newTask) => {
    setTasks((prevTasks) => [...prevTasks, newTask]);
  };

  return (
    <div className="App">
      {isAuthenticated ? (
        <div>
          <TaskList onTaskCreated={handleTaskCreated} />
          <button onClick={() => setShowTaskForm(!showTaskForm)}>
            {showTaskForm ? 'Cancelar' : 'Criar nova tarefa'}
          </button>
          {showTaskForm && <TaskForm onTaskCreated={handleTaskCreated} />}
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <div>
          {showRegister ? (
            <Register onRegister={handleRegister} />
          ) : (
            <Login onLogin={handleLogin} />
          )}
          <button onClick={() => setShowRegister(!showRegister)}>
            {showRegister ? 'Já possui uma conta? Log in' : 'Precisa de uma conta? Registre-se'}
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
