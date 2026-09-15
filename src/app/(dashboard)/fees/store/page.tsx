'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Plus,
    Trash2,
    RefreshCw,
    ShoppingCart,
    Search,
    Box,
    CreditCard,
    Minus,
    Package,
    Receipt,
    UserCircle,
    Banknote,
    History
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/layout/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import inventoryService, { InventoryItem } from '@/services/inventory';
import { getAllCategories, type Category } from '@/services/categories';
import studentService from '@/services/students';
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
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function ProvisionsStorePage() {
    const { isAdmin } = useAuth();
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('sales');

    // POS State
    const [cart, setCart] = useState<{item: any, quantity: number, isCategory?: boolean}[]>([]);
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
            const [itemData, categoryData, studentData] = await Promise.all([
                inventoryService.getAll(),
                getAllCategories(),
                studentService.getAll()
            ]);
            setItems(itemData);
            setCategories(categoryData.filter(c => c.status === 'active'));
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
    const addToCart = (item: any, isCategory = false) => {
        if (!isCategory && item.stock_quantity <= 0) {
            toast.error("Item out of stock");
            return;
        }

        const existing = cart.find(c => isCategory ? (c.isCategory && c.item.id === item.id) : (!c.isCategory && c.item.id === item.id));

        if (existing) {
            if (!isCategory && existing.quantity >= item.stock_quantity) {
                toast.error("Cannot exceed available stock");
                return;
            }
            setCart(cart.map(c => {
                const match = isCategory ? (c.isCategory && c.item.id === item.id) : (!c.isCategory && c.item.id === item.id);
                return match ? {...c, quantity: c.quantity + 1} : c;
            }));
        } else {
            setCart([...cart, {item, quantity: 1, isCategory}]);
        }
    };

    const updateQuantity = (id: string, delta: number, isCategory = false) => {
        setCart(prev => prev.map(c => {
            const match = isCategory ? (c.isCategory && c.item.id === id) : (!c.isCategory && c.item.id === id);
            if (match) {
                const newQty = Math.max(0, c.quantity + delta);
                if (!isCategory && newQty > c.item.stock_quantity) {
                    toast.error("Exceeds available stock");
                    return c;
                }
                return { ...c, quantity: newQty };
            }
            return c;
        }).filter(c => c.quantity > 0));
    };

    const removeFromCart = (id: string, isCategory = false) => {
        setCart(cart.filter(c => {
            const match = isCategory ? (c.isCategory && c.item.id === id) : (!c.isCategory && c.item.id === id);
            return !match;
        }));
    };

    const totalAmount = cart.reduce((sum, c) => {
        const price = c.isCategory ? c.item.amount : c.item.price;
        return sum + (price * c.quantity);
    }, 0);

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        if (!selectedStudentId) {
            toast.error("Please select a student for record keeping");
            return;
        }

        try {
            setLoading(true);
            await inventoryService.recordSale({
                items: cart.map(c => ({
                    ...c.item,
                    quantity: c.quantity,
                    price: c.isCategory ? c.item.amount : c.item.price,
                    is_fee: c.isCategory
                })),
                student_id: selectedStudentId,
                payment_method: paymentMethod
            });
            toast.success(paymentMethod === 'debt' ? "Transaction finalized. Ledger updated." : "Transaction finalized. Receipt generated.");
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

    const combinedCatalog = [
        ...items.map(i => ({ ...i, catalogType: 'Stock', isCategory: false })),
        ...categories.map(c => ({
            id: c.id,
            name: c.name,
            price: c.amount,
            category: 'Fee',
            stock_quantity: Infinity,
            catalogType: 'Category',
            isCategory: true
        }))
    ];

    const filteredCatalog = combinedCatalog.filter(i =>
        i.name.toLowerCase().includes(posSearch.toLowerCase()) ||
        (i.category && i.category.toLowerCase().includes(posSearch.toLowerCase()))
    );

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
            <PageHeader
                title="Essentials & Provisions Store"
                description="Manage inventory and sales for school uniforms, books, and stationery."
                breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Finance', href: '/fees' }, { title: 'Store' }]}
            />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <div className="flex items-center justify-between">
                    <TabsList>
                        <TabsTrigger value="sales" className="gap-2">
                            <ShoppingCart className="size-4" /> POS Terminal
                        </TabsTrigger>
                        <TabsTrigger value="inventory" className="gap-2">
                            <Package className="size-4" /> Stock Inventory
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
                            <RefreshCw className={cn("size-4 mr-2", loading && "animate-spin")} /> Refresh
                        </Button>
                        <Button variant="outline" size="sm">
                            <History className="size-4 mr-2" /> History
                        </Button>
                    </div>
                </div>

                {/* SALES TABS */}
                <TabsContent value="sales" className="mt-0 outline-none space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Product Catalog */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search provisions or fee categories..."
                                    className="pl-10 h-11"
                                    value={posSearch}
                                    onChange={e => setPosSearch(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                {filteredCatalog.length > 0 ? (
                                    filteredCatalog.map(item => (
                                        <Card
                                            key={`${item.catalogType}-${item.id}`}
                                            className="group hover:border-primary/50 transition-colors cursor-pointer shadow-none border-border/60"
                                            onClick={() => addToCart(item, item.isCategory)}
                                        >
                                            <CardContent className="p-4 space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <Badge variant={item.isCategory ? "default" : "outline"} className="text-[10px] font-bold uppercase tracking-wider">
                                                        {item.category}
                                                    </Badge>
                                                    <span className={cn(
                                                        "text-[10px] font-bold uppercase",
                                                        item.stock_quantity === Infinity ? "text-primary" : (item.stock_quantity > 0 ? "text-emerald-600" : "text-destructive")
                                                    )}>
                                                        {item.stock_quantity === Infinity ? 'AVAILABLE' : (item.stock_quantity > 0 ? `${item.stock_quantity} IN STOCK` : 'OUT OF STOCK')}
                                                    </span>
                                                </div>
                                                <div className="space-y-1">
                                                    <h4 className="font-semibold text-sm leading-tight line-clamp-2 uppercase">{item.name}</h4>
                                                    <p className="text-lg font-bold text-foreground">{formatCurrency(item.price)}</p>
                                                </div>
                                                <Button variant="secondary" size="sm" className="w-full h-8 text-[10px] font-bold uppercase gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Plus className="size-3" /> Add to Cart
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="col-span-full py-24 text-center border-2 border-dashed rounded-xl bg-muted/5">
                                        <p className="text-sm text-muted-foreground italic font-medium uppercase tracking-tight">No matching items found in registry.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Cart / Summary */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-20">
                                <Card className="shadow-sm border-border/60 flex flex-col max-h-[calc(100vh-120px)]">
                                    <CardHeader className="bg-muted/10 border-b py-4 px-5 shrink-0">
                                        <div className="flex items-center gap-2">
                                            <ShoppingCart className="size-4 text-primary" />
                                            <CardTitle className="text-base font-bold uppercase tracking-tight">Checkout Ledger</CardTitle>
                                        </div>
                                        <CardDescription className="text-[10px] uppercase font-bold opacity-60">Terminal Session</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-5 flex flex-col gap-5 overflow-hidden">
                                        <div className="space-y-4 shrink-0">
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-tight flex items-center gap-2">
                                                    <UserCircle className="size-3" /> Student Payer
                                                </Label>
                                                <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                                                    <SelectTrigger className="h-10 border-border/60 bg-muted/20">
                                                        <SelectValue placeholder="Search Student..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {students.map(s => (
                                                            <SelectItem key={s.id} value={s.id!} className="uppercase font-medium text-xs">
                                                                {s.first_name} {s.last_name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-tight flex items-center gap-2">
                                                    <Banknote className="size-3" /> Payment Method
                                                </Label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <Button
                                                        type="button"
                                                        variant={paymentMethod === 'cash' ? 'secondary' : 'outline'}
                                                        className="h-8 text-[10px] font-bold uppercase tracking-wider"
                                                        onClick={() => setPaymentMethod('cash')}
                                                    >Immediate</Button>
                                                    <Button
                                                        type="button"
                                                        variant={paymentMethod === 'debt' ? 'secondary' : 'outline'}
                                                        className="h-8 text-[10px] font-bold uppercase tracking-wider"
                                                        onClick={() => setPaymentMethod('debt')}
                                                    >Account (Debt)</Button>
                                                </div>
                                            </div>
                                        </div>

                                        <Separator className="opacity-60 shrink-0" />

                                        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                                            <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-tight mb-3 shrink-0">Itemized Breakdown</Label>
                                            <ScrollArea className="flex-1 pr-3">
                                                <div className="space-y-4">
                                                    {cart.length > 0 ? cart.map(c => (
                                                        <div key={`${c.item.catalogType}-${c.item.id}`} className="space-y-2">
                                                            <div className="flex justify-between items-start gap-4">
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-[11px] font-bold uppercase truncate tracking-tight">{c.item.name}</p>
                                                                    <p className="text-[10px] text-muted-foreground font-medium">{formatCurrency(c.isCategory ? c.item.amount : c.item.price)}</p>
                                                                </div>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                                                    onClick={() => removeFromCart(c.item.id, c.isCategory)}
                                                                >
                                                                    <Trash2 className="size-3" />
                                                                </Button>
                                                            </div>
                                                            <div className="flex justify-between items-center bg-muted/30 rounded-md p-1 px-2 border">
                                                                <div className="flex items-center gap-2">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-6 w-6"
                                                                        onClick={() => updateQuantity(c.item.id, -1, c.isCategory)}
                                                                    >
                                                                        <Minus className="size-3" />
                                                                    </Button>
                                                                    <span className="text-xs font-bold w-4 text-center">{c.quantity}</span>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-6 w-6"
                                                                        onClick={() => updateQuantity(c.item.id, 1, c.isCategory)}
                                                                    >
                                                                        <Plus className="size-3" />
                                                                    </Button>
                                                                </div>
                                                                <p className="font-bold text-xs">{formatCurrency((c.isCategory ? c.item.amount : c.item.price) * c.quantity)}</p>
                                                            </div>
                                                        </div>
                                                    )) : (
                                                        <div className="py-12 text-center text-muted-foreground/60 italic text-[11px] border border-dashed rounded-lg bg-muted/5">
                                                            No items selected.
                                                        </div>
                                                    )}
                                                </div>
                                            </ScrollArea>
                                        </div>

                                        <div className="pt-2 space-y-4 shrink-0 mt-auto">
                                            <Separator className="opacity-60" />
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-tight">Total Payable</span>
                                                <span className="text-2xl font-bold tracking-tight">{formatCurrency(totalAmount)}</span>
                                            </div>
                                            <Button
                                                disabled={cart.length === 0 || loading}
                                                className="w-full h-12 font-bold uppercase text-xs tracking-tight gap-2 shadow-none"
                                                onClick={handleCheckout}
                                            >
                                                {loading ? <RefreshCw className="size-4 animate-spin" /> : <Receipt className="size-4" />}
                                                {paymentMethod === 'debt' ? 'Charge Account' : 'Complete Sale'}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* INVENTORY TABS */}
                <TabsContent value="inventory" className="mt-0 space-y-6 outline-none">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-lg bg-muted border flex items-center justify-center text-muted-foreground">
                                <Box className="size-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-base leading-tight uppercase tracking-tight">Inventory Control</h3>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Stock registry and procurement node.</p>
                            </div>
                        </div>

                        {isAdmin && (
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm" className="gap-2 font-bold uppercase text-[10px] tracking-tight">
                                        <Plus className="size-4" /> Register Item
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[450px]">
                                    <form onSubmit={handleAddItem}>
                                        <DialogHeader>
                                            <DialogTitle className="uppercase font-bold tracking-tight">New Provision Registry</DialogTitle>
                                            <DialogDescription className="text-xs uppercase font-medium">Add a new product to the Essentials Store.</DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-tight">Item Name</Label>
                                                <Input id="name" required placeholder="e.g. School Cloth (3 Yards)" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="uppercase text-xs" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="grid gap-1.5">
                                                    <Label htmlFor="category" className="text-[10px] font-bold uppercase tracking-tight">Category</Label>
                                                    <Select value={newItem.category} onValueChange={v => setNewItem({...newItem, category: v as InventoryItem['category']})}>
                                                        <SelectTrigger id="category" className="text-xs uppercase"><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="uniform" className="text-xs uppercase">Uniforms</SelectItem>
                                                            <SelectItem value="book" className="text-xs uppercase">Books</SelectItem>
                                                            <SelectItem value="stationery" className="text-xs uppercase">Stationery</SelectItem>
                                                            <SelectItem value="other" className="text-xs uppercase">Other</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="grid gap-1.5">
                                                    <Label htmlFor="price" className="text-[10px] font-bold uppercase tracking-tight">Unit Price (GHS)</Label>
                                                    <Input id="price" type="number" step="0.01" required value={newItem.price || ''} onChange={e => setNewItem({...newItem, price: parseFloat(e.target.value)})} />
                                                </div>
                                            </div>
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="stock" className="text-[10px] font-bold uppercase tracking-tight">Stock Quantity</Label>
                                                <Input id="stock" type="number" value={newItem.stock_quantity || ''} onChange={e => setNewItem({...newItem, stock_quantity: parseInt(e.target.value)})} />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit" className="w-full font-bold uppercase text-xs tracking-tight">Complete Registration</Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>

                    <Card className="shadow-none border border-border/60">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow>
                                        <TableHead className="font-bold text-[10px] uppercase tracking-tight py-4 pl-6">Item Identity</TableHead>
                                        <TableHead className="font-bold text-[10px] uppercase tracking-tight">Classification</TableHead>
                                        <TableHead className="font-bold text-[10px] uppercase tracking-tight">Unit Price</TableHead>
                                        <TableHead className="font-bold text-[10px] uppercase tracking-tight text-center">Quota Status</TableHead>
                                        <TableHead className="text-right font-bold text-[10px] uppercase tracking-tight pr-6">Operations</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.length > 0 ? (
                                        items.map(item => (
                                            <TableRow key={item.id} className="group hover:bg-muted/30 transition-colors border-b last:border-none">
                                                <TableCell className="font-bold text-xs uppercase text-foreground py-4 pl-6">{item.name}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="text-[10px] uppercase font-bold px-2 py-0">
                                                        {item.category}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-bold text-xs">{formatCurrency(item.price)}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className={cn(
                                                            "text-xs font-bold",
                                                            item.stock_quantity < 10 ? "text-destructive" : "text-foreground"
                                                        )}>
                                                            {item.stock_quantity}
                                                        </span>
                                                        {item.stock_quantity < 10 && (
                                                            <Badge variant="destructive" className="text-[8px] h-4 px-1 leading-none uppercase font-bold tracking-tight">Critical</Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(item.id)}>
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-24 text-muted-foreground italic text-[10px] uppercase tracking-tight opacity-40">
                                                Registry Synchronized. No items found.
                                            </TableCell>
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

