export type TransactionType = 'income' | 'expense';

export interface Member {
    id: string;
    name: string;
    role: 'member' | 'guest' | 'manager';
    joinedAt: string;
}

export interface Transaction {
    id: string;
    date: string;
    description: string;
    amount: number;
    type: TransactionType;
    category: string;
    memberId?: string; // Optional link to member (e.g. who paid)
    targetDate?: string; // Optional: Which month this payment is for (YYYY-MM-DD, usually first of month)
}

export interface AppState {
    members: Member[];
    transactions: Transaction[];
}
