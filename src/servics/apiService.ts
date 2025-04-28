import axios from 'axios';
import { environment } from '../environments/environment';

const apiClient = axios.create({
  baseURL: environment.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchData = async (endpoint: string, options = {}) => {
  const response = await apiClient.get(endpoint, options);
  return response.data;
};

export const postData = async (endpoint: string, data: any, options = {}) => {
  const response = await apiClient.post(endpoint, data, options);
  return response.data;
};

export const putData = async (endpoint: string, data: any, options = {}) => {
  const response = await apiClient.put(endpoint, data, options);
  return response.data;
};

export const deleteData = async (endpoint: string, options = {}) => {
  const response = await apiClient.delete(endpoint, options);
  return response.data;
};


// Add other HTTP methods (PUT, DELETE) as needed