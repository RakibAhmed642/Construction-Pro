"use client"; // Next.js App Router-এ Context ব্যবহার করলে এটি ফাইলের শুরুতে থাকা বাধ্যতামূলক

import React, { useState, useMemo, useContext, useEffect } from 'react';
import Image from 'next/image';
import { 
    Plus, 
    Trash2, 
    Briefcase, 
    Phone, 
    Edit, 
    Banknote, 
    Download, 
    ChevronLeft, 
    Calendar,
    ChevronDown,
    Search,
    UserCheck
} from 'lucide-react';
import { SettingsContext } from '@/context/SettingsContext';

const EmployeeDetailView = ({ employee, transactions, onBack, onPay, projects, attendance }) => {
    // --- Safe Context Destructuring ---
    const context = useContext(SettingsContext) || {};
    const language = context.language || 'en';
    const T = context.translations ? context.translations[language] : {};

    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  
    const empTransactions = useMemo(() => {
      return transactions.filter(t => 
        (t.employeeId === employee.id) || 
        (t.category === 'labor' && t.description.includes(employee.name))
      );
    }, [transactions, employee]);

    const empAttendance = useMemo(() => {
        return attendance.filter(a => a.employeeId === employee.id && a.status !== 'Absent');
    }, [attendance, employee.id]);
  
    const stats = useMemo(() => {
      const yearlyTotal = empTransactions
        .filter(t => t.date.startsWith(selectedYear))
        .reduce((sum, t) => sum + Number(t.amount), 0);
  
      const monthlyTotal = empTransactions
        .filter(t => {
          const d = new Date(t.date);
          return d.getFullYear().toString() === selectedYear && d.getMonth() === selectedMonth;
        })
        .reduce((sum, t) => sum + Number(t.amount), 0);
  
      const lifetimeTotal = empTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

      const yearlyAttCount = empAttendance.filter(a => a.date.startsWith(selectedYear)).length;
      const monthlyAttCount = empAttendance.filter(a => {
          const d = new Date(a.date);
          return d.getFullYear().toString() === selectedYear && d.getMonth() === selectedMonth;
      }).length;
  
      return { yearlyTotal, monthlyTotal, lifetimeTotal, yearlyAttCount, monthlyAttCount };
    }, [empTransactions, empAttendance, selectedYear, selectedMonth]);
  
    const filteredTransactions = empTransactions
      .filter(t => {
        const d = new Date(t.date);
        return d.getFullYear().toString() === selectedYear && d.getMonth() === selectedMonth;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
    const months = language === 'bn' 
        ? ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"]
        : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    // Year selection range from 2025 to 2040 (16 years)
    const years = Array.from({length: 16}, (_, i) => (2025 + i).toString());
  
    const project = projects.find(p => p.id === employee.projectId);

    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="p-2 hover:bg-accent rounded-full transition-colors">
                <ChevronLeft size={24} className="text-muted-foreground" />
              </button>
              {employee.imageUrl ? (
                <Image src={employee.imageUrl} alt={employee.name} width={64} height={64} className="w-16 h-16 rounded-full object-cover border-4 border-card shadow-sm" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl border-4 border-card shadow-sm">
                    {employee.name.charAt(0)}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-card-foreground">{employee.name}</h2>
                <div className="flex flex-wrap items-center gap-3 text-muted-foreground text-sm mt-1">
                  <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded text-foreground font-medium"><Briefcase size={14} /> {employee.role}</span>
                  <span className="flex items-center gap-1"><Phone size={14} /> {employee.phone}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${employee.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>{employee.status}</span>
                </div>
                {project && (
                    <p className="text-xs text-muted-foreground mt-1">Assigned to: <span className="font-semibold text-primary">{project.name}</span></p>
                )}
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
               <div className="text-right hidden md:block px-4 border-r border-border">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{T.lifetimePaid || 'Lifetime Paid'}</p>
                  <p className="text-xl font-bold text-primary">৳{stats.lifetimeTotal.toLocaleString()}</p>
               </div>
               <button onClick={() => onPay(employee)} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-green-600/20 w-full md:w-auto">
                 <Banknote size={20} /><span>{T.newPayment || 'New Payment'}</span>
               </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
               <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2"><Calendar size={16} /> {T.selectFinancialYear || 'Select Financial Year'}</h3>
               <div className="relative">
                 <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="w-full appearance-none bg-muted border border-border text-foreground py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-background focus:border-primary font-medium transition-colors">
                   {years.map(yr => <option key={yr} value={yr}>{yr}</option>)}
                 </select>
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground"><ChevronDown size={16} /></div>
               </div>
            </div>
            <div className="bg-gradient-to-br from-primary to-primary/80 p-6 rounded-xl shadow-lg text-primary-foreground">
              <p className="text-primary-foreground/70 text-sm font-medium mb-1">{T.monthlyTotalFor ? T.monthlyTotalFor(months[selectedMonth], selectedYear) : `Monthly Total for ${months[selectedMonth]} ${selectedYear}`}</p>
              <h3 className="text-3xl font-bold mb-4">৳{stats.monthlyTotal.toLocaleString()}</h3>
              <div className="pt-4 border-t border-primary-foreground/20">
                 <div className="flex justify-between items-center text-sm"><span className="text-primary-foreground/70">{T.yearlyTotal || 'Yearly Total'}</span><span className="font-semibold">৳{stats.yearlyTotal.toLocaleString()}</span></div>
              </div>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <UserCheck size={16} className="text-blue-500" /> {T.attendance || 'Attendance'}
                </h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">{T.monthlyAttendance || 'Monthly Attendance'}</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-foreground">{stats.monthlyAttCount}</span>
                            <span className="text-xs text-muted-foreground">{T.days || 'Days'}</span>
                        </div>
                    </div>
                    <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.min(100, (stats.monthlyAttCount / 30) * 100)}%` }}></div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-border">
                        <span className="text-sm text-muted-foreground">{T.yearlyAttendance || 'Yearly Attendance'}</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-bold text-foreground">{stats.yearlyAttCount}</span>
                            <span className="text-xs text-muted-foreground">{T.days || 'Days'}</span>
                        </div>
                    </div>
                </div>
            </div>
          </div>
          <div className="lg:col-span-9 space-y-4">
            <div className="bg-card p-2 rounded-xl border border-border shadow-sm overflow-x-auto">
              <div className="flex min-w-max space-x-1">
                {months.map((m, idx) => (
                  <button key={m} onClick={() => setSelectedMonth(idx)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedMonth === idx ? 'bg-primary/10 text-primary shadow-sm' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}>{m}</button>
                ))}
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden min-h-[400px]">
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="bg-muted/50 border-b border-border">
                       <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider w-32">{T.date || 'Date'}</th>
                       <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{T.description || 'Description'}</th>
                       <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider w-32">{T.category || 'Category'}</th>
                       <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right w-40">{T.amount || 'Amount'}</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-border">
                     {filteredTransactions.length > 0 ? (
                       filteredTransactions.map(t => (
                         <tr key={t.id} className="hover:bg-accent/50 transition-colors">
                           <td className="p-4 text-sm text-muted-foreground font-mono">{t.date}</td>
                           <td className="p-4 text-sm font-medium text-foreground">{t.description}</td>
                           <td className="p-4 text-sm"><span className="px-2 py-1 rounded-md bg-muted text-muted-foreground text-xs font-medium capitalize">{t.category}</span></td>
                           <td className="p-4 text-sm text-right font-bold text-foreground">৳{Number(t.amount).toLocaleString()}</td>
                         </tr>
                       ))
                     ) : (
                       <tr><td colSpan="4" className="p-12 text-center"><div className="flex flex-col items-center justify-center text-muted-foreground"><Banknote size={48} className="mb-3 opacity-20" /><p className="text-sm font-medium">{T.noPaymentsFound ? T.noPaymentsFound(months[selectedMonth], selectedYear) : 'No Payments Found'}</p></div></td></tr>
                     )}
                   </tbody>
                   {filteredTransactions.length > 0 && <tfoot><tr className="bg-muted/50 border-t border-border"><td colSpan="3" className="p-4 text-right text-sm font-bold text-muted-foreground">{T.totalFor ? T.totalFor(months[selectedMonth]) : 'Total for Month'}</td><td className="p-4 text-right text-sm font-bold text-primary">৳{stats.monthlyTotal.toLocaleString()}</td></tr></tfoot>}
                 </table>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
};
  
const Employees = ({ employees = [], onOpenModal, onDelete, transactions = [], projects = [], attendance = [], initialEmployeeId = null, onClearInitialEmployee = () => {} }) => {
    // --- Safe Context Destructuring ---
    const context = useContext(SettingsContext) || {};
    const language = context.language || 'en';
    const T = context.translations ? context.translations[language] : {};
    
    const [viewMode, setViewMode] = useState('list');
    const [activeEmpForDetails, setActiveEmpForDetails] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (initialEmployeeId) {
            const emp = employees.find(e => e.id === initialEmployeeId);
            if (emp) {
                setActiveEmpForDetails(emp);
                setViewMode('details');
                onClearInitialEmployee();
            }
        }
    }, [initialEmployeeId, employees, onClearInitialEmployee]);

    const filteredEmployees = useMemo(() => {
        if (!employees) return [];
        return employees.filter(emp =>
            emp.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.id?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [employees, searchQuery]);
  
    const handleExportCSV = () => {
      const headers = ["Employee Name", "Role", "Phone", "Status", "Total Paid (Lifetime)", "Payment Date", "Payment Amount", "Description"];
      const rows = [];
      employees.forEach(emp => {
        const empPayments = transactions.filter(t => (t.employeeId === emp.id) || (t.category === 'labor' && t.description.includes(emp.name)));
        if (empPayments.length > 0) {
          empPayments.forEach(pay => { rows.push([`"${emp.name}"`, `"${emp.role}"`, `"${emp.phone}"`, `"${emp.status}"`, `"${emp.totalPaid || 0}"`, `"${pay.date}"`, `"${pay.amount}"`, `"${pay.description}"`]); });
        } else {
          rows.push([`"${emp.name}"`, `"${emp.role}"`, `"${emp.phone}"`, `"${emp.status}"`, `"${emp.totalPaid || 0}"`, "-", "-", "No Payment Records"]);
        }
      });
      const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `employees_report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  
    const handleEdit = (e, emp) => { e.stopPropagation(); onOpenModal('edit_employee', emp); };
    const handlePay = (e, emp) => { e.stopPropagation(); onOpenModal('pay_employee', emp); };
    const handleDeleteClick = (e, id) => { e.stopPropagation(); onDelete(id); };
  
    if (viewMode === 'details' && activeEmpForDetails) {
      return <EmployeeDetailView employee={activeEmpForDetails} transactions={transactions} projects={projects} attendance={attendance} onBack={() => { setViewMode('list'); setActiveEmpForDetails(null); }} onPay={(emp) => onOpenModal('pay_employee', emp)} />;
    }
  
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-foreground">{T.employeesDirectory || 'Employees Directory'}</h2>
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                    type="text"
                    placeholder={T.searchEmployees || 'Search Employees'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border bg-background rounded-lg outline-none focus:ring-2 focus:ring-primary"
                />
            </div>
            <button onClick={handleExportCSV} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"><Download size={20} /><span>{T.exportReport || 'Export Report'}</span></button>
            <button onClick={() => onOpenModal('employees')} className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"><Plus size={20} /><span>{T.addEmployee || 'Add Employee'}</span></button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map(emp => {
            const project = projects.find(p => p.id === emp.projectId);
            return (
                <div key={emp.id} onClick={() => { setActiveEmpForDetails(emp); setViewMode('details'); }} className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer relative group">
                <div className="absolute top-4 right-4 flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button onClick={(e) => handleEdit(e, emp)} className="p-1.5 bg-card border border-border text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg shadow-sm"><Edit size={16} /></button>
                    <button onClick={(e) => handleDeleteClick(e, emp.id)} className="p-1.5 bg-card border border-border text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg shadow-sm"><Trash2 size={16} /></button>
                </div>
                <div className="flex items-center gap-4 mb-4">
                    {emp.imageUrl ? (
                        <Image src={emp.imageUrl} alt={emp.name} width={56} height={56} className="w-14 h-14 rounded-full object-cover border-2 border-card shadow-sm" />
                    ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center text-primary font-bold text-xl border-2 border-card shadow-sm">{emp.name.charAt(0)}</div>
                    )}
                    <div>
                        <h3 className="font-bold text-card-foreground text-lg group-hover:text-primary transition-colors">{emp.name}</h3>
                        <p className="text-sm text-muted-foreground">{emp.role}</p>
                        <p className="text-xs text-muted-foreground font-mono mt-1">ID: {emp.id?.slice(-6)}</p>
                    </div>
                </div>
                <div className="space-y-3 text-sm border-t border-border pt-4">
                    <div className="flex justify-between items-center"><span className="text-muted-foreground flex items-center gap-2"><Briefcase size={14}/> {T.projects || 'Projects'}</span><span className="font-medium text-foreground truncate max-w-[120px]">{project?.name || T.unassigned || 'Unassigned'}</span></div>
                    <div className="flex justify-between items-center"><span className="text-muted-foreground flex items-center gap-2"><Phone size={14}/> {T.contact || 'Contact'}</span><span className="font-medium text-foreground">{emp.phone}</span></div>
                    <div className="bg-muted p-3 rounded-lg flex justify-between items-center mt-2 group-hover:bg-primary/10 transition-colors">
                    <div><p className="text-xs text-muted-foreground">{T.totalPaid || 'Total Paid'}</p><p className="font-bold text-foreground">৳{Number(emp.totalPaid || 0).toLocaleString()}</p></div>
                    <button onClick={(e) => handlePay(e, emp)} className="bg-card border border-border text-foreground text-xs px-3 py-1.5 rounded-md hover:bg-green-600 hover:text-white hover:border-green-600 transition-colors flex items-center gap-1 shadow-sm"><Banknote size={14} /> {T.pay || 'Pay'}</button>
                    </div>
                </div>
                </div>
            );
          })}
          {filteredEmployees.length === 0 && <div className="col-span-full bg-card p-12 rounded-xl border-2 border-dashed border-border text-center text-muted-foreground"><Briefcase size={48} className="mx-auto mb-4 text-muted" /><p>{searchQuery ? (T.noEmployeeSearchResults || 'No Employees Found') : (T.noEmployeesFound || 'No Employees Found')}</p></div>}
        </div>
      </div>
    );
};

export default Employees;