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
    const { addTransaction, members, transactions, settings } = useApp()
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
        ? ['部費', '参加費', 'コート代', 'その他収入']
        : ['コート代', '備品代', '大会参加費', 'その他経費'];

    const isClubFee = formData.type === 'income' && formData.category === '部費'
    const selectedMember = members.find(member => member.id === formData.memberId)
    const receivedAmount = Number(formData.amount) || 0
    const monthlyFee = isClubFee && selectedMember ? settings.monthlyFees[selectedMember.feeTier] : 0
    const isExactClubFeeAmount = isClubFee && monthlyFee > 0 && receivedAmount > 0 && receivedAmount % monthlyFee === 0
    const monthCount = isExactClubFeeAmount ? receivedAmount / monthlyFee : 0

    const addMonths = (yearMonth: string, monthsToAdd: number) => {
        const [year, month] = yearMonth.split('-').map(Number)
        const date = new Date(year, month - 1 + monthsToAdd, 1)
        const nextYear = date.getFullYear()
        const nextMonth = String(date.getMonth() + 1).padStart(2, '0')
        return `${nextYear}-${nextMonth}`
    }

    const formatMonthLabel = (yearMonth: string) => {
        const [year, month] = yearMonth.split('-').map(Number)
        return `${year}年${month}月分`
    }

    const targetMonths = Array.from({ length: monthCount }, (_, index) => addMonths(formData.targetDate, index))

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (isClubFee && !selectedMember) {
            alert('部費を登録するメンバーを選択してください。')
            return
        }

        if (isClubFee && monthlyFee <= 0) {
            alert('設定ページで部費の月額を設定してください。')
            return
        }

        if (isClubFee && !isExactClubFeeAmount) {
            alert(`受取金額が月額部費で割り切れません。月額 ¥${monthlyFee.toLocaleString()} に対して、受取金額は ¥${receivedAmount.toLocaleString()} です。`)
            return
        }

        const duplicateClubFee = isClubFee && formData.memberId && transactions.some(t => {
            const dateToCheck = t.targetDate || t.date

            return (
                t.type === 'income' &&
                t.category === '部費' &&
                t.memberId === formData.memberId &&
                targetMonths.some(targetMonth => dateToCheck.startsWith(targetMonth))
            )
        })

        if (duplicateClubFee) {
            const memberName = members.find(m => m.id === formData.memberId)?.name || '選択したメンバー'
            alert(`${memberName}さんの対象月に、すでに登録済みの部費があります。`)
            return
        }

        setLoading(true)

        // Simulate small delay
        setTimeout(() => {
            if (isClubFee) {
                targetMonths.forEach(targetMonth => {
                    const monthLabel = formatMonthLabel(targetMonth)

                    addTransaction({
                        amount: monthlyFee,
                        type: 'income',
                        category: '部費',
                        description: formData.description ? `${formData.description} (${monthLabel})` : monthLabel,
                        memberId: formData.memberId || undefined,
                        targetDate: `${targetMonth}-01`,
                        date: formData.date
                    })
                })
            } else {
                addTransaction({
                    amount: Number(formData.amount),
                    type: formData.type as 'income' | 'expense',
                    category: formData.category,
                    description: formData.description,
                    memberId: formData.memberId || undefined,
                    date: formData.date
                })
            }
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
                            <Label htmlFor="amount">{isClubFee ? '受取金額 (¥)' : '金額 (¥)'}</Label>
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
                            <>
                                {selectedMember && (
                                    <div className="rounded-md border border-primary/20 bg-primary/5 p-3 text-sm">
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-muted-foreground">適用する月額</span>
                                            <span className="font-bold text-primary">¥{monthlyFee.toLocaleString()}</span>
                                        </div>
                                        <div className="mt-1 text-xs text-muted-foreground">
                                            {selectedMember.feeTier === 'under22' ? '22歳以下' : '23歳以上'}の部費設定を使用します
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="targetDate">開始月</Label>
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
                                    <p className="text-xs text-muted-foreground">何月分から登録するかを選択してください</p>
                                </div>

                                {selectedMember && receivedAmount > 0 && (
                                    <div className="space-y-1 text-xs">
                                        {isExactClubFeeAmount ? (
                                            <>
                                                <p className="text-muted-foreground">
                                                    {targetMonths.map(formatMonthLabel).join('、')}を登録します
                                                </p>
                                                <p className="text-primary">
                                                    判定: {monthCount}か月分（¥{monthlyFee.toLocaleString()} × {monthCount}か月）
                                                </p>
                                            </>
                                        ) : (
                                            <p className="text-rose-500">
                                                受取金額が月額 ¥{monthlyFee.toLocaleString()} で割り切れません
                                            </p>
                                        )}
                                    </div>
                                )}
                            </>
                        )}

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
