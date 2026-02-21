
import React, { useState, useContext, useEffect } from 'react';
import { SettingsContext } from '@/context/SettingsContext';
import { 
    UserCheck, 
    Wallet, 
    Truck, 
    Archive, 
    AlertTriangle,
    Wrench,
    Users,
    Printer,
    X
} from 'lucide-react';

import AttendanceTab from './workforce/AttendanceTab';
import PayrollTab from './workforce/PayrollTab';
import EquipmentTab from './workforce/EquipmentTab';
import MaterialsTab from './workforce/MaterialsTab';


const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex items-center gap-4">
        <div className={`p-3 rounded-lg ${color}`}>
            <Icon size={20} className="text-white"/>
        </div>
        <div>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-bold text-card-foreground">{value}</p>
        </div>
    </div>
);

const PayslipModal = ({ payslip, onClose, T }) => {
    if (!payslip) return null;
    
    const monthYear = new Date(payslip.month).toLocaleString(T.locale, { month: 'long', year: 'numeric' });

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fade-in" 
            onClick={onClose}
          />
          {/* Content */}
          <div className="relative z-10 bg-card rounded-2xl w-full max-w-lg shadow-2xl transform transition-all scale-100 flex flex-col animate-fade-in">
            <div className="flex justify-between items-center p-6 border-b border-border">
                <div>
                    <h3 className="text-xl font-bold text-card-foreground">{T.payslipTitle(monthYear)}</h3>
                    <p className="text-sm text-muted-foreground">{payslip.name} ({payslip.role})</p>
                </div>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={24} /></button>
            </div>
            <div className="p-6" id="payslip-content">
                <div className="grid grid-cols-2 gap-8">
                    {/* Earnings */}
                    <div>
                        <h4 className="font-bold text-lg text-green-600 mb-2 border-b-2 border-green-200 pb-1">{T.earnings}</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-muted-foreground">{T.baseSalary}</span><span className="font-medium text-foreground">৳{payslip.baseSalary.toLocaleString()}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">{T.overtimePay} ({payslip.overtimeHours} hrs)</span><span className="font-medium text-foreground">৳{payslip.overtimePay.toLocaleString()}</span></div>
                        </div>
                        <div className="flex justify-between mt-3 pt-3 border-t border-border font-bold">
                            <span>{T.totalEarnings}</span>
                            <span>৳{(payslip.baseSalary + payslip.overtimePay).toLocaleString()}</span>
                        </div>
                    </div>
                    {/* Deductions */}
                    <div>
                        <h4 className="font-bold text-lg text-red-600 mb-2 border-b-2 border-red-200 pb-1">{T.deductions}</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-muted-foreground">{T.absences} ({payslip.absentDays} days)</span><span className="font-medium text-foreground">- ৳{payslip.absenceDeductions.toLocaleString()}</span></div>
                        </div>
                        <div className="flex justify-between mt-3 pt-3 border-t border-border font-bold">
                            <span>{T.totalDeductions}</span>
                            <span>- ৳{payslip.absenceDeductions.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
                <div className="mt-8 bg-muted p-4 rounded-lg text-center">
                    <p className="text-sm font-medium text-muted-foreground">{T.netPayable}</p>
                    <p className="text-3xl font-bold text-primary">৳{payslip.netSalary.toLocaleString()}</p>
                </div>
            </div>
             <div className="p-4 bg-muted/50 border-t border-border text-right">
                <button onClick={() => window.print()} className="bg-foreground text-background px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm ml-auto"><Printer size={16}/> {T.print}</button>
            </div>
          </div>
        </div>
    );
};

const Workforce = ({ attendance, payrollData, equipment, materials, employees, projects, onOpenModal, onDelete, initialTab = 'attendance', initialEquipmentId = null, onClearInitialEquipment = () => {} }) => {
    const { language, translations } = useContext(SettingsContext);
    const T = translations[language];

    const [activeTab, setActiveTab] = useState(initialTab);
    const [selectedPayslip, setSelectedPayslip] = useState(null);

    useEffect(() => {
        if (initialTab) setActiveTab(initialTab);
    }, [initialTab]);

    const tabs = [
        { id: 'attendance', label: T.attendance, icon: UserCheck },
        { id: 'payroll', label: T.payroll, icon: Wallet },
        { id: 'equipment', label: T.equipment, icon: Truck },
        { id: 'materialManagement', label: T.materialManagement, icon: Archive },
    ];
    
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-foreground">{T.workforce}</h2>
                <p className="text-muted-foreground mt-1">{T.workforceSubtitle}</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title={T.employees} value={employees.length} icon={Users} color="bg-blue-500" />
                <StatCard title={T.totalAssets} value={equipment.length} icon={Wrench} color="bg-orange-500" />
                <StatCard title="Today's Present" value={attendance.filter(a => a.date === new Date().toISOString().split('T')[0] && a.status === 'Present').length} icon={UserCheck} color="bg-green-500" />
                <StatCard title="Low Stock Items" value={materials.filter(m => m.currentStock < m.reorderLevel).length} icon={AlertTriangle} color="bg-red-500" />
            </div>

            <div className="bg-card p-2 rounded-2xl border border-border shadow-sm">
                <div className="flex space-x-2">
                {tabs.map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                            activeTab === tab.id ? 'bg-primary/10 text-primary shadow-sm' : 'text-muted-foreground hover:bg-accent/50'
                        }`}
                    >
                        <tab.icon size={16}/> {tab.label}
                    </button>
                ))}
                </div>
            </div>

            <div className="mt-6">
                {activeTab === 'attendance' && <AttendanceTab attendance={attendance} employees={employees} projects={projects} T={T} onOpenModal={onOpenModal} onDelete={(id) => onDelete('attendance', id)} />}
                {activeTab === 'payroll' && <PayrollTab payrollData={payrollData} employees={employees} attendance={attendance} T={T} onOpenPayslip={setSelectedPayslip} />}
                {activeTab === 'equipment' && <EquipmentTab equipment={equipment} projects={projects} T={T} onOpenModal={onOpenModal} onDelete={(id) => onDelete('equipment', id)} initialEquipmentId={initialEquipmentId} onClearInitialEquipment={onClearInitialEquipment} />}
                {activeTab === 'materialManagement' && <MaterialsTab materials={materials} transactions={payrollData} projects={projects} T={T} onOpenModal={onOpenModal} onDelete={(id) => onDelete('materials', id)} />}
            </div>

            {selectedPayslip && <PayslipModal payslip={selectedPayslip} onClose={() => setSelectedPayslip(null)} T={T} />}
        </div>
    );
};

export default Workforce;
