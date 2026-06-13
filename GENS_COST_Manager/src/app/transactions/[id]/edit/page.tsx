"use client"

import { FormEvent } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Calendar, ChevronLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useApp } from "@/context/AppContext"
import { TransactionType } from "@/types"

const incomeCategories = ['部費', '参加費', 'その他収入']
const expenseCategories = ['コート代', '備品代', '大会参加費', 'その他経費']

export default function EditTransactionPage() {
    const router = useRouter()
    const params = useParams<{ id: string }>()
    const { transactions, updateTransaction, members } = useApp()
    const transaction = transactions.find(t => t.id === params.id)

    if (!transaction) {
        return (
            <div className="max-w-md mx-auto space-y-6">
                <div className="flex items-center gap-2">
                    <Link href="/transactions">
                        <Button variant="ghost" size="icon">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-xl font-bold text-primary">取引を編集</h1>
                </div>
                <Card className="glass-card">
                    <CardContent className="p-6 text-muted-foreground">
                        取引が見つかりません。
                    </CardContent>
                </Card>
            </div>
        )
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const type = formData.get("type") as TransactionType
        const category = String(formData.get("category") || "")
        const memberId = String(formData.get("memberId") || "")
        const targetMonth = String(formData.get("targetMonth") || "")
        const isClubFee = type === "income" && category === "部費"

        if (isClubFee && !memberId) {
            alert("部費の取引にはメンバーを選択してください。")
            return
        }

        if (isClubFee) {
            const duplicateClubFee = transactions.some(t => {
                const dateToCheck = t.targetDate || t.date

                return (
                    t.id !== transaction.id &&
                    t.type === "income" &&
                    t.category === "部費" &&
                    t.memberId === memberId &&
                    dateToCheck.startsWith(targetMonth)
                )
            })

            if (duplicateClubFee) {
                alert("同じメンバーの同じ対象月に、すでに部費が登録されています。")
                return
            }
        }

        updateTransaction(transaction.id, {
            date: String(formData.get("date") || transaction.date),
            type,
            category,
            description: String(formData.get("description") || ""),
            amount: Number(formData.get("amount")) || 0,
            memberId: memberId || undefined,
            targetDate: isClubFee ? `${targetMonth}-01` : undefined,
        })

        router.push("/transactions")
        router.refresh()
    }

    const defaultTargetMonth = (transaction.targetDate || transaction.date).slice(0, 7)

    return (
        <div className="max-w-md mx-auto space-y-6">
            <div className="flex items-center gap-2">
                <Link href="/transactions">
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-xl font-bold text-primary">取引を編集</h1>
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>取引情報の修正</CardTitle>
                </CardHeader>
                <CardContent>
                    <form key={transaction.id} onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">取引タイプ</Label>
                            <select
                                id="type"
                                name="type"
                                defaultValue={transaction.type}
                                className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            >
                                <option value="income">収入</option>
                                <option value="expense">支出</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">カテゴリ</Label>
                            <select
                                id="category"
                                name="category"
                                defaultValue={transaction.category}
                                className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            >
                                <optgroup label="収入">
                                    {incomeCategories.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </optgroup>
                                <optgroup label="支出">
                                    {expenseCategories.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </optgroup>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date">日付</Label>
                            <Input id="date" name="date" type="date" required defaultValue={transaction.date} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amount">金額 (¥)</Label>
                            <Input id="amount" name="amount" type="number" min="0" required defaultValue={transaction.amount} className="text-lg font-bold" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="memberId">メンバー</Label>
                            <select
                                id="memberId"
                                name="memberId"
                                defaultValue={transaction.memberId ?? ""}
                                className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            >
                                <option value="">選択なし</option>
                                {members.map(member => (
                                    <option key={member.id} value={member.id}>{member.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="targetMonth">対象月（部費の場合）</Label>
                            <div className="flex gap-2">
                                <Input id="targetMonth" name="targetMonth" type="month" defaultValue={defaultTargetMonth} />
                                <Button type="button" variant="outline" size="icon" onClick={() => document.getElementById("targetMonth") instanceof HTMLInputElement && (document.getElementById("targetMonth") as HTMLInputElement).showPicker()}>
                                    <Calendar className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">詳細/メモ</Label>
                            <Input id="description" name="description" defaultValue={transaction.description} />
                        </div>

                        <Button type="submit" className="w-full">
                            <Save className="mr-2 h-4 w-4" />
                            保存する
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
