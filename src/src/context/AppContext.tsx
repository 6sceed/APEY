import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Account, Folder, Burner } from '../types';

const STORAGE_KEYS = {
  ACCOUNTS: '@apey_accounts_data',
  FOLDERS: '@apey_folders_data',
  BURNERS: '@apey_burners_data',
};

const INITIAL_FOLDERS: Folder[] = [
  { id: 'f1', name: 'API for Apps', accountCount: 2 },
  { id: 'f2', name: 'API for Websites', accountCount: 1 },
  { id: 'f3', name: 'Other', accountCount: 0 },
];

const INITIAL_BURNERS: Burner[] = [
  {
    id: 'b1',
    gmail: 'burner.one@gmail.com',
    password: 'burner_pass_11',
    tag: '1',
    tagColor: '#22c55e',
    notes: 'Primary backup burner for API registration',
  },
  {
    id: 'b2',
    gmail: 'burner.alpha@gmail.com',
    password: 'burner_pass_22',
    tag: 'A',
    tagColor: '#22c55e',
    notes: 'Testing endpoint credentials',
  },
  {
    id: 'b3',
    gmail: 'burner.beta@gmail.com',
    password: 'burner_pass_33',
    tag: 'B',
    tagColor: '#3b82f6',
    notes: 'Secondary staging burner account',
  },
];

const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'a1',
    provider: 'Gemini',
    email: 'example@gmail.com',
    gmailUsername: 'example@gmail.com',
    gmailPassword: 'app_password_9921',
    apiKey: 'AIzaSyA88921_mock_key',
    model: 'Gemini 1.5 Flash',
    status: 'COOLDOWN',
    resetAt: '2026-09-19T21:00:00.000Z',
    expirationDate: '2026-12-31',
    folderId: 'API for Apps',
    notes: 'Primary mobile app key - Quota reset Sept 19 9pm',
    orderIndex: 0,
  },
  {
    id: 'a2',
    provider: 'OpenAI',
    email: 'work.api@domain.com',
    gmailUsername: 'work.api@gmail.com',
    gmailPassword: 'work_pass_3341',
    apiKey: 'sk-proj-881923_mock_key',
    model: 'GPT-4o',
    status: 'ACTIVE',
    expirationDate: '2027-06-15',
    folderId: 'API for Websites',
    notes: 'Production web endpoint',
    orderIndex: 1,
  },
  {
    id: 'a3',
    provider: 'Anthropic',
    email: 'personal@anthropic.dev',
    gmailUsername: 'personal.dev@gmail.com',
    gmailPassword: 'dev_password_1102',
    apiKey: 'sk-ant-api03_mock_key',
    model: 'Claude 3.5 Sonnet',
    status: 'ACTIVE',
    expirationDate: '2026-10-01',
    folderId: 'API for Apps',
    notes: 'Secondary failover',
    orderIndex: 2,
  },
];

interface AppContextType {
  accounts: Account[];
  folders: Folder[];
  burners: Burner[];
  tick: number;
  addAccount: (account: Omit<Account, 'id'>) => Promise<void>;
  updateAccount: (id: string, updatedFields: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  reorderAccount: (id: string, direction: 'up' | 'down') => Promise<void>;
  addFolder: (name: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  addBurner: (burner: Omit<Burner, 'id'>) => Promise<void>;
  updateBurner: (id: string, updatedFields: Partial<Burner>) => Promise<void>;
  deleteBurner: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [burners, setBurners] = useState<Burner[]>([]);
  const [tick, setTick] = useState<number>(0);

  useEffect(() => {
    loadData();

    const timer = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    try {
      const [accRaw, foldRaw, burnRaw] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.ACCOUNTS),
        AsyncStorage.getItem(STORAGE_KEYS.FOLDERS),
        AsyncStorage.getItem(STORAGE_KEYS.BURNERS),
      ]);

      const loadedAccounts: Account[] = accRaw ? JSON.parse(accRaw) : INITIAL_ACCOUNTS;
      const loadedFolders: Folder[] = foldRaw ? JSON.parse(foldRaw) : INITIAL_FOLDERS;
      const loadedBurners: Burner[] = burnRaw ? JSON.parse(burnRaw) : INITIAL_BURNERS;

      setAccounts(loadedAccounts);
      setFolders(loadedFolders);
      setBurners(loadedBurners);

      if (!accRaw) await AsyncStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(INITIAL_ACCOUNTS));
      if (!foldRaw) await AsyncStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(INITIAL_FOLDERS));
      if (!burnRaw) await AsyncStorage.setItem(STORAGE_KEYS.BURNERS, JSON.stringify(INITIAL_BURNERS));
    } catch (e) {
      console.error('Failed to load storage data:', e);
    }
  };

  const addAccount = async (newAcc: Omit<Account, 'id'>) => {
    const created: Account = {
      ...newAcc,
      id: 'acc_' + Date.now(),
      orderIndex: accounts.length,
    };
    const updated = [created, ...accounts];
    setAccounts(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(updated));
  };

  const updateAccount = async (id: string, updatedFields: Partial<Account>) => {
    const updated = accounts.map((a) => (a.id === id ? { ...a, ...updatedFields } : a));
    setAccounts(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(updated));
  };

  const deleteAccount = async (id: string) => {
    const updated = accounts.filter((a) => a.id !== id);
    setAccounts(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(updated));
  };

  const reorderAccount = async (id: string, direction: 'up' | 'down') => {
    const index = accounts.findIndex((a) => a.id === id);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === accounts.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...accounts];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setAccounts(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(updated));
  };

  const addFolder = async (name: string) => {
    const created: Folder = {
      id: 'fold_' + Date.now(),
      name,
      accountCount: 0,
    };
    const updated = [...folders, created];
    setFolders(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(updated));
  };

  const deleteFolder = async (id: string) => {
    const folderToDelete = folders.find((f) => f.id === id);
    const updatedFolders = folders.filter((f) => f.id !== id);

    if (folderToDelete) {
      const updatedAccounts = accounts.map((acc) =>
        acc.folderId === folderToDelete.name ? { ...acc, folderId: undefined } : acc
      );
      setAccounts(updatedAccounts);
      await AsyncStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(updatedAccounts));
    }

    setFolders(updatedFolders);
    await AsyncStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(updatedFolders));
  };

  const addBurner = async (newBurner: Omit<Burner, 'id'>) => {
    const created: Burner = {
      ...newBurner,
      id: 'burn_' + Date.now(),
    };
    const updated = [created, ...burners];
    setBurners(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.BURNERS, JSON.stringify(updated));
  };

  const updateBurner = async (id: string, updatedFields: Partial<Burner>) => {
    const updated = burners.map((b) => (b.id === id ? { ...b, ...updatedFields } : b));
    setBurners(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.BURNERS, JSON.stringify(updated));
  };

  const deleteBurner = async (id: string) => {
    const updated = burners.filter((b) => b.id !== id);
    setBurners(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.BURNERS, JSON.stringify(updated));
  };

  return (
    <AppContext.Provider
      value={{
        accounts,
        folders,
        burners,
        tick,
        addAccount,
        updateAccount,
        deleteAccount,
        reorderAccount,
        addFolder,
        deleteFolder,
        addBurner,
        updateBurner,
        deleteBurner,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useAppData() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppProvider');
  }
  return context;
}
