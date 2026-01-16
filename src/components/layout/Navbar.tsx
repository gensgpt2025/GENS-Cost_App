"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Receipt, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
    {
        name: "ダッシュボード",
        href: "/",
        icon: LayoutDashboard,
    },
    {
        name: "取引",
        href: "/transactions",
        icon: Receipt,
    },
    {
        name: "メンバー",
        href: "/members",
        icon: Users,
    },
    {
        href: "/settings",
        icon: Settings,
    },
    {
        name: "集金管理",
        href: "/collections",
        icon: Receipt, // Re-using receipt for now, or could import another icon
    },
]

export function Navbar() {
    const pathname = usePathname()

    return (
        <>
            {/* Desktop Sidebar/Header - Simple Top bar for now */}
            <header className="hidden md:flex h-16 w-full items-center justify-between border-b border-border bg-background/50 px-6 backdrop-blur-xl fixed top-0 z-50">
                <div className="flex items-center gap-2 font-bold text-xl text-primary text-glow">
                    GENS Cost
                </div>
                <nav className="flex items-center gap-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-primary",
                                pathname === item.href ? "text-primary" : "text-muted-foreground"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </header>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 border-t border-border bg-background/80 backdrop-blur-xl">
                <nav className="grid h-full grid-cols-4">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-1 transition-colors",
                                    isActive ? "text-primary" : "text-muted-foreground hover:text-primary/70"
                                )}
                            >
                                <Icon className={cn("h-6 w-6", isActive && "drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]")} />
                                <span className="text-[10px] font-medium">{item.name}</span>
                            </Link>
                        )
                    })}
                </nav>
            </div>
        </>
    )
}
