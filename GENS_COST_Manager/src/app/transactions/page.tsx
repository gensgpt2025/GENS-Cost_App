"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useApp } from "@/context/AppContext"
import { Pencil, Trash2, Plus, Wallet } from "lucide-react"
import Link from "next/link"

export default function TransactionsPage() {
    const { transactions, deleteTransaction, summary, members } = useApp()

    const handleDelete = (id: string) => {
        const confirmed = window.confirm("この取引を削除しますか？\n\n削除すると、集金管理の支払い済み表示にも反映されます。")
        if (confirmed) {
            deleteTransaction(id)
        }
    }

    // Sort by date desc
    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold text-primary text-glow">Transactions</h1>
                    <p className="text-muted-foreground">収支履歴</p>
                </div>
                <Link href="/transactions/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        新規取引
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">現在残高</CardTitle>
                    <Wallet className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-primary text-glow">¥{summary.balance.toLocaleString()}</div>
                </CardContent>
            </Card>

            <Card className="glass-card">
                <CardContent className="p-0">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Category</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Description</th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Amount</th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Action</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {sortedTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-muted-foreground">取引履歴がありません</td>
                                    </tr>
                                ) : (
                                    sortedTransactions.map((t) => (
                                        <tr key={t.id} className="border-b border-white/5 transition-colors hover:bg-muted/50">
                                            <td className="p-4 align-middle">{t.date}</td>
                                            <td className="p-4 align-middle">
                                                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${t.type === 'income'
                                                    ? 'border-transparent bg-emerald-500/10 text-emerald-500'
                                                    : 'border-transparent bg-rose-500/10 text-rose-500'
                                                    }`}>
                                                    {t.category}
                                                </span>
                                            </td>
                                            <td className="p-4 align-middle">
                                                <div className="flex flex-col">
                                                    <span>{t.description}</span>
                                                    {t.memberId && (
                                                        <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full w-fit mt-1">
                                                            {members.find(m => m.id === t.memberId)?.name}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className={`p-4 align-middle text-right font-medium ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {t.type === 'income' ? '+' : '-'}¥{t.amount.toLocaleString()}
                                            </td>
                                            <td className="p-4 align-middle text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Link href={`/transactions/${t.id}/edit`}>
                                                        <Button variant="ghost" size="icon" className="hover:text-primary" title="編集">
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)} className="hover:text-destructive" title="削除">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
