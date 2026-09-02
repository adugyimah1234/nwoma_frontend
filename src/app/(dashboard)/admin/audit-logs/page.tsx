'use client';

import { PageHeader } from "@/components/layout/page-header";
import { useEffect, useState } from "react";
import { getAuditLogs } from "@/services/superAdmin";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, User, Clock, Activity, Monitor } from "lucide-react";
import { format } from "date-fns";

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLogs();
    }, []);

    async function loadLogs() {
        try {
            const data = await getAuditLogs();
            setLogs(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const getActionBadge = (action: string) => {
        if (action.includes('DELETE')) return <Badge variant="destructive">{action}</Badge>;
        if (action.includes('UPDATE')) return <Badge className="bg-amber-100 text-amber-800 border-amber-200">{action}</Badge>;
        return <Badge variant="secondary">{action}</Badge>;
    };

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-8 max-w-[1600px] mx-auto w-full pb-24">
            <PageHeader
                title="Security Audit Logs"
                description="Monitor system alterations and security-sensitive actions."
                breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Admin', href: '/admin' }, { title: 'Audit Logs' }]}
            />

            <Card className="border-none shadow-sm">
                <CardHeader className="border-b bg-white dark:bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="size-5 text-primary" />
                        <div>
                            <CardTitle>Action History</CardTitle>
                            <CardDescription>The last 100 system-critical alterations.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow>
                                <TableHead className="w-[200px]">Timestamp</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Target Entity</TableHead>
                                <TableHead className="text-right">IP Address</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={5} className="text-center py-20">Loading security logs...</TableCell></TableRow>
                            ) : logs.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic">No logs recorded yet.</TableCell></TableRow>
                            ) : (
                                logs.map((log) => (
                                    <TableRow key={log.id} className="group">
                                        <TableCell className="font-mono text-xs text-slate-500">
                                            <div className="flex items-center gap-2">
                                                <Clock className="size-3" />
                                                {format(new Date(log.created_at), 'dd MMM yyyy HH:mm:ss')}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <User className="size-3 text-slate-400" />
                                                <div>
                                                    <p className="text-sm font-bold">{log.user_name || 'System'}</p>
                                                    <p className="text-[10px] text-slate-400">{log.username || 'auto'}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getActionBadge(log.action)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Activity className="size-3 text-slate-400" />
                                                <span className="text-xs font-medium uppercase">{log.target_type}</span>
                                                <span className="text-[10px] font-mono text-slate-400">ID: {log.target_id?.substring(0,8)}...</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-[10px] text-slate-400">
                                            <div className="flex items-center justify-end gap-2">
                                                <Monitor className="size-3" />
                                                {log.ip_address}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
