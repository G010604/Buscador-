import React, { useState } from 'react';
import { TextField, Button, Typography } from '@mui/material';
import { JogoProvider, useJogoContext } from './JogoContext';

const LazyResultados = React.lazy(() => import('./Resultados'));

function App() {
  return (
    <JogoProvider>
      <AppContent />
    </JogoProvider>
  );
}

function AppContent() {
  const { nomeJogo, setNomeJogo, erro, setErro, setResultados, token, setToken } = useJogoContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginMessage, setLoginMessage] = useState('');

  const login = () => {
    if (!email.trim() || !password.trim()) {
        setErro('Email e senha são obrigatórios');
        return;
    }

    fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            setToken(data.token);
            setLoginMessage('Login realizado com sucesso!');
            setErro('');
        } else {
            setErro('Email ou senha incorretos');
            setLoginMessage('');
        }
    })
    .catch(error => {
        console.error('Erro no login:', error);
        setErro('Erro ao tentar realizar login');
        setLoginMessage('');
    });
};

  const buscarJogo = () => {
    if (!token) {
      setErro('Usuário não autenticado');
      return;
    }

    if (!nomeJogo.trim()) {
      setErro('O nome do jogo é obrigatório');
      return;
    }

    fetch(`http://localhost:3001/busca?nomeJogo=${encodeURIComponent(nomeJogo)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => {
          throw new Error(err.error || 'Erro ao buscar jogos');
        });
      }
      return response.json();
    })
    .then(data => {
      if (Array.isArray(data)) {
        setResultados(data);
        setErro('');
      } else {
        setErro('Formato de dados inesperado');
      }
    })
    .catch(error => {
      console.error('Erro ao buscar jogos:', error);
      setErro(error.message);
    });
  };

  return (
    <div>
      <Typography variant="h1">Busca de Jogos</Typography>

      <TextField
        label="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <TextField
        label="Senha"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <Button variant="contained" onClick={login} color="primary">Login</Button>

      {loginMessage && <Typography style={{ color: 'green' }}>{loginMessage}</Typography>}
      {erro && <Typography style={{ color: 'red' }}>{erro}</Typography>}

      <TextField
        id="nomeJogo"
        label="Digite o nome do jogo"
        value={nomeJogo}
        onChange={e => setNomeJogo(e.target.value)}
      />
      <Button variant="contained" onClick={buscarJogo} color="primary">Buscar</Button>

      <React.Suspense fallback={<div>Carregando...</div>}>
        <LazyResultados />
      </React.Suspense>
    </div>
  );
}

export default App;