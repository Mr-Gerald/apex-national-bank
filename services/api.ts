import { User } from '../types';

// Determine base API URL based on the hostname.
// This allows the app to work seamlessly in both local development and production on Vercel.
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_URL = isLocalhost ? 'http://localhost:3001' : 'https://apex-backend.onrender.com';
const BASE_URL = `${API_URL}/api`;


const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error: ${response.status} ${response.statusText}`, errorText);
        try {
            const errorJson = JSON.parse(errorText);
            throw new Error(errorJson.message || `API Error: ${response.statusText}`);
        } catch {
             throw new Error(errorText || `API Error: ${response.statusText}`);
        }
    }
    const text = await response.text();
    if (!text) {
        return; // For 204 No Content responses
    }
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
};

export const login = async (username: string, password_input: string, ipAddress: string, deviceAgent: string): Promise<User> => {
    const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: username, password: password_input, ipAddress, deviceAgent }),
    });
    return handleResponse(response);
};


export const fetchAllUsers = async (): Promise<User[]> => {
    try {
        const response = await fetch(`${BASE_URL}/users`);
        const data = await handleResponse(response);
        return Array.isArray(data) ? data : [];
    } catch (e: any) {
        console.error("API Error: Failed to fetch users.", e.message);
        return [];
    }
};

export const saveAllUsers = async (users: User[]): Promise<void> => {
     try {
        const response = await fetch(`${BASE_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(users),
        });
        await handleResponse(response);
    } catch (e: any) {
        console.error("API Error: Failed to save users.", e.message);
        throw e;
    }
};

export const fetchDbLog = async (): Promise<any[]> => {
    try {
        const response = await fetch(`${BASE_URL}/dblog`);
        const data = await handleResponse(response);
        return Array.isArray(data) ? data : [];
    } catch (e: any) {
        console.error("API Error: Failed to fetch db log.", e.message);
        return [];
    }
}

export const saveDbLog = async (log: any[]): Promise<void> => {
     try {
        console.log('Logging to backend:', `${BASE_URL}/dblog`);
        const response = await fetch(`${BASE_URL}/dblog`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(log),
        });
        await handleResponse(response);
    } catch (e: any) {
        console.error("API Error: Failed to save db log.", e.message);
        throw e;
    }
}

// Client-side session management remains local
export const fetchCurrentUserId = async (): Promise<string | null> => localStorage.getItem('apexBankCurrentUserId');
export const saveCurrentUserId = async (userId: string): Promise<void> => localStorage.setItem('apexBankCurrentUserId', userId);
export const clearCurrentUserId = async (): Promise<void> => localStorage.removeItem('apexBankCurrentUserId');

export const fetchAdminSession = async (): Promise<boolean> => sessionStorage.getItem('isAdmin') === 'true';
export const saveAdminSession = async (): Promise<void> => sessionStorage.setItem('isAdmin', 'true');
export const clearAdminSession = async (): Promise<void> => sessionStorage.removeItem('isAdmin');