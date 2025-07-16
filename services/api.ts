
import { User } from '../types';

const USERS_STORAGE_KEY = 'apexBankUsers';
const DBLOG_STORAGE_KEY = 'apexBankDbLog';

export const fetchAllUsers = async (): Promise<User[]> => {
    try {
        const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
        return usersJson ? JSON.parse(usersJson) : [];
    } catch (e: any) {
        console.error("LocalStorage Error: Failed to fetch users.", e.message);
        // In case of parsing error, return empty array to prevent app crash
        return [];
    }
};

export const saveAllUsers = async (users: User[]): Promise<void> => {
    try {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e: any) {
        console.error("LocalStorage Error: Failed to save users.", e.message);
        throw e; // Re-throw so service layer can handle it
    }
};

export const fetchDbLog = async (): Promise<any[]> => {
     try {
        const logJson = localStorage.getItem(DBLOG_STORAGE_KEY);
        return logJson ? JSON.parse(logJson) : [];
    } catch (e: any) {
        console.error("LocalStorage Error: Failed to fetch db log.", e.message);
        return [];
    }
}

export const saveDbLog = async (log: any[]): Promise<void> => {
     try {
        localStorage.setItem(DBLOG_STORAGE_KEY, JSON.stringify(log));
    } catch (e: any) {
        console.error("LocalStorage Error: Failed to save db log.", e.message);
        throw e;
    }
}

// Client-side session management remains local and unchanged
export const fetchCurrentUserId = async (): Promise<string | null> => localStorage.getItem('apexBankCurrentUserId');
export const saveCurrentUserId = async (userId: string): Promise<void> => localStorage.setItem('apexBankCurrentUserId', userId);
export const clearCurrentUserId = async (): Promise<void> => localStorage.removeItem('apexBankCurrentUserId');

export const fetchAdminSession = async (): Promise<boolean> => sessionStorage.getItem('isAdmin') === 'true';
export const saveAdminSession = async (): Promise<void> => sessionStorage.setItem('isAdmin', 'true');
export const clearAdminSession = async (): Promise<void> => sessionStorage.removeItem('isAdmin');