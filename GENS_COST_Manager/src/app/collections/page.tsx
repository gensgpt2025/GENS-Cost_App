"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useApp } from "@/context/AppContext"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"

export default function CollectionsPage() {
    const { members, transactions } = useApp()
    const [year, setYear] = useState(new Date().getFullYear())

    // Generate months for the header (4月 start for Japanese fiscal year usually, but 1-12 is easier)
    // Let's do 1-12 for simplicity
    const months = Array.from({ length: 12 }, (_, i) => i + 1)

    // Helper to check payment status
    const getPaymentStatus = (memberId: string, targetMonth: number) => {
        const targetDateStr = `${year}-${String(targetMonth).padStart(2, '0')}`

        // Find transaction for this member + target month + club fee
        const payment = transactions.find(t => {
            if (t.memberId !== memberId) return false;
            if (t.category !== '部費') return false;

            // Check targetDate first, fallback to transaction date
            const dateToCheck = t.targetDate || t.date;
            return dateToCheck.startsWith(targetDateStr);
        });

        return payment;
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-primary text-glow">Collections</h1>
                    <p className="text-muted-foreground">部費集金状況</p>
                </div>
                <div className="flex items-center gap-4 bg-card border border-border rounded-lg p-1">
                    <Button variant="ghost" size="icon" onClick={() => setYear(y => y - 1)}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="font-bold text-lg min-w-[80px] text-center">{year}年</span>
                    <Button variant="ghost" size="icon" onClick={() => setYear(y => y + 1)}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <Card className="glass-card overflow-hidden">
                <CardContent className="p-0">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-muted/50">
                                    <th className="h-12 px-4 text-left align-middle font-medium sticky left-0 bg-background/95 backdrop-blur z-10 border-r border-white/10">Member</th>
                                    {months.map(m => (
                                        <th key={m} className="h-12 w-20 px-2 text-center align-middle font-medium border-r border-white/10 last:border-0">{m}月</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {members.length === 0 ? (
                                    <tr>
                                        <td colSpan={13} className="p-8 text-center text-muted-foreground">メンバーが登録されていません</td>
                                    </tr>
                                ) : (
                                    members.map((member) => (
                                        <tr key={member.id} className="border-b border-white/5 last:border-0 hover:bg-muted/30 transition-colors">
                                            <td className="p-4 align-middle font-medium sticky left-0 bg-background/95 backdrop-blur z-10 border-r border-white/10">
                                                {member.name}
                                            </td>
                                            {months.map(m => {
                                                const payment = getPaymentStatus(member.id, m);
                                                const isPaid = !!payment;
                                                const paidDate = payment ? new Date(payment.date).getDate() : null; // Date of payment

                                                return (
                                                    <td key={m} className="p-2 align-middle text-center border-r border-white/10 last:border-0">
                                                        {isPaid ? (
                                                            <div className="flex flex-col items-center justify-center">
                                                                <div className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mb-1">
                                                                    <Check className="h-5 w-5" />
                                                                </div>
                                                                <span className="text-[10px] text-muted-foreground">{new Date(payment.date).getMonth() + 1}/{paidDate}</span>
                                                            </div>
                                                        ) : (
                                                            <div className="h-8 w-8 mx-auto rounded-full bg-white/5 flex items-center justify-center text-white/10">
                                                                -
                                                            </div>
                                                        )}
                                                    </td>
                                                )
                                            })}
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
