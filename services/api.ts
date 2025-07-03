import { User } from '../types';

// Determine base API URL from env; fallback to localhost for dev
const BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`;

// Utility to handle responses consistently
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
  if (!text) return; // For 204 No Content responses

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

// --- User Endpoints ---

export const fetchAllUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch(`${BASE_URL}/users`);
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  } catch (e: any) {
    console.error('API Error: Failed to fetch users.', e.message);
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
    console.error('API Error: Failed to save users.', e.message);
    throw e;
  }
};

// --- Log Endpoints ---

export const fetchDbLog = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${BASE_URL}/dblog`);
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  } catch (e: any) {
    console.error('API Error: Failed to fetch db log.', e.message);
    return [];
  }
};

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
    console.error('API Error: Failed to save db log.', e.message);
    throw e;
  }
};

// --- Local Session Utilities ---

export const fetchCurrentUserId = async (): Promise<string | null> =>
  localStorage.getItem('apexBankCurrentUserId');

export const saveCurrentUserId = async (userId: string): Promise<void> =>
  localStorage.setItem('apexBankCurrentUserId', userId);

export const clearCurrentUserId = async (): Promise<void> =>
  localStorage.removeItem('apexBankCurrentUserId');

export const fetchAdminSession = async (): Promise<boolean> =>
  sessionStorage.getItem('isAdmin') === 'true';

export const saveAdminSession = async (): Promise<void> =>
  sessionStorage.setItem('isAdmin', 'true');

export const clearAdminSession = async (): Promise<void> =>
  sessionStorage.removeItem('isAdmin');