import React, { useState, useEffect } from 'react';
import { Plus, AlertTriangle, X, Wrench, Tag, Shield, Clock, Calendar, CheckCircle, Edit, Trash2 } from 'lucide-react';

// প্রপস-এ ডিফল্ট ভ্যালু (T = {}) অ্যাড করা হয়েছে
const EquipmentDetailModal = ({ equipment, project, T = {}, onClose, onEdit, onDelete }) => {
    if (!equipment) return null;

    const needsMaintenance = new Date(equipment.nextService) < new Date();

    // Advanced maintenance progress calculation
    let maintenanceProgress = 0;
    let daysRemaining = 0;
    if (equipment.lastService && equipment.nextService) {
        const last = new Date(equipment.lastService).getTime();
        const next = new Date(equipment.nextService).getTime();
        const now = new Date().getTime();

        const totalDuration = next - last;
        const elapsed = now - last;

        if (totalDuration > 0) {
            maintenanceProgress = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
        }

        const remainingMs = next - now;
        daysRemaining = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
    }

    const DetailRow = ({ icon: Icon, label, value, valueClass }) => (
        <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Icon size={16} />
                <span>{label}</span>
            </div>
            <span className={`text-sm font-semibold text-foreground ${valueClass || ''}`}>{value}</span>
        </div>
    );

    const StatusPill = ({ status }) => {
        const styles = {
            'In Use': 'bg-green-100 text-green-700',
            'Idle': 'bg-yellow-100 text-yellow-700',
            'Maintenance': 'bg-blue-100 text-blue-700',
        };
        const activeStyle = styles[status] || 'bg-muted text-muted-foreground';
        // status undefined থাকলে যেন ক্র্যাশ না করে তাই অপশনাল চেইনিং (?) দেওয়া হয়েছে
        return <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${activeStyle}`}>{T[status?.toLowerCase()?.replace(/\s/g, '')] || status}</span>
    }

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
                            <Wrench size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-card-foreground">{equipment.name}</h3>
                            <p className="text-sm text-muted-foreground">{T.equipmentDetails}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => { onEdit?.(equipment); onClose?.(); }} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"><Edit size={20} /></button>
                        <button onClick={() => { onDelete?.(equipment.id); onClose?.(); }} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 size={20} /></button>
                        <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-accent ml-2"><X size={24} /></button>
                    </div>
                </div>
                <div className="p-6 overflow-y-auto space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column */}
                        <div>
                            <h4 className="font-semibold text-card-foreground mb-2">{T.generalInfo}</h4>
                            <div className="bg-muted/50 rounded-lg p-4 space-y-1">
                                <DetailRow icon={Tag} label={T.category} value={equipment.category} />
                                <DetailRow icon={Shield} label={T.ownership} value={T[equipment.ownership?.toLowerCase()] || equipment.ownership} />
                                <DetailRow icon={Clock} label={T.status} value={<StatusPill status={equipment.status} />} />
                            </div>
                        </div>
                        {/* Right Column */}
                        <div>
                            <h4 className="font-semibold text-card-foreground mb-2">{T.usageStatus}</h4>
                            <div className="bg-muted/50 rounded-lg p-4 space-y-1">
                                <DetailRow icon={CheckCircle} label={T.assignedProject} value={project?.name || T.unassigned || 'Unassigned'} />
                                <DetailRow icon={Calendar} label={T.lastServiceDate} value={equipment.lastService} />
                                <DetailRow icon={Calendar} label={T.nextService} value={equipment.nextService} />
                            </div>
                        </div>
                    </div>

                    {/* Maintenance Schedule */}
                    <div>
                        <h4 className="font-semibold text-card-foreground mb-2">{T.maintenanceSchedule}</h4>
                        <div className="bg-muted/50 p-6 rounded-lg border border-border">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-muted-foreground">{T.lastServiceDate}</span>
                                <span className="text-sm text-muted-foreground">{T.nextService}</span>
                            </div>
                            <div className="w-full bg-border h-2.5 rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full" style={{ width: `${maintenanceProgress}%` }}></div>
                            </div>
                            <div className="mt-4 text-center">
                                {daysRemaining > 0 ? (
                                    <p className="text-lg font-bold text-foreground">{daysRemaining} <span className="text-sm font-medium text-muted-foreground">days until next service</span></p>
                                ) : (
                                    <div className="text-red-500 font-bold flex items-center justify-center gap-2">
                                        <AlertTriangle size={18} />
                                        <span>Maintenance Overdue</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// এখানে equipment = [], projects = [], T = {} ডিফল্ট হিসেবে সেট করা হয়েছে
const EquipmentTab = ({ equipment = [], projects = [], T = {}, onOpenModal, onDelete, initialEquipmentId = null, onClearInitialEquipment = () => { } }) => {
    const [selectedEquipment, setSelectedEquipment] = useState(null);

    useEffect(() => {
        if (initialEquipmentId) {
            const eq = equipment?.find(e => e.id === initialEquipmentId);
            if (eq) {
                setSelectedEquipment(eq);
                onClearInitialEquipment?.();
            }
        }
    }, [initialEquipmentId, equipment, onClearInitialEquipment]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-card-foreground">{T.equipmentList}</h3>
                <button onClick={() => onOpenModal?.('add_equipment')} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2"><Plus size={16} /> {T.addEquipment}</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {equipment?.map(item => {
                    const projectInUse = projects?.find(p => p.id === item.projectId);
                    const needsMaintenance = new Date(item.nextService) < new Date();
                    return (
                        <div
                            key={item.id}
                            onClick={() => setSelectedEquipment(item)}
                            className="bg-card p-5 rounded-xl border border-border shadow-sm space-y-4 cursor-pointer hover:border-primary hover:shadow-lg transition-all group"
                        >
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-card-foreground">{item.name}</h4>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.ownership === 'Owned' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{T[item.ownership?.toLowerCase()] || item.ownership}</span>
                            </div>
                            <div className="flex justify-between items-center bg-muted p-3 rounded-lg">
                                <span className="text-sm text-muted-foreground">{T.status}</span>
                                <span className={`font-semibold flex items-center gap-1.5 ${item.status === 'In Use' ? 'text-green-600' : 'text-yellow-600'}`}>
                                    <span className={`w-2 h-2 rounded-full ${item.status === 'In Use' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                                    {T[item.status?.toLowerCase()?.replace(/\s/g, '')] || item.status}
                                </span>
                            </div>
                            <div className="text-sm space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{T.projects}</span>
                                    <span className="font-medium text-foreground">{projectInUse?.name || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{T.maintenance}</span>
                                    <span className={`font-medium ${needsMaintenance ? 'text-red-500' : 'text-foreground'}`}>{item.nextService}</span>
                                </div>
                            </div>
                            {needsMaintenance && <div className="!mt-4 bg-red-100 text-red-700 text-xs font-bold p-2 rounded-lg flex items-center gap-2"><AlertTriangle size={14} /> {T.maintenance} Overdue</div>}
                        </div>
                    );
                })}
            </div>
            {selectedEquipment && (
                <EquipmentDetailModal
                    equipment={selectedEquipment}
                    project={projects?.find(p => p.id === selectedEquipment.projectId)}
                    T={T}
                    onClose={() => setSelectedEquipment(null)}
                    onEdit={(eq) => onOpenModal?.('edit_equipment', eq)}
                    onDelete={onDelete}
                />
            )}
        </div>
    );
};

export default EquipmentTab;
