import { useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const useWorkerData = () => {
    const { getAuthHeader } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async (endpoint) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API}${endpoint}`, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (err) {
            const message = err.response?.data?.detail || "Une erreur est survenue";
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [getAuthHeader]);

    const postData = useCallback(async (endpoint, data, isMultipart = false) => {
        setLoading(true);
        setError(null);
        try {
            const authHeader = getAuthHeader();
            const headers = { ...authHeader };
            
            if (isMultipart) {
                // Pour multipart/form-data avec Axios, il vaut mieux laisser Axios gérer le Boundary
                // en ne mettant pas explicitement le Content-Type ou en utilisant FormData
                delete headers['Content-Type'];
            }

            const response = await axios.post(`${API}${endpoint}`, data, { headers });
            return response.data;
        } catch (err) {
            const message = err.response?.data?.detail || "Une erreur est survenue";
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [getAuthHeader]);

    const putData = useCallback(async (endpoint, data) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.put(`${API}${endpoint}`, data, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (err) {
            const message = err.response?.data?.detail || "Une erreur est survenue";
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [getAuthHeader]);

    const deleteData = useCallback(async (endpoint) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.delete(`${API}${endpoint}`, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (err) {
            const message = err.response?.data?.detail || "Une erreur est survenue";
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [getAuthHeader]);

    return { loading, error, fetchData, postData, putData, deleteData };
};
