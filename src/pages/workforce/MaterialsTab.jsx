import React, { useState, useMemo } from 'react';
import { Plus, X, Archive, Package, BarChart2, Edit, Trash2 } from 'lucide-react';

// প্রপস-এ ডিফল্ট ভ্যালু (transactions = [], projects = [], T = {}) অ্যাড করা হয়েছে
const MaterialDetailModal = ({ material, transactions = [], projects = [], T = {}, onClose }) => {
    if (!material) return null;

    const stockPercentage = Math.min(100, (material.currentStock / (material.reorderLevel * 1.5)) * 100);
    const isLowStock = material.currentStock < material.reorderLevel;

    const recentActivity = useMemo(() => {
        return transactions
            .filter(t => (t.description.includes(material.name) || t.description.includes(material.id)) && t.category === 'materials' && t.type === 'expense')
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10);
    }, [transactions, material.name, material.id]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/40 animate-fade-in"
                onClick={onClose}
            />
            {/* Content */}
            <div className="relative z-10 bg-card rounded-2xl w-full max-w-2xl shadow-2xl transform transition-all scale-100 flex flex-col max-h-[90vh] animate-fade-in">
                <div className="flex justify-between items-center p-6 border-b border-border">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 text-primary rounded-lg">
                            <Package size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-card-foreground">{material.name}</h3>
                            <p className="text-sm text-muted-foreground">{T.materialDetails}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-accent"><X size={24} /></button>
                </div>
                <div className="p-6 overflow-y-auto space-y-6">
                    <div className="bg-muted/50 rounded-lg p-6 border border-border">
                        <h4 className="font-semibold text-card-foreground mb-4">{T.stockLevel}</h4>
                        <div className="relative h-16 bg-border rounded-full flex items-center justify-center">
                            <div style={{ width: `${stockPercentage}%` }} className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${isLowStock ? 'bg-red-500' : 'bg-primary'}`}></div>
                            <div className="relative text-center">
                                <p className="text-2xl font-bold text-white z-10">{material.currentStock.toLocaleString()}</p>
                                <p className="text-xs font-semibold text-white/80 z-10">{material.unit}</p>
                            </div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-2">
                            <span>0</span>
                            <span>{T.reorderLevel}: {material.reorderLevel.toLocaleString()}</span>
                            <span>{(material.reorderLevel * 1.5).toLocaleString()}</span>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold text-card-foreground mb-2 flex items-center gap-2"><BarChart2 size={16} /> {T.recentActivity}</h4>
                        <div className="border border-border rounded-lg overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 text-muted-foreground">
                                    <tr>
                                        <th className="p-3 font-medium">{T.date}</th>
                                        <th className="p-3 font-medium">{T.description}</th>
                                        <th className="p-3 font-medium">{T.projectContext}</th>
                                        <th className="p-3 font-medium text-right">{T.amount}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {recentActivity.length > 0 ? recentActivity.map(t => {
                                        const project = projects.find(p => p.id === t.projectId);
                                        return (
                                            <tr key={t.id}>
                                                <td className="p-3 text-muted-foreground font-mono text-xs">{t.date}</td>
                                                <td className="p-3 text-foreground font-medium">{t.description}</td>
                                                <td className="p-3 text-muted-foreground text-xs">{project ? project.name : (T.generalOverhead || 'General')}</td>
                                                <td className="p-3 text-right font-mono font-bold text-red-600">- ৳{t.amount?.toLocaleString()}</td>
                                            </tr>
                                        )
                                    }) : (
                                        <tr><td colSpan="4" className="p-6 text-center text-muted-foreground">{T.noMaterialActivity}</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// এখানেও সব ডেটা প্রপস-এ ডিফল্ট ভ্যালু (materials = [], T = {} ইত্যাদি) অ্যাড করা হয়েছে
const MaterialsTab = ({ materials = [], transactions = [], projects = [], T = {}, onOpenModal, onDelete }) => {
    const [selectedMaterial, setSelectedMaterial] = useState(null);

    const StatusBadge = ({ stock, reorder }) => {
        const isLow = stock < reorder;
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isLow ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{isLow ? T.lowStock : T.inStock}</span>;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-card-foreground">{T.materialStock}</h3>
                <div className="flex items-center gap-3">
                    <button onClick={() => onOpenModal?.('add_material')} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2"><Plus size={16} /> {T.add}</button>
                    <button onClick={() => onOpenModal?.('stock_in')} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Plus size={16} /> {T.stockIn}</button>
                    <button onClick={() => onOpenModal?.('stock_out')} className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Plus size={16} /> {T.stockOut}</button>
                </div>
            </div>
            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted text-muted-foreground">
                            <tr>
                                <th className="p-4 font-medium">{T.material}</th>
                                <th className="p-4 font-medium text-right">{T.currentStock}</th>
                                <th className="p-4 font-medium">{T.unit}</th>
                                <th className="p-4 font-medium text-right">{T.reorderLevel}</th>
                                <th className="p-4 font-medium">{T.status}</th>
                                <th className="p-4 font-medium text-right">{T.actions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {materials.map(mat => (
                                <tr key={mat.id} className="group hover:bg-accent transition-colors">
                                    <td className="p-4 font-semibold text-foreground cursor-pointer" onClick={() => setSelectedMaterial(mat)}>{mat.name}</td>
                                    <td className="p-4 text-right font-mono font-bold text-primary">{mat.currentStock?.toLocaleString()}</td>
                                    <td className="p-4 text-muted-foreground">{mat.unit}</td>
                                    <td className="p-4 text-right font-mono text-muted-foreground">{mat.reorderLevel?.toLocaleString()}</td>
                                    <td className="p-4"><StatusBadge stock={mat.currentStock} reorder={mat.reorderLevel} /></td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => onOpenModal?.('edit_material', mat)} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"><Edit size={14} /></button>
                                            <button onClick={() => onDelete?.(mat.id)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {selectedMaterial && <MaterialDetailModal material={selectedMaterial} transactions={transactions} projects={projects} T={T} onClose={() => setSelectedMaterial(null)} />}
        </div>
    )
};

export default MaterialsTab;
