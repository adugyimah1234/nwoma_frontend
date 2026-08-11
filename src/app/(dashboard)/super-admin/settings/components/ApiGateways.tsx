'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Copy, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface ApiGatewaysProps {
  apiToken: string | null;
  onRegenerate: () => void;
}

export function ApiGateways({ apiToken, onRegenerate }: ApiGatewaysProps) {
  const [tokenVisible, setTokenVisible] = useState(false);

  const copyToken = () => {
    if (apiToken) {
      navigator.clipboard.writeText(apiToken);
      toast.success('API Token copied to clipboard');
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b bg-muted/20">
        <CardTitle className="text-base font-bold">Network API Connectivity</CardTitle>
        <CardDescription>External integration tokens for HQ Data services.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="p-6 border-2 border-primary/20 bg-primary/5 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-black uppercase text-primary">Master Access Key</Label>
            <Badge className="bg-emerald-500 text-white border-none">{apiToken ? 'ACTIVE' : 'INACTIVE'}</Badge>
          </div>
          <div className="flex gap-2">
            <Input
              readOnly
              type={tokenVisible ? "text" : "password"}
              value={apiToken || '****************************'}
              className="font-mono text-xs bg-background h-12"
            />
            <Button variant="outline" className="h-12 w-12 shrink-0" onClick={() => setTokenVisible(!tokenVisible)}>
              {tokenVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </Button>
            <Button className="h-12 px-6 gap-2 font-bold shrink-0" onClick={copyToken} disabled={!apiToken}><Copy className="size-4" /> COPY</Button>
          </div>
          <p className="text-[10px] text-muted-foreground italic">Use this token for secure communication with Arkesel SMS and financial gateways.</p>
        </div>
        <Button variant="outline" onClick={onRegenerate} className="w-full h-12 border-dashed gap-2 text-xs font-black tracking-widest uppercase">
          <RefreshCw className="size-3" /> Regenerate Network Key
        </Button>
      </CardContent>
    </Card>
  );
}
