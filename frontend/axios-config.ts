// ...existing code...
import axios from 'axios';

// Axios Interceptor Instance
const AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  headers: { Accept: 'application/json' },
});

export default AxiosInstance;
