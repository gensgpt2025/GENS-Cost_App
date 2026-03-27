"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Member, Transaction, AppState } from '@/types';
import { getAppData, saveAppData } from '@/app/actions/kv';

interface AppContextType extends AppState {
    addMember: (member: Omit<Member, 'id' | 'joinedAt'>) => void;
    deleteMember: (id: string) => void;
    addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
    deleteTransaction: (id: string) => void;
    exportData: () => void;
    summary: {
        balance: number;
        income: number;
        expenses: number;
    }
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'gens-cost-data';

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [data, setData] = useState<AppState>({
        members: [],
        transactions: []
    });
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from Vercel KV
    useEffect(() => {
        const loadData = async () => {
            try {
                const savedData = await getAppData();
                if (savedData) {
                    setData(savedData);
                }
            } catch (e) {
                console.error("Failed to load data from KV", e);
            } finally {
                setIsLoaded(true);
            }
        };
        loadData();
    }, []);

    // Save to Vercel KV
    useEffect(() => {
        if (isLoaded) {
            saveAppData(data).catch(e => console.error("Failed to save data to KV", e));
        }
    }, [data, isLoaded]);

    const addMember = (memberData: Omit<Member, 'id' | 'joinedAt'>) => {
        const newMember: Member = {
            ...memberData,
            id: crypto.randomUUID(),
            joinedAt: new Date().toISOString(),
        };
        setData(prev => ({ ...prev, members: [...prev.members, newMember] }));
    };

    const deleteMember = (id: string) => {
        setData(prev => ({ ...prev, members: prev.members.filter(m => m.id !== id) }));
    };

    const addTransaction = (transactionData: Omit<Transaction, 'id'>) => {
        const newTransaction: Transaction = {
            ...transactionData,
            id: crypto.randomUUID(),
        };
        setData(prev => ({ ...prev, transactions: [newTransaction, ...prev.transactions] }));
    };

    const deleteTransaction = (id: string) => {
        setData(prev => ({ ...prev, transactions: prev.transactions.filter(t => t.id !== id) }));
    };

    // Derived state
    const summary = {
        income: data.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
        expenses: data.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
        get balance() { return this.income - this.expenses }
    };

    const exportData = () => {
        // Basic CSV export for transactions
        const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'MemberID'];
        const rows = data.transactions.map(t => [
            t.date,
            t.type,
            t.category,
            `"${t.description}"`, // Quote description to handle commas
            t.amount,
            t.memberId ? (data.members.find(m => m.id === t.memberId)?.name || t.memberId) : ''
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `gens_cost_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AppContext.Provider value={{
            ...data,
            addMember,
            deleteMember,
            addTransaction,
            deleteTransaction,
            exportData,
            summary
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}
