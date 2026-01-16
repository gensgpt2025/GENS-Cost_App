"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useApp } from "@/context/AppContext"
import { ChevronLeft, Calendar } from "lucide-react"
import Link from "next/link"

export default function NewTransactionPage() {
    const router = useRouter()
    const { addTransaction, members } = useApp()
    const [loading, setLoading] = useState(false)
    const dateInputRef = useRef<HTMLInputElement>(null)
    const targetDateInputRef = useRef<HTMLInputElement>(null)

    const [formData, setFormData] = useState({
        amount: '',
        type: 'income',
        category: '部費',
        description: '',
        memberId: '',
        targetDate: new Date().toISOString().slice(0, 7), // YYYY-MM
        // Use local date for default
        date: (() => {
            const d = new Date();
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        })()
    })

    // Simple hardcoded categories for now
    const categories = formData.type === 'income'
        ? ['部費', '参加費', 'その他収入']
        : ['コート代', '備品代', '大会参加費', 'その他経費'];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Simulate small delay
        setTimeout(() => {
            addTransaction({
                amount: Number(formData.amount),
                type: formData.type as 'income' | 'expense',
                category: formData.category,
                description: formData.description,
                memberId: formData.memberId || undefined,
                targetDate: formData.category === '部費' ? `${formData.targetDate}-01` : undefined, // Save as YYYY-MM-01
                date: formData.date
            })
            router.push('/')
            router.refresh()
        }, 500)
    }

    return (
        <div className="max-w-md mx-auto space-y-6">
            <div className="flex items-center gap-2">
                <Link href="/">
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-xl font-bold text-primary">取引を追加</h1>
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>取引情報の入力</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>取引タイプ</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <div
                                    className={`cursor-pointer rounded-md border p-3 text-center transition-all ${formData.type === 'income'
                                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                                        : 'border-input hover:bg-accent'
                                        }`}
                                    onClick={() => setFormData({ ...formData, type: 'income', category: '部費' })}
                                >
                                    収入
                                </div>
                                <div
                                    className={`cursor-pointer rounded-md border p-3 text-center transition-all ${formData.type === 'expense'
                                        ? 'border-rose-500 bg-rose-500/10 text-rose-500'
                                        : 'border-input hover:bg-accent'
                                        }`}
                                    onClick={() => setFormData({ ...formData, type: 'expense', category: 'コート代' })}
                                >
                                    支出
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date">日付</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="date"
                                    ref={dateInputRef}
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => dateInputRef.current?.showPicker()}
                                >
                                    <Calendar className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amount">金額 (¥)</Label>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="0"
                                required
                                min="0"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="text-lg font-bold"
                            />
                        </div>

                        {formData.type === 'income' && (
                            <div className="space-y-2">
                                <Label htmlFor="member">メンバー（任意）</Label>
                                <select
                                    id="member"
                                    className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    value={formData.memberId}
                                    onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                                >
                                    <option value="">選択してください</option>
                                    {members.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {formData.category === '部費' && (
                            <div className="space-y-2">
                                <Label htmlFor="targetDate">対象月</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="targetDate"
                                        ref={targetDateInputRef}
                                        type="month"
                                        value={formData.targetDate}
                                        onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => targetDateInputRef.current?.showPicker()}
                                    >
                                        <Calendar className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">何月分の部費かを選択してください</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="category">カテゴリ</Label>
                            <select
                                id="category"
                                className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                {categories.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">詳細/メモ</Label>
                            <Input
                                id="description"
                                placeholder="例: 5月分"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? '保存中...' : '保存する'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
