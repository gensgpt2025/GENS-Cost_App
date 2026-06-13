"use client"
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { DatabaseBackup, UploadCloud } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function BackupRestore() {
    const { backupData, restoreData } = useApp();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            if (content) {
                // 確認ダイアログを出す
                const confirmed = window.confirm("⚠️ 現在登録されているすべてのデータは上書きされ消去されます！\n\n本当にバックアップファイルのデータで復元（インポート）してもよろしいですか？");
                if (confirmed) {
                    restoreData(content);
                }
            }
        };
        reader.readAsText(file);
        // 入力のリセット（同じファイルを再度選べるようにする）
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="flex items-center gap-2 mt-4 md:mt-0">
            {/* バックアップボタン */}
            <Button 
                variant="outline" 
                size="sm" 
                onClick={backupData} 
                className="text-sky-400 border-sky-400/30 hover:bg-sky-400/10 hover:text-sky-300"
            >
                <DatabaseBackup className="w-4 h-4 mr-2" />
                システムバックアップ
            </Button>

            {/* 見えないファイル選択用のInput */}
            <input
                type="file"
                accept=".json"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
            />

            {/* 復元ボタン（実際にはInput要素をClickさせる） */}
            <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fileInputRef.current?.click()} 
                className="text-amber-400 border-amber-400/30 hover:bg-amber-400/10 hover:text-amber-300"
            >
                <UploadCloud className="w-4 h-4 mr-2" />
                データの復元
            </Button>
        </div>
    );
}
