"use client"

import { useRef, useState } from "react"
import { Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useApp } from "@/context/AppContext"

export default function SettingsPage() {
    const { settings, updateSettings } = useApp()
    const under22FeeRef = useRef<HTMLInputElement>(null)
    const adultFeeRef = useRef<HTMLInputElement>(null)
    const [saved, setSaved] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const under22Fee = under22FeeRef.current?.value ?? "0"
        const adultFee = adultFeeRef.current?.value ?? "0"

        updateSettings({
            monthlyFees: {
                under22: Math.max(0, Number(under22Fee) || 0),
                adult: Math.max(0, Number(adultFee) || 0),
            },
        })
        setSaved(true)
        window.setTimeout(() => setSaved(false), 2000)
    }

    return (
        <div className="max-w-2xl space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-primary text-glow">設定</h1>
                <p className="text-muted-foreground">部費の月額を管理します</p>
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>部費設定</CardTitle>
                </CardHeader>
                <CardContent>
                    <form
                        key={`${settings.monthlyFees.under22}-${settings.monthlyFees.adult}`}
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="under22Fee">22歳以下 月額 (¥)</Label>
                                <Input
                                    id="under22Fee"
                                    ref={under22FeeRef}
                                    type="number"
                                    min="0"
                                    required
                                    defaultValue={settings.monthlyFees.under22}
                                    className="text-lg font-bold"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="adultFee">23歳以上 月額 (¥)</Label>
                                <Input
                                    id="adultFee"
                                    ref={adultFeeRef}
                                    type="number"
                                    min="0"
                                    required
                                    defaultValue={settings.monthlyFees.adult}
                                    className="text-lg font-bold"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button type="submit">
                                <Save className="mr-2 h-4 w-4" />
                                保存する
                            </Button>
                            {saved && (
                                <span className="text-sm text-emerald-500">保存しました</span>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
