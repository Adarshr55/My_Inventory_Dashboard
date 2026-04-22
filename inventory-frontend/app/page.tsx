'use client';

import { useEffect, useState, useCallback } from 'react';
import { getInventory, updateInventoryItem } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { CheckCircle, AlertTriangle, XCircle, Package, Search, SlidersHorizontal, Pencil, BarChart2 } from 'lucide-react';

type Item = {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity_on_hand: number;
  reorder_point: number;
  unit_cost: string;
  supplier: string;
  notes: string;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
};

const STATUS_STYLES = {
  in_stock:     { bg: 'bg-emerald-50 text-emerald-700 border border-emerald-200',  label: 'In Stock',     icon: <CheckCircle size={12} className="inline mr-1" /> },
  low_stock:    { bg: 'bg-amber-50 text-amber-700 border border-amber-200',        label: 'Low Stock',    icon: <AlertTriangle size={12} className="inline mr-1" /> },
  out_of_stock: { bg: 'bg-red-50 text-red-700 border border-red-200',              label: 'Out of Stock', icon: <XCircle size={12} className="inline mr-1" /> },
};

const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export default function Home() {
  const [items, setItems]           = useState<Item[]>([]);
  const [search, setSearch]         = useState('');
  const [category, setCategory]     = useState('all');
  const [stockStatus, setStatus]    = useState('all');
  const [editItem, setEditItem]     = useState<Item | null>(null);
  const [editReorder, setEditReorder] = useState('');
  const [editNotes, setEditNotes]   = useState('');
  const [saving, setSaving]         = useState(false);
  const [allCategories, setAllCategories] = useState<string[]>([])

  const fetchItems = useCallback(async () => {
    const data:Item[] = await getInventory({
      name: search || undefined,
      category: category === 'all' ? undefined : category,
      stock_status: stockStatus === 'all' ? undefined : stockStatus,
    });
    setItems(data);
    if (allCategories.length === 0) {
       const unique: string[] = [...new Set(data.map((i: Item) => i.category))]
      setAllCategories(unique)
  }
  }, [search, category, stockStatus,allCategories]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openEdit = (item: Item) => {
    setEditItem(item);
    setEditReorder(String(item.reorder_point));
    setEditNotes(item.notes);
  };

  const handleSave = async () => {
    if (!editItem) return;
    setSaving(true);
    await updateInventoryItem(editItem.id, {
      reorder_point: Number(editReorder),
      notes: editNotes,
    });
    setSaving(false);
    setEditItem(null);
    fetchItems();
  };

  const inStock    = items.filter(i => i.stock_status === 'in_stock').length;
  const lowStock   = items.filter(i => i.stock_status === 'low_stock').length;
  const outOfStock = items.filter(i => i.stock_status === 'out_of_stock').length;

  const barData = items.map(i => ({
    name: i.name.split(' ').slice(0, 2).join(' '),
    'Qty on Hand': i.quantity_on_hand,
    'Reorder Point': i.reorder_point,
  }));

  const pieData = [
    { name: 'In Stock',     value: inStock },
    { name: 'Low Stock',    value: lowStock },
    { name: 'Out of Stock', value: outOfStock },
  ].filter(d => d.value > 0);

  const total = inStock + lowStock + outOfStock;
  const pct = (n: number) => total ? Math.round((n / total) * 100) : 0;

  // const categories = ['all', ...Array.from(new Set(items.map(i => i.category)))];
  const categories = ['all', ...allCategories]

  return (
    <div className="min-h-screen bg-gray-50 font-sans">


      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center">
          <Package size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 leading-tight">InventoryIQ</h1>
          <p className="text-xs text-gray-400 leading-tight">Supply Chain Dashboard</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Stat Cards */}
        <div className="grid grid-cols-3 gap-5">
          {[
            { label: 'In Stock',     count: inStock,    icon: <CheckCircle size={22} className="text-emerald-500" />, ring: 'border-emerald-100', num: 'text-emerald-600' },
            { label: 'Low Stock',    count: lowStock,   icon: <AlertTriangle size={22} className="text-amber-500" />, ring: 'border-amber-100',   num: 'text-amber-600' },
            { label: 'Out of Stock', count: outOfStock, icon: <XCircle size={22} className="text-red-400" />,         ring: 'border-red-100',     num: 'text-red-500' },
          ].map(({ label, count, icon, ring, num }) => (
            <div key={label} className={`bg-white rounded-xl border ${ring} px-6 py-5 flex items-center gap-4 shadow-sm`}>
              <div className="shrink-0">{icon}</div>
              <div>
                <p className={`text-3xl font-bold ${num}`}>{count}</p>
                <p className="text-sm text-gray-500 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart2 size={16} className="text-indigo-500" />
            <h2 className="text-xs font-semibold tracking-widest text-gray-500 uppercase">Inventory Analytics</h2>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Quantity on Hand vs Reorder Point</p>
              {items.length === 0 ? (
                <p className="text-gray-400 text-sm">No data.</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 65 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" angle={-35} textAnchor="end" interval={0} tick={{ fontSize: 10, fill: '#6b7280' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Legend verticalAlign="top" wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="Qty on Hand" fill="#6366f1" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Reorder Point" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Items by Stock Status</p>
              {pieData.length === 0 ? (
                <p className="text-gray-400 text-sm">No data.</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={110}
                      dataKey="value"
                      label={({ name, value }) => `${name} (${pct(value)}%)`}
                      labelLine={{ stroke: '#9ca3af' }}>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Filters + Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[220px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search items by name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-gray-400" />
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-40 text-sm">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c} value={c} className="text-sm">
                      {c === 'all' ? 'All Categories' : c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={stockStatus} onValueChange={setStatus}>
                <SelectTrigger className="w-40 text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-sm">All Statuses</SelectItem>
                  <SelectItem value="in_stock" className="text-sm">In Stock</SelectItem>
                  <SelectItem value="low_stock" className="text-sm">Low Stock</SelectItem>
                  <SelectItem value="out_of_stock" className="text-sm">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Name', 'SKU', 'Category', 'Qty on Hand', 'Reorder Point', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">No items found.</td>
                  </tr>
                ) : items.map((item, idx) => (
                  <tr key={item.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                    <td className="px-6 py-4"><div className="font-medium text-gray-900">{item.name}</div>
                    {item.notes && (
                    <div className="text-xs text-gray-400 mt-1">
                    {item.notes}
                  </div>
                    )}
                    </td>
                    <td className="px-6 py-4 text-gray-400 font-mono text-xs">{item.sku}</td>
                    <td className="px-6 py-4 text-gray-600">{item.category}</td>
                    <td className="px-6 py-4 text-gray-800 font-semibold">{item.quantity_on_hand.toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-600">{item.reorder_point.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[item.stock_status].bg}`}>
                        {STATUS_STYLES[item.stock_status].icon}
                        {STATUS_STYLES[item.stock_status].label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => openEdit(item)}
                        className="p-1.5 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors">
                        <Pencil size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Edit Item</DialogTitle>
            <p className="text-sm text-gray-500">{editItem?.name}</p>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Reorder Point</Label>
              <Input type="number" value={editReorder}
                onChange={e => setEditReorder(e.target.value)} min={0} className="text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Notes</Label>
              <Input value={editNotes}
                onChange={e => setEditNotes(e.target.value)}
                placeholder="Add a note..." className="text-sm" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditItem(null)}>Cancel</Button>
            <Button size="sm" onClick={handleSave} disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}