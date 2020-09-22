import api from './api'

export const TOKEN_KEY = "@2amigos-Token";
export const USER_ID = "@2amigos-UserId";
export const USER_MATRIZ = "@2amigos-Matriz";

export const isAuthenticated = () => localStorage.getItem(TOKEN_KEY) !== null;

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const getUserId = () => localStorage.getItem(USER_ID);

export const isMatriz = () => localStorage.getItem(USER_MATRIZ) === 'true' ? true : false

export const isTransportadora = async () => {
  try {
    const loja = await api.get(`/loja/${getUserId()}`)

    return loja.data.transportadora
  } catch (error) {
    return error
  }
}


export const login = ({ token }, id, matriz) => {  
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_ID, id);
  localStorage.setItem(USER_MATRIZ, matriz);
};

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_ID);
  localStorage.removeItem(USER_MATRIZ);
};