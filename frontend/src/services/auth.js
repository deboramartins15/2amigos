export const TOKEN_KEY = "@2amigos-Token";
export const USER_ID = "@2amigos-UserId";

export const isAuthenticated = () => localStorage.getItem(TOKEN_KEY) !== null;

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const getUserId = () => localStorage.getItem(USER_ID);

export const login = ({ token }, id) => {  
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_ID, id);
};

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_ID);
};