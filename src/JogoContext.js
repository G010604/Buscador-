import React, { createContext, useState, useContext } from 'react';

const JogoContext = createContext();

export const useJogoContext = () => useContext(JogoContext);

export const JogoProvider = ({ children }) => {
  const [nomeJogo, setNomeJogo] = useState('');
  const [erro, setErro] = useState('');
  const [resultados, setResultados] = useState([]);
  const [token, setToken] = useState('');

  const values = {
    nomeJogo,
    setNomeJogo,
    erro,
    setErro,
    resultados,
    setResultados,
    token,
    setToken
  };

  return <JogoContext.Provider value={values}>{children}</JogoContext.Provider>;
};