import React from 'react';
import { Typography } from '@mui/material';
import { useJogoContext } from './JogoContext';

const Resultados = () => {
  const { resultados } = useJogoContext();

  if (!Array.isArray(resultados) || resultados.length === 0) {
    return <Typography style={{ color: 'red' }}>Nenhum dado encontrado</Typography>;
  }

  return (
    <div>
      {resultados.map((jogo, index) => (
        <div key={jogo.id || index}>
          {jogo.background_image ? (
            <img
              src={jogo.background_image}
              alt={jogo.name || 'Imagem indisponível'}
              style={{ maxWidth: '200px', maxHeight: '200px' }}
            />
          ) : (
            <Typography>Imagem indisponível</Typography>
          )}
          <Typography>
            {jogo.name ? jogo.name : 'Nome não disponível'} - Plataformas: 
            {Array.isArray(jogo.platforms) ? 
              jogo.platforms.map(plataforma => plataforma.platform?.name || plataforma).join(', ') 
              : 'Plataformas não disponíveis'}
          </Typography>
        </div>
      ))}
    </div>
  );
};

export default Resultados;