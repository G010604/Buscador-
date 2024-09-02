import React from 'react';
import { Typography } from '@mui/material';
import { useJogoContext } from './JogoContext';

const Resultados = () => {
  const { resultados } = useJogoContext();

  if (!Array.isArray(resultados)) {
    return <Typography style={{ color: 'red' }}>Nenhum dado encontrado</Typography>;
  }

  return (
    <div>
      {resultados.length > 0 ? (
        resultados.map(jogo => (
          <div key={jogo.id}>
            <img src={jogo.background_image} alt={jogo.name} style={{ maxWidth: '200px', maxHeight: '200px' }} />
            <Typography>{jogo.name} - Plataformas: {jogo.platforms.map(plataforma => plataforma.platform.name).join(', ')}</Typography>
          </div>
        ))
      ) : (
        <Typography>Nenhum jogo encontrado</Typography>
      )}
    </div>
  );
};

export default Resultados;