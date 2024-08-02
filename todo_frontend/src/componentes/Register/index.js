import React, { useState } from 'react';
import axios from 'axios';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://127.0.0.1:8000';

function Register({ onRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/register/', { username, password, email });
      if (response.status === 201) {
        setSuccess('Registro bem-sucedido!');
        setError(null);
        if (onRegister) onRegister(); // Notifica o componente pai
      } else {
        setError('Erro ao registrar.');
      }
    } catch (error) {
      console.error('Erro ao registrar:', error); // Adicionado para depuração
      setError(error.response?.data?.error || 'Ocorreu um erro ao registrar.');
      setSuccess(null);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Registrar-se</h2>
      <div>
        <label>Usuário:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Senha:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div>
        <label>E-mail:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <button type="submit">Registre-se</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </form>
  );
}

export default Register;
