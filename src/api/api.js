import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { url } from '../../url';

const baseURL = url
const api = axios.create({ baseURL });
 
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('clinica');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    return Promise.reject(error);
  }
);

export default api;