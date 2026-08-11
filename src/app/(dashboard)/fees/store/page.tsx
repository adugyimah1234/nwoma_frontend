'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Package,
    Plus,
    Trash2,
    RefreshCw,
    ShoppingCart,
    CreditCard,
    Search,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/layout/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import inventoryService, { InventoryItem } from '@/services/inventory';
import { toast } from 'sonner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import studentService from '@/services/students';
import { cn } from '@/lib/utils';

export default function ProvisionsStorePage() {
    const { isAdmin } = useAuth();
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('sales');

    // POS State
    const [cart, setCart] = useState<{item: InventoryItem, quantity: number}[]>([]);
    const [posSearch, setPosSearch] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'debt'>('cash');

    // Inventory Form State
    const [newItem, setNewItem] = useState<{
        name: string;
        category: InventoryItem['category'];
        price: number;
        stock_quantity: number;
    }>({
        name: '',
        category: 'other',
        price: 0,
        stock_quantity: 0
    });
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [itemData, studentData] = await Promise.all([
                inventoryService.getAll(),
                studentService.getAll()
            ]);
            setItems(itemData);
            setStudents(studentData);
        } catch (err) {
            toast.error("Failed to load store data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await inventoryService.create(newItem);
            toast.success("Item added to registry");
            setIsDialogOpen(false);
            setNewItem({ name: '', category: 'other', price: 0, stock_quantity: 0 });
            fetchData();
        } catch (err) {
            toast.error("Process failed");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Remove this item from store records?")) return;
        try {
            await inventoryService.delete(id);
            toast.success("Item purged");
            fetchData();
        } catch (err) {
            toast.error("Operation failed");
        }
    };

    // POS Functions
    const addToCart = (item: InventoryItem) => {
        if (item.stock_quantity <= 0) {
            toast.error("Item out of stock");
            return;
        }
        const existing = cart.find(c => c.item.id === item.id);
        if (existing) {
            if (existing.quantity >= item.stock_quantity) {
                toast.error("Cannot exceed available stock");
                return;
            }
            setCart(cart.map(c => c.item.id === item.id ? {...c, quantity: c.quantity + 1} : c));
        } else {
            setCart([...cart, {item, quantity: 1}]);
        }
    };

    const removeFromCart = (id: string) => {
        setCart(cart.filter(c => c.item.id !== id));
    };

    const totalAmount = cart.reduce((sum, c) => sum + (c.item.price * c.quantity), 0);

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        if (paymentMethod === 'debt' && !selectedStudentId) {
            toast.error("Please select a student for credit sales");
            return;
        }

        try {
            setLoading(true);
            await inventoryService.recordSale({
                items: cart.map(c => ({ ...c.item, quantity: c.quantity })),
                student_id: selectedStudentId || undefined,
                payment_method: paymentMethod
            });
            toast.success(paymentMethod === 'debt' ? "Transaction finalized. Debt recorded." : "Transaction finalized. Stock adjusted.");
            setCart([]);
            setSelectedStudentId('');
            setPaymentMethod('cash');
            fetchData();
        } catch (err) {
            toast.error("Checkout failed");
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(val);
    };

    return (
        <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
            <PageHeader
                title="Essentials & Provisions Store"
                description="Manage inventory and sales for school uniforms, books, and stationery."
                breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Finance', href: '/fees' }, { title: 'Store' }]}
            />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-muted/20 border p-1 h-12 inline-flex items-center gap-1 rounded-xl">
                    <TabsTrigger value="sales" className="gap-2 h-10 px-6 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <ShoppingCart className="size-4" /> POS (Sales)
                    </TabsTrigger>
                    <TabsTrigger value="inventory" className="gap-2 h-10 px-6 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Package className="size-4" /> Stock Control
                    </TabsTrigger>
                </TabsList>

                {/* SALES TABS */}
                <TabsContent value="sales" className="mt-0">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Product Catalog */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search provisions..."
                                    className="pl-10 h-12 bg-white dark:bg-slate-900 border-none shadow-sm text-lg font-medium"
                                    value={posSearch}
                                    onChange={e => setPosSearch(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {items.filter(i => i.name.toLowerCase().includes(posSearch.toLowerCase())).map(item => (
                                    <Card key={item.id} className="group hover:shadow-lg transition-all cursor-pointer border-none bg-white dark:bg-slate-900 overflow-hidden" onClick={() => addToCart(item)}>
                                        <div className="h-2 bg-indigo-600/10 group-hover:bg-indigo-600 transition-colors" />
                                        <CardContent className="p-4 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <Badge variant="secondary" className="text-[9px] uppercase font-bold tracking-tighter">{item.category}</Badge>
                                                <Badge variant={item.stock_quantity > 0 ? "outline" : "destructive"} className="text-[9px] font-black">
                                                    {item.stock_quantity > 0 ? `${item.stock_quantity} IN STOCK` : 'OUT OF STOCK'}
                                                </Badge>
                                            </div>
                                            <h4 className="font-bold text-sm uppercase leading-tight h-10 line-clamp-2">{item.name}</h4>
                                            <p className="text-xl font-black text-indigo-600">{formatCurrency(item.price)}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* Cart / Summary */}
                        <div className="space-y-6">
                            <Card className="border-none shadow-xl shadow-slate-200/50 bg-indigo-900 text-white sticky top-24">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <ShoppingCart className="size-5" />
                                        <CardTitle className="text-lg">Checkout Ledger</CardTitle>
                                    </div>
                                    <CardDescription className="text-indigo-200/60">Finalize student provision purchase.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-indigo-300">Payer (Student)</Label>
                                            <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                                                <SelectTrigger className="bg-white/10 border-none text-white h-10"><SelectValue placeholder="Search Student..." /></SelectTrigger>
                                                <SelectContent className="rounded-2xl border-none shadow-2xl">
                                                    {students.map(s => <SelectItem key={s.id} value={s.id!}>{s.first_name} {s.last_name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-indigo-300">Payment Method</Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Button
                                                    type="button"
                                                    variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                                                    className={cn("h-10 text-[10px] font-black", paymentMethod === 'cash' ? "bg-white text-indigo-900" : "bg-transparent text-white border-white/20")}
                                                    onClick={() => setPaymentMethod('cash')}
                                                >CASH / MOMO</Button>
                                                <Button
                                                    type="button"
                                                    variant={paymentMethod === 'debt' ? 'default' : 'outline'}
                                                    className={cn("h-10 text-[10px] font-black", paymentMethod === 'debt' ? "bg-white text-indigo-900" : "bg-transparent text-white border-white/20")}
                                                    onClick={() => setPaymentMethod('debt')}
                                                >CREDIT (DEBT)</Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar border-t border-white/10 pt-4">
                                        {cart.length > 0 ? cart.map(c => (
                                            <div key={c.item.id} className="flex justify-between items-center bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                                                <div className="flex-1">
                                                    <p className="text-xs font-bold uppercase truncate">{c.item.name}</p>
                                                    <p className="text-[10px] text-indigo-300">Qty: {c.quantity} x {formatCurrency(c.item.price)}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <p className="font-bold text-sm">{formatCurrency(c.item.price * c.quantity)}</p>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-indigo-200 hover:text-white hover:bg-white/10" onClick={() => removeFromCart(c.item.id)}>
                                                        <Trash2 className="size-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="py-10 text-center opacity-30 italic text-sm">
                                                No items in selection.
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-6 border-t border-white/10 space-y-4">
                                        <div className="flex justify-between items-end">
                                            <span className="text-xs font-bold uppercase text-indigo-300">Total Payable</span>
                                            <span className="text-3xl font-black">{formatCurrency(totalAmount)}</span>
                                        </div>
                                        <Button
                                            disabled={cart.length === 0 || loading}
                                            className="w-full h-14 bg-white text-indigo-900 hover:bg-indigo-50 font-black text-lg gap-2 shadow-2xl shadow-black/20"
                                            onClick={handleCheckout}
                                        >
                                            {loading ? <RefreshCw className="size-5 animate-spin" /> : <CreditCard className="size-5" />}
                                            PROCESS TRANSACTION
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* INVENTORY TABS */}
                <TabsContent value="inventory" className="mt-0 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-600">
                                <Package className="size-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Stock Management</h3>
                                <p className="text-xs text-muted-foreground">Adjust quantities and add new provisions.</p>
                            </div>
                        </div>

                        {isAdmin && (
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="gap-2 h-10 shadow-lg shadow-primary/20"><Plus className="size-4" /> Add Item</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <form onSubmit={handleAddItem}>
                                        <DialogHeader>
                                            <DialogTitle>New Provision Registry</DialogTitle>
                                            <DialogDescription>Add a new product to the Garrison Essentials Store.</DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label>Item Name</Label>
                                                <Input required placeholder="e.g. School Cloth (3 Yards)" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <Label>Category</Label>
                                                    <Select value={newItem.category} onValueChange={v => setNewItem({...newItem, category: v as InventoryItem['category']})}>
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                        <SelectContent className="rounded-2xl border-none shadow-2xl">
                                                            <SelectItem value="uniform">Uniforms</SelectItem>
                                                            <SelectItem value="book">Books</SelectItem>
                                                            <SelectItem value="stationery">Stationery</SelectItem>
                                                            <SelectItem value="other">Other</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label>Unit Price (GHS)</Label>
                                                    <Input type="number" required value={newItem.price} onChange={e => setNewItem({...newItem, price: parseFloat(e.target.value)})} />
                                                </div>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>Initial Stock Quantity</Label>
                                                <Input type="number" value={newItem.stock_quantity} onChange={e => setNewItem({...newItem, stock_quantity: parseInt(e.target.value)})} />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit" className="w-full h-12 text-base font-bold">Register Item</Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>

                    <Card className="border-none shadow-sm">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/5">
                                    <TableRow>
                                        <TableHead className="font-bold">Item Name</TableHead>
                                        <TableHead className="font-bold">Category</TableHead>
                                        <TableHead className="font-bold">Price</TableHead>
                                        <TableHead className="font-bold">Stock</TableHead>
                                        <TableHead className="text-right font-bold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.map(item => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-bold uppercase text-xs">{item.name}</TableCell>
                                            <TableCell><Badge variant="secondary" className="text-[10px] uppercase font-bold">{item.category}</Badge></TableCell>
                                            <TableCell className="font-black text-indigo-600">{formatCurrency(item.price)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs font-bold ${item.stock_quantity < 10 ? 'text-rose-600' : 'text-slate-600'}`}>
                                                        {item.stock_quantity}
                                                    </span>
                                                    {item.stock_quantity < 10 && <Badge variant="destructive" className="text-[8px] h-4">LOW</Badge>}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={() => handleDelete(item.id)}>
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {items.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic">No store items registered.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
