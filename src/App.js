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
  const [plataformas, setPlataformas] = useState('');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [inserirMessage, setInserirMessage] = useState('');

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
      if (response.ok) {
        return response.json();
      } else if (response.status === 404) {
        throw new Error('Nenhum jogo encontrado');
      } else {
        throw new Error('Erro ao buscar jogos');
      }
    })
    .then(data => {
      setResultados(data);
      setErro('');
    })
    .catch(error => {
      console.error('Erro ao buscar jogos:', error);
      setErro(error.message);
    });
  };

  const inserirJogo = () => {
    if (!token) {
      setErro('Usuário não autenticado');
      return;
    }

    if (!nomeJogo.trim() || !plataformas.trim() || !backgroundImage.trim()) {
      setErro('Todos os campos são obrigatórios');
      return;
    }

    fetch('http://localhost:3001/inserir-jogo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: nomeJogo,
        platforms: plataformas.split(',').map(p => p.trim()),
        background_image: backgroundImage
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.jogo) {
        setInserirMessage('Jogo inserido com sucesso!');
        setErro('');
        setNomeJogo('');
        setPlataformas('');
        setBackgroundImage('');
      } else {
        setErro(data.error || 'Erro ao inserir jogo');
        setInserirMessage('');
      }
    })
    .catch(error => {
      console.error('Erro ao inserir jogo:', error);
      setErro('Erro ao tentar inserir jogo');
      setInserirMessage('');
    });
  };

  return (
    <div>
      <Typography variant="h2">Login</Typography>
      <TextField
        id="email"
        label="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <TextField
        id="password"
        label="Senha"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <Button variant="contained" onClick={login} color="primary">Login</Button>

      {loginMessage && <Typography style={{ color: 'green' }}>{loginMessage}</Typography>}
      {erro && <Typography style={{ color: 'red' }}>{erro}</Typography>}

      <Typography variant="h2">Buscar Jogo</Typography>
      <TextField
        id="nomeJogo"
        label="Nome do Jogo"
        value={nomeJogo}
        onChange={e => setNomeJogo(e.target.value)}
      />
      <Button variant="contained" onClick={buscarJogo} color="primary">Buscar</Button>

      <React.Suspense fallback={<div>Carregando resultados...</div>}>
        <LazyResultados />
      </React.Suspense>

      <Typography variant="h2">Inserir Novo Jogo</Typography>
      <TextField
        id="nomeJogo"
        label="Nome do Jogo"
        value={nomeJogo}
        onChange={e => setNomeJogo(e.target.value)}
      />
      <TextField
        id="plataformas"
        label="Plataformas (separadas por vírgula)"
        value={plataformas}
        onChange={e => setPlataformas(e.target.value)}
      />
      <TextField
        id="backgroundImage"
        label="URL da Imagem de Fundo"
        value={backgroundImage}
        onChange={e => setBackgroundImage(e.target.value)}
      />
      <Button variant="contained" onClick={inserirJogo} color="primary">Inserir Jogo</Button>

      {inserirMessage && <Typography style={{ color: 'green' }}>{inserirMessage}</Typography>}
      {erro && <Typography style={{ color: 'red' }}>{erro}</Typography>}
    </div>
  );
}

export default App;