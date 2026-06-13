"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useApp } from "@/context/AppContext"
import { UserPlus, Trash2, User } from "lucide-react"
import { FeeTier } from "@/types"

export default function MembersPage() {
    const { members, addMember, deleteMember, updateMemberFeeTier } = useApp()
    const [newName, setNewName] = useState("")
    const [newFeeTier, setNewFeeTier] = useState<FeeTier>("adult")

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newName.trim()) return

        addMember({
            name: newName,
            role: 'member',
            feeTier: newFeeTier
        })
        setNewName("")
        setNewFeeTier("adult")
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-primary text-glow">Members</h1>
                <p className="text-muted-foreground">チームメンバーの管理</p>
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>新規メンバー登録</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAdd} className="grid gap-4 md:grid-cols-[1fr_180px_auto]">
                        <Input
                            placeholder="メンバー名 (例: 山田 太郎)"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                        />
                        <select
                            className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            value={newFeeTier}
                            onChange={(e) => setNewFeeTier(e.target.value as FeeTier)}
                        >
                            <option value="adult">23歳以上</option>
                            <option value="under22">22歳以下</option>
                        </select>
                        <Button type="submit">
                            <UserPlus className="mr-2 h-4 w-4" />
                            追加
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {members.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-muted-foreground">
                        メンバーが登録されていません
                    </div>
                ) : (
                    members.map((member) => (
                        <Card key={member.id} className="relative overflow-hidden transition-all hover:bg-accent/5">
                            <CardContent className="space-y-4 p-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{member.name}</h3>
                                        <p className="text-xs text-muted-foreground">Joined: {new Date(member.joinedAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <select
                                        className="flex h-9 flex-1 rounded-md border border-input bg-card px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        value={member.feeTier}
                                        onChange={(e) => updateMemberFeeTier(member.id, e.target.value as FeeTier)}
                                    >
                                        <option value="adult">23歳以上</option>
                                        <option value="under22">22歳以下</option>
                                    </select>
                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => deleteMember(member.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
