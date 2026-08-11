'use client';

import { DataTableColumn } from '@/components/ui/data-table';
import { Student } from '@/types/student';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreVertical, Eye, FileText, ShieldAlert } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export function useStudentColumns(): DataTableColumn<Student>[] {
    const router = useRouter();

    return [
        {
            key: 'name',
            header: 'Student Identity',
            cell: (row) => (
                <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary font-black text-xs shadow-sm">
                        {row.first_name[0]}{row.last_name[0]}
                    </div>
                    <div>
                        <div className="font-black text-sm tracking-tight uppercase">{row.first_name} {row.last_name}</div>
                        <div className="text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-60">ID: {String(row.id).substring(0,8).toUpperCase()}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'class_id',
            header: 'Classification',
            cell: (row) => (
                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-none bg-muted/50 px-3 py-1">
                    {(row as any).class_name || 'Unassigned'}
                </Badge>
            )
        },
        {
            key: 'category',
            header: 'Personnel Type',
            cell: (row) => (
                <Badge className={cn(
                    "text-[9px] font-black uppercase tracking-widest border-none px-3 py-1 shadow-sm",
                    row.category === 'SVC' ? "bg-blue-500 text-white" :
                    row.category === 'MOD' ? "bg-amber-500 text-white" :
                    "bg-slate-500 text-white"
                )}>
                    {row.category || 'CIV'}
                </Badge>
            )
        },
        {
            key: 'status',
            header: 'Status',
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <div className={cn("size-2 rounded-full", row.status === 'active' ? "bg-emerald-500 animate-pulse" : "bg-muted")} />
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{row.status}</span>
                </div>
            )
        },
        {
            key: 'actions',
            header: '',
            className: 'text-right pr-6',
            cell: (row) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/5">
                            <MoreVertical className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-2xl border-none shadow-2xl p-2">
                        <DropdownMenuItem onClick={() => router.push(`/students/${row.id}`)} className="rounded-xl h-11 font-bold">
                            <Eye className="mr-3 size-4 text-primary" /> View Intelligence
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-xl h-11 font-bold">
                            <FileText className="mr-3 size-4 text-primary" /> Academic Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-2" />
                        <DropdownMenuItem className="rounded-xl h-11 font-bold text-destructive focus:text-destructive">
                            <ShieldAlert className="mr-3 size-4" /> Disciplinary Action
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ];
}
