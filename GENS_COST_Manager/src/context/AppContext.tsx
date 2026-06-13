"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { FeeTier, Member, Transaction, AppState, AppSettings } from '@/types';
import { getAppData, saveAppData } from '@/app/actions/kv';

interface AppContextType extends AppState {
    addMember: (member: Omit<Member, 'id' | 'joinedAt'>) => void;
    deleteMember: (id: string) => void;
    updateMemberFeeTier: (id: string, feeTier: FeeTier) => void;
    addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
    updateTransaction: (id: string, transaction: Omit<Transaction, 'id'>) => void;
    deleteTransaction: (id: string) => void;
    updateSettings: (settings: AppSettings) => void;
    exportData: () => void;
    backupData: () => void;
    restoreData: (dataStr: string) => void;
    summary: {
        balance: number;
        income: number;
        expenses: number;
    }
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_SETTINGS: AppSettings = {
    monthlyFees: {
        under22: 2000,
        adult: 3000,
    },
};

const createInitialState = (): AppState => ({
    members: [],
    transactions: [],
    settings: DEFAULT_SETTINGS,
});

const under22MemberNames = ['とわ', '龍司', 'こーしゅん'];
const under22MemberNumbers = ['10', '33', '77'];

const inferFeeTier = (member: Partial<Member>): FeeTier => {
    if (member.feeTier) {
        return member.feeTier;
    }

    const name = member.name ?? '';
    const normalizedName = name.replace(/\s+/g, '');
    const hasUnder22Name = under22MemberNames.some(under22Name => normalizedName.includes(under22Name));
    const hasUnder22Number = under22MemberNumbers.some(number => name.trim().startsWith(`${number} `));

    return hasUnder22Name || hasUnder22Number ? 'under22' : 'adult';
};

const normalizeAppState = (state: Partial<AppState>): AppState => ({
    members: (state.members ?? []).map(member => ({
        ...member,
        feeTier: inferFeeTier(member),
    })),
    transactions: state.transactions ?? [],
    settings: {
        monthlyFees: {
            under22: state.settings?.monthlyFees?.under22 ?? DEFAULT_SETTINGS.monthlyFees.under22,
            adult: state.settings?.monthlyFees?.adult ?? DEFAULT_SETTINGS.monthlyFees.adult,
        },
    },
});

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [data, setData] = useState<AppState>(createInitialState());
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from Vercel KV
    useEffect(() => {
        const loadData = async () => {
            try {
                const savedData = await getAppData();
                if (savedData) {
                    setData(normalizeAppState(savedData));
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

    const updateMemberFeeTier = (id: string, feeTier: FeeTier) => {
        setData(prev => ({
            ...prev,
            members: prev.members.map(member => (
                member.id === id ? { ...member, feeTier } : member
            )),
        }));
    };

    const addTransaction = (transactionData: Omit<Transaction, 'id'>) => {
        const newTransaction: Transaction = {
            ...transactionData,
            id: crypto.randomUUID(),
        };
        setData(prev => ({ ...prev, transactions: [newTransaction, ...prev.transactions] }));
    };

    const updateTransaction = (id: string, transactionData: Omit<Transaction, 'id'>) => {
        setData(prev => ({
            ...prev,
            transactions: prev.transactions.map(transaction => (
                transaction.id === id ? { ...transactionData, id } : transaction
            )),
        }));
    };

    const deleteTransaction = (id: string) => {
        setData(prev => ({ ...prev, transactions: prev.transactions.filter(t => t.id !== id) }));
    };

    const updateSettings = (settings: AppSettings) => {
        setData(prev => ({ ...prev, settings }));
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

    const backupData = () => {
        alert("バックアップファイルのダウンロードを開始します！\n\n※お使いの端末の「ダウンロード」フォルダ等に保存されます。");
        const backupContent = JSON.stringify(data, null, 2);
        const blob = new Blob([backupContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `gens_cost_backup_full_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const restoreData = (dataStr: string) => {
        try {
            const parsed = JSON.parse(dataStr) as AppState;
            if (parsed.members && parsed.transactions) {
                setData(normalizeAppState(parsed));
                alert('✅ データの完全復元に成功しました！');
            } else {
                throw new Error("Invalid format");
            }
        } catch (e) {
            console.error(e);
            alert('❌ バックアップファイルの読み込みに失敗しました。ファイルが違うか壊れています。');
        }
    };

    return (
        <AppContext.Provider value={{
            ...data,
            addMember,
            deleteMember,
            updateMemberFeeTier,
            addTransaction,
            updateTransaction,
            deleteTransaction,
            updateSettings,
            exportData,
            backupData,
            restoreData,
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
