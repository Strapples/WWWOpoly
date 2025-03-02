import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:51241/api', // Adjust this if your backend runs on a different port
  headers: { 'Content-Type': 'application/json' }
});

// User login
export const login = async (email, password) => {
  const res = await API.post('/users/login', { email, password });
  return res.data;
};

// Fetch user data
export const fetchUserData = async (token) => {
  const res = await API.get('/users/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Buy a website
export const buyWebsite = async (token, websiteId) => {
  const res = await API.post(`/links/buy/${websiteId}`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export default API;