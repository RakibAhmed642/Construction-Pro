
import React, { useMemo, useContext, useState, useEffect, useRef } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  Banknote, 
  Zap, 
  HardHat, 
  Briefcase, 
  Users, 
  CheckCircle, 
  PieChart, 
  TrendingUp, 
  Activity, 
  Sun, 
  Hammer, 
  UserCheck,
  Building,
  DollarSign,
  Calendar,
  MoreHorizontal,
  X,
  Wrench,
  Package,
  TrendingDown,
  Clock,
  ChevronRight,
  BarChart3,
  MapPin,
  Moon,
  Sunrise,
  Sunset,
  CloudSun,
  UserPlus,
  UserMinus,
  Archive,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { DashboardCard, QuickActionButton, StatusRow, ExpenseBar } from '@/components/DashboardWidgets';
import { SettingsContext } from '@/context/SettingsContext';
import { Modal } from '@/components/UI';


// --- START: DATA DISPLAY COMPONENTS ---

const MetricDataList = ({ data, type, T, language, projects }) => {
    const [visibleCount, setVisibleCount] = useState(20);
    const loaderRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && visibleCount < data.length) {
                setVisibleCount(prev => prev + 20);
            }
        }, { threshold: 0.1 });

        if (loaderRef.current) observer.observe(loaderRef.current);
        return () => observer.disconnect();
    }, [data.length, visibleCount]);

    return (
        <div className="space-y-4">
            {data.slice(0, visibleCount).map((item, idx) => (
                <div key={item.id || idx} className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 
                        ${type === 'project' ? 'bg-orange-500' : (item.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500')}`}>
                        {type === 'project' ? <HardHat size={18} className="text-white"/> : <DollarSign size={18} className="text-white"/>}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                            <p className="font-bold text-sm text-foreground truncate">
                                {type === 'project' ? item.name : item.description}
                            </p>
                            <span className="text-sm font-bold font-mono text-foreground whitespace-nowrap">
                                ৳{Number(type === 'project' ? item.budget : item.amount).toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                {type === 'project' ? <><MapPin size={10}/> {item.location}</> : <><Calendar size={10}/> {item.date}</>}
                            </p>
                            {type === 'transaction' && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${item.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                    {T[item.type]}
                                </span>
                            )}
                            {type === 'project' && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-muted text-muted-foreground`}>
                                    {item.status}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            ))}
            {visibleCount < data.length && (
                <div ref={loaderRef} className="py-6 flex justify-center">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
            {data.length === 0 && (
                <div className="text-center py-12 text-muted-foreground italic">
                    {T.noTransactionsRecorded || "No records found."}
                </div>
            )}
        </div>
    );
};

const ActivityInfiniteList = ({ activities, T, language }) => {
    const [visibleCount, setVisibleCount] = useState(20);
    const loaderRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && visibleCount < activities.length) {
                setVisibleCount(prev => prev + 20);
            }
        }, { threshold: 0.1 });

        if (loaderRef.current) observer.observe(loaderRef.current);
        return () => observer.disconnect();
    }, [activities.length, visibleCount]);

    return (
        <div className="space-y-4">
            {activities.slice(0, visibleCount).map((act, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 
                        ${act.type === 'transaction' ? (act.data.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500') : 
                          act.type === 'project' ? 'bg-orange-500' : 'bg-purple-500'}`}>
                        {act.type === 'transaction' ? <DollarSign size={18} className="text-white"/> : 
                         act.type === 'project' ? <HardHat size={18} className="text-white"/> : 
                         <Users size={18} className="text-white"/>}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                            <p className="font-bold text-sm text-foreground truncate">
                                {act.type === 'transaction' ? act.data.description : act.data.name}
                            </p>
                            <span className="text-[10px] font-mono font-bold text-muted-foreground bg-card px-2 py-1 rounded border border-border w-fit">
                                {act.date?.seconds 
                                    ? new Date(act.date.seconds * 1000).toLocaleString(language === 'bn' ? 'bn-BD' : 'en-GB') 
                                    : 'Just now'}
                            </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                            <Clock size={10} />
                            {act.type === 'transaction' ? `${act.data.type === 'income' ? T.income : T.expense} • ${act.data.category}` : 
                             act.type === 'project' ? T.newProject : T.addEmployee}
                        </p>
                    </div>
                </div>
            ))}
            {visibleCount < activities.length && (
                <div ref={loaderRef} className="py-10 flex justify-center">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
        </div>
    );
};

const ProjectPopupDetails = ({ project, transactions, employees, equipment, attendance, T, onNavigate, onClose }) => {
    const [activeSection, setActiveSection] = useState('transactions');

    const projectData = useMemo(() => {
        if (!project) return null;

        const projectTransactions = transactions.filter(t => t.projectId === project.id);
        const income = projectTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount || 0), 0);
        const expense = projectTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount || 0), 0);
        
        const projectEmployees = employees.filter(e => e.projectId === project.id);
        const projectEquipment = equipment.filter(e => e.projectId === project.id);

        const todayString = new Date().toISOString().split('T')[0];
        const projectAttendance = attendance.filter(a => a.projectId === project.id && a.date === todayString);
        const todaysAttendanceCount = projectAttendance.filter(a => a.status === 'Present').length;

        return {
            income,
            expense,
            net: income - expense,
            employeeCount: projectEmployees.length,
            equipmentCount: projectEquipment.length,
            todaysAttendance: todaysAttendanceCount,
            employees: projectEmployees,
            equipment: projectEquipment,
            attendance: projectAttendance,
            recentTransactions: projectTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10)
        };
    }, [project, transactions, employees, equipment, attendance]);

    if (!projectData) return null;

    const DetailCard = ({ icon: Icon, label, value, colorClass, section, formatAsCurrency = false }) => {
        const isActive = activeSection === section;
        return (
            <button 
                onClick={() => setActiveSection(section)}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left group
                    ${isActive 
                        ? 'bg-primary/5 border-primary shadow-sm' 
                        : 'bg-card border-border hover:border-primary/30 hover:shadow-md'
                    }`}
            >
                <div className={`p-2.5 rounded-lg shrink-0 transition-transform group-hover:scale-110 ${colorClass}`}>
                    <Icon size={18} className="text-white"/>
                </div>
                <div className="min-w-0 overflow-hidden">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider truncate">{label}</p>
                    <p className="text-lg font-bold text-card-foreground truncate">
                        {formatAsCurrency ? `৳${Number(value || 0).toLocaleString()}` : value}
                    </p>
                </div>
            </button>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <DetailCard icon={ArrowUpRight} label={T.totalIncome} value={projectData.income} colorClass="bg-green-500" section="transactions" formatAsCurrency />
                <DetailCard icon={ArrowDownLeft} label={T.totalExpenses} value={projectData.expense} colorClass="bg-red-500" section="transactions" formatAsCurrency />
                <DetailCard icon={DollarSign} label={T.netBalance} value={projectData.net} colorClass="bg-primary" section="transactions" formatAsCurrency />
                <DetailCard icon={Briefcase} label={T.projectEmployees} value={projectData.employeeCount} colorClass="bg-purple-500" section="employees" />
                <DetailCard icon={Wrench} label={T.projectEquipment} value={projectData.equipmentCount} colorClass="bg-orange-500" section="equipment" />
                <DetailCard icon={UserCheck} label={T.todaysAttendance} value={projectData.todaysAttendance} colorClass="bg-blue-500" section="attendance" />
            </div>

            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden min-h-[300px] flex flex-col">
                <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-card-foreground uppercase tracking-widest flex items-center gap-2">
                        {activeSection === 'transactions' && <><DollarSign size={16} className="text-primary"/> {T.recentProjectTransactions}</>}
                        {activeSection === 'employees' && <><Users size={16} className="text-purple-500"/> {T.projectEmployees}</>}
                        {activeSection === 'equipment' && <><Wrench size={16} className="text-orange-500"/> {T.projectEquipment}</>}
                        {activeSection === 'attendance' && <><UserCheck size={16} className="text-blue-500"/> {T.todaysAttendance}</>}
                    </h3>
                </div>
                
                <div className="flex-1 overflow-x-auto custom-scrollbar">
                    {activeSection === 'transactions' && (
                        <table className="w-full text-sm">
                            <tbody className="divide-y divide-border">
                                {projectData.recentTransactions.length > 0 ? projectData.recentTransactions.map(t => (
                                    <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="p-4 text-muted-foreground font-mono text-xs whitespace-nowrap">{t.date}</td>
                                        <td className="p-4 font-medium text-foreground">{t.description}</td>
                                        <td className="p-4"><span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${t.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{t.category}</span></td>
                                        <td className={`p-4 text-right font-bold font-mono ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                            {t.type === 'income' ? '+' : '-'}৳{Number(t.amount || 0).toLocaleString()}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="4" className="p-12 text-center text-muted-foreground italic">{T.noProjectTransactions}</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}

                    {activeSection === 'employees' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                            {projectData.employees.length > 0 ? projectData.employees.map(emp => (
                                <div 
                                    key={emp.id} 
                                    onClick={() => { onClose(); onNavigate('employees', { employeeId: emp.id }); }}
                                    className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-transparent hover:border-primary/30 hover:bg-card transition-all cursor-pointer group shadow-sm"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border-2 border-card">
                                            {emp.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{emp.name}</p>
                                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{emp.role}</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                </div>
                            )) : (
                                <div className="col-span-full p-12 text-center text-muted-foreground italic">No employees assigned to this project.</div>
                            )}
                        </div>
                    )}

                    {activeSection === 'equipment' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                            {projectData.equipment.length > 0 ? projectData.equipment.map(eq => (
                                <div 
                                    key={eq.id} 
                                    onClick={() => { onClose(); onNavigate('workforce', { tab: 'equipment', equipmentId: eq.id }); }}
                                    className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-transparent hover:border-orange-300 hover:bg-card transition-all cursor-pointer group shadow-sm"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                                            <Wrench size={16}/>
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-foreground group-hover:text-orange-600 transition-colors">{eq.name}</p>
                                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{eq.category} • {eq.status}</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                </div>
                            )) : (
                                <div className="col-span-full p-12 text-center text-muted-foreground italic">No equipment assigned to this project.</div>
                            )}
                        </div>
                    )}

                    {activeSection === 'attendance' && (
                        <div className="space-y-2 p-4">
                            {projectData.attendance.length > 0 ? projectData.attendance.map(att => {
                                const emp = employees.find(e => e.id === att.employeeId);
                                return (
                                    <div key={att.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-border/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                                {emp?.name?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-foreground">{emp?.name || 'Unknown'}</p>
                                                <p className="text-[10px] text-muted-foreground font-medium uppercase">{att.status} • {att.checkIn || '--:--'}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${att.status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {att.status}
                                        </span>
                                    </div>
                                );
                            }) : (
                                <div className="p-12 text-center text-muted-foreground italic">No attendance records for today.</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const TransactionDetails = ({ transaction, projects, T }) => {
    const linkedProject = transaction.projectId ? projects.find(p => p.id === transaction.projectId) : null;
    
    const DetailRow = ({ label, value, valueClass }) => (
        <div className="flex justify-between items-start py-3 border-b border-border last:border-b-0">
            <span className="text-sm text-muted-foreground w-1/3">{label}</span>
            <span className={`text-sm font-semibold text-foreground text-right w-2/3 ${valueClass || ''}`}>{value}</span>
        </div>
    );

    return (
        <div className="space-y-1">
            <DetailRow label={T.description} value={transaction.description} />
            <DetailRow 
                label={T.amount} 
                value={`৳${Number(transaction.amount || 0).toLocaleString()}`} 
                valueClass={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}
            />
            <DetailRow label={T.date} value={transaction.date} />
            <DetailRow label={T.type} value={<span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${transaction.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{T[transaction.type]}</span>} />
            <DetailRow label={T.category} value={transaction.category} />
            <DetailRow label={T.paymentMethod} value={transaction.paymentMethod} />
            <DetailRow label={T.projectContext} value={linkedProject ? linkedProject.name : T.general} />
            {transaction.reference && <DetailRow label={T.refNo} value={transaction.reference} />}
        </div>
    );
};

const EmployeeDetails = ({ employee, projects, T }) => {
     const assignedProject = employee.projectId ? projects.find(p => p.id === employee.projectId) : null;
     
     const DetailRow = ({ label, value }) => (
        <div className="flex justify-between items-start py-3 border-b border-border last:border-b-0">
            <span className="text-sm text-muted-foreground w-1/3">{label}</span>
            <span className={`text-sm font-semibold text-foreground text-right w-2/3`}>{value}</span>
        </div>
    );

     return (
        <div className="space-y-2">
            <div className="flex items-center gap-4 mb-4">
                <img src={employee.imageUrl} alt={employee.name} className="w-20 h-20 rounded-full object-cover border-2 border-border shadow-sm"/>
                <div>
                    <h3 className="text-xl font-bold text-card-foreground">{employee.name}</h3>
                    <p className="text-muted-foreground">{employee.role}</p>
                </div>
            </div>
            <DetailRow label={T.status} value={<span className={`px-2 py-0.5 rounded text-xs font-medium ${employee.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>{employee.status}</span>} />
            <DetailRow label={T.phoneNumber} value={employee.phone} />
            <DetailRow label={T.assignedProject} value={assignedProject?.name || T.unassigned} />
            <DetailRow label={T.totalPaid} value={`৳${Number(employee.totalPaid || 0).toLocaleString()}`} />
        </div>
     );
};

// --- END: DATA DISPLAY COMPONENTS ---

// --- Enhanced Chart Component ---
const FinancialTrendChart = ({ transactions, T }) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const trendData = useMemo(() => {
        const data = Array.from({ length: 30 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            return {
                date: dateString,
                income: 0,
                expense: 0,
            };
        }).reverse();

        transactions.forEach(t => {
            const tDate = t.date;
            const entry = data.find(d => d.date === tDate);
            if (entry) {
                if (t.type === 'income') entry.income += Number(t.amount || 0);
                if (t.type === 'expense') entry.expense += Number(t.amount || 0);
            }
        });
        
        const max = Math.max(1, ...data.map(d => Math.max(d.income, d.expense)));

        return data.map(d => ({
            ...d,
            label: new Date(d.date).getDate(),
            incomeHeight: (d.income / max) * 100,
            expenseHeight: (d.expense / max) * 100,
        }));

    }, [transactions]);

    return (
        <div className="bg-card p-8 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="font-bold text-lg text-card-foreground flex items-center gap-2">
                        {T.financialTrends}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">Last 30 days performance</p>
                </div>
                <div className="flex gap-4 text-xs font-medium">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        {T.income}
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/20">
                        <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                        {T.expense}
                    </div>
                </div>
            </div>

            <div 
                className="relative flex h-64 items-end gap-1 sm:gap-2 border-b border-border/60 pb-1"
                onMouseLeave={() => setHoveredIndex(null)}
            >
                {/* Refined Grid Background */}
                <div className="absolute inset-0 flex flex-col justify-between -z-10 pointer-events-none pb-1">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-full border-b border-dashed border-border/30 h-0"></div>
                    ))}
                </div>

                {trendData.map((d, i) => (
                    <div 
                        key={i} 
                        className={`flex-1 h-full flex flex-col justify-end items-center group relative transition-all duration-300 ${hoveredIndex !== null && hoveredIndex !== i ? 'opacity-30 scale-95' : 'opacity-100 scale-100'}`}
                        onMouseEnter={() => setHoveredIndex(i)}
                    >
                        {/* Custom Tooltip */}
                        <div className={`absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-max min-w-[140px] bg-slate-900/95 backdrop-blur text-white p-3 rounded-xl shadow-xl z-20 pointer-events-none transition-all duration-200 transform origin-bottom ${hoveredIndex === i ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-90'}`}>
                            <p className="text-xs font-medium text-slate-400 mb-2 border-b border-slate-700 pb-1">
                                {new Date(d.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                            </p>
                            <div className="space-y-1">
                                <div className="flex justify-between items-center gap-3 text-xs">
                                    <span className="text-emerald-400">In:</span>
                                    <span className="font-mono font-bold">৳{d.income.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center gap-3 text-xs">
                                    <span className="text-rose-400">Out:</span>
                                    <span className="font-mono font-bold">৳{d.expense.toLocaleString()}</span>
                                </div>
                            </div>
                            {/* Arrow */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900/95"></div>
                        </div>

                        {/* Bars Container */}
                        <div className="w-full h-full flex items-end justify-center gap-[4px] px-[1px]">
                            {/* Income Bar */}
                            <div 
                                className="w-full bg-gradient-to-t from-emerald-500/80 to-emerald-400 rounded-t-[4px] shadow-[0_0_10px_rgba(16,185,129,0.2)] transition-all duration-500 ease-out hover:brightness-110"
                                style={{ height: `${Math.max(d.incomeHeight, 2)}%` }}
                            ></div>
                            {/* Expense Bar */}
                            <div 
                                className="w-full bg-gradient-to-t from-rose-500/80 to-rose-400 rounded-t-[4px] shadow-[0_0_10px_rgba(244,63,94,0.2)] transition-all duration-500 ease-out hover:brightness-110"
                                style={{ height: `${Math.max(d.expenseHeight, 2)}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
            {/* X-Axis Labels - simplified */}
            <div className="flex justify-between mt-2 px-2">
                <span className="text-xs text-muted-foreground">{new Date(trendData[0].date).toLocaleDateString(undefined, {day: 'numeric', month:'short'})}</span>
                <span className="text-xs text-muted-foreground">{new Date(trendData[Math.floor(trendData.length/2)].date).toLocaleDateString(undefined, {day: 'numeric', month:'short'})}</span>
                <span className="text-xs text-muted-foreground">{T.today || 'Today'}</span>
            </div>
        </div>
    );
};

const Dashboard = ({ projects, clients, transactions, employees, equipment, attendance, materials, onNavigate, onQuickAdd }) => {
    const { language, translations, userName } = useContext(SettingsContext);
    const T = translations[language];
    const [greeting, setGreeting] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const [modalContent, setModalContent] = useState(null);
    const [showAllActivity, setShowAllActivity] = useState(false);
    const [metricModal, setMetricModal] = useState(null);
    const [weather, setWeather] = useState(null);

    useEffect(() => {
        const getGreeting = () => {
            const hour = new Date().getHours();
            const name = userName || 'Admin';
            if (hour >= 0 && hour < 4) return T.goodMidnight(name);
            if (hour >= 4 && hour < 6) return T.goodEarlyMorning(name);
            if (hour >= 6 && hour < 12) return T.goodMorning(name);
            if (hour >= 12 && hour < 16) return T.goodAfternoon(name);
            if (hour >= 16 && hour < 18) return T.goodLateAfternoon(name);
            if (hour >= 18 && hour < 21) return T.goodEvening(name);
            if (hour >= 21 && hour < 24) return T.goodNight(name);
            return T.goodMorning(name);
        };
        setGreeting(getGreeting());
        
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        setCurrentDate(new Date().toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', options));

        const hour = new Date().getHours();
        let weatherConfig = {};
        if (hour >= 0 && hour < 4) {
            weatherConfig = { period: T.weather_midnight, temp: '24°', desc: T.desc_midnight, icon: Moon, bg: 'from-slate-900 to-indigo-950', color: 'text-indigo-200' };
        } else if (hour >= 4 && hour < 6) {
            weatherConfig = { period: T.weather_dawn, temp: '22°', desc: T.desc_dawn, icon: Sunrise, bg: 'from-orange-400 to-rose-500', color: 'text-orange-100' };
        } else if (hour >= 6 && hour < 12) {
            weatherConfig = { period: T.weather_morning, temp: '28°', desc: T.desc_morning, icon: Sun, bg: 'from-sky-400 to-blue-500', color: 'text-sky-100' };
        } else if (hour >= 12 && hour < 16) {
            weatherConfig = { period: T.weather_noon, temp: '34°', desc: T.desc_noon, icon: Sun, bg: 'from-blue-400 to-amber-400', color: 'text-blue-50' };
        } else if (hour >= 16 && hour < 18) {
            weatherConfig = { period: T.weather_afternoon, temp: '31°', desc: T.desc_afternoon, icon: CloudSun, bg: 'from-amber-400 to-orange-500', color: 'text-amber-50' };
        } else if (hour >= 18 && hour < 21) {
            weatherConfig = { period: T.weather_evening, temp: '27°', desc: T.desc_evening, icon: Sunset, bg: 'from-rose-500 to-indigo-800', color: 'text-rose-100' };
        } else {
            weatherConfig = { period: T.weather_night, temp: '25°', desc: T.desc_night, icon: Moon, bg: 'from-slate-800 to-slate-950', color: 'text-slate-200' };
        }
        setWeather(weatherConfig);
    }, [T, language, userName]);

    const stats = useMemo(() => {
      const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount || 0), 0);
      const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount || 0), 0);
      const netProfit = income - expense;
      
      const totalProjectBudgets = projects.reduce((acc, p) => acc + Number(p.budget || 0), 0);

      const projectStatus = {
        ongoing: projects.filter(p => p.status === 'Ongoing').length,
        completed: projects.filter(p => p.status === 'Completed').length,
        planned: projects.filter(p => p.status === 'Planned').length,
        total: projects.length
      };
  
      const categoryExpense = {
        materials: transactions.filter(t => t.category === 'materials').reduce((acc, t) => acc + Number(t.amount || 0), 0),
        labor: transactions.filter(t => t.category === 'labor').reduce((acc, t) => acc + Number(t.amount || 0), 0),
        overhead: transactions.filter(t => t.category === 'overhead').reduce((acc, t) => acc + Number(t.amount || 0), 0)
      };
  
      const totalExpenseValue = categoryExpense.materials + categoryExpense.labor + categoryExpense.overhead || 1;

      const projectBudgetVsExpense = projects
        .filter(p => Number(p.budget || 0) > 0)
        .map(p => {
            const projectExpenses = transactions
                .filter(t => t.projectId === p.id && t.type === 'expense')
                .reduce((sum, t) => sum + Number(t.amount || 0), 0);
            const client = clients.find(c => c.id === p.clientId);
            return {
                name: p.name,
                budget: Number(p.budget || 0),
                expense: projectExpenses,
                ratio: p.budget > 0 ? (projectExpenses / p.budget) * 100 : 0,
                clientName: client?.name || 'N/A'
            };
        })
        .sort((a,b) => b.ratio - a.ratio)
        .slice(0, 5);

      const assignedEmployees = employees.filter(e => e.projectId).length;
      const unassignedEmployees = employees.length - assignedEmployees;
      const utilizationRate = employees.length > 0 ? (assignedEmployees / employees.length) * 100 : 0;

      const todayString = new Date().toISOString().split('T')[0];
      const todaysAttendanceCount = attendance.filter(a => a.date === todayString && a.status === 'Present').length;
      const equipmentInUseCount = equipment.filter(e => e.status === 'In Use').length;
      const lowStockMaterialsCount = materials.filter(m => m.currentStock < m.reorderLevel).length;
  
      return { income, expense, netProfit, totalProjectBudgets, projectStatus, categoryExpense, totalExpenseValue, projectBudgetVsExpense, assignedEmployees, unassignedEmployees, utilizationRate, todaysAttendanceCount, equipmentInUseCount, lowStockMaterialsCount };
    }, [transactions, projects, employees, clients, attendance, equipment, materials, T]);
  
    const allActivities = useMemo(() => {
      return [
        ...projects.map(p => ({ type: 'project', data: p, date: p.createdAt })),
        ...employees.map(e => ({ type: 'employee', data: e, date: e.createdAt })),
        ...transactions.map(t => ({ type: 'transaction', data: t, date: t.createdAt }))
      ].sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0));
    }, [projects, employees, transactions]);

    const recentActivity = useMemo(() => allActivities.slice(0, 8), [allActivities]);
  
    const highBudgetProjects = useMemo(() => {
      return projects
        .filter(p => p.status !== 'Completed')
        .sort((a, b) => Number(b.budget || 0) - Number(a.budget || 0))
        .slice(0, 3);
    }, [projects]);
  
    return (
      <div className="space-y-8 animate-fade-in pb-12 max-w-[1600px] mx-auto">
        
        <div className="relative bg-slate-900 rounded-3xl overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

            <div className="relative z-10 px-8 py-10 sm:px-12 sm:py-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <div className="flex items-center gap-2 text-slate-400 mb-2 text-sm font-medium uppercase tracking-wider">
                        <Calendar size={14} />
                        {currentDate}
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">
                        {greeting} <span className="inline-block animate-wave">👋</span>
                    </h1>
                    <p className="text-slate-300 max-w-xl text-lg leading-relaxed opacity-90">
                        {T.dashboardSubtitle(stats.projectStatus.ongoing, employees.filter(e => e.status === 'Active').length)}
                    </p>
                </div>
                <div className="hidden md:block opacity-80 hover:opacity-100 transition-opacity">
                     <Building size={140} className="text-white/5 drop-shadow-lg" />
                </div>
            </div>
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 -mt-8 relative z-20 px-4 sm:px-0">
          <DashboardCard onClick={() => setMetricModal({ type: 'revenue', title: T.totalRevenue })} title={T.totalRevenue} value={stats.income} icon={ArrowUpRight} color="text-emerald-600" bg="bg-white dark:bg-card border-b-4 border-emerald-500 shadow-lg" />
          <DashboardCard onClick={() => setMetricModal({ type: 'expense', title: T.totalExpenses })} title={T.totalExpenses} value={stats.expense} icon={ArrowDownLeft} color="text-rose-600" bg="bg-white dark:bg-card border-b-4 border-rose-500 shadow-lg" />
          <DashboardCard onClick={() => setMetricModal({ type: 'profit', title: T.netProfit })} title={T.netProfit} value={stats.netProfit} icon={Wallet} highlight={true} />
          <DashboardCard onClick={() => setMetricModal({ type: 'assets', title: T.totalAssets })} title={T.totalAssets} value={stats.totalProjectBudgets} icon={Banknote} color="text-amber-600" bg="bg-white dark:bg-card border-b-4 border-amber-500 shadow-lg" label={T.estValue} />
        </div>
  
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-card p-8 rounded-2xl border border-border shadow-sm">
                <h3 className="font-bold text-lg text-card-foreground mb-6 flex items-center gap-2">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600">
                        <Zap size={20} />
                    </div> 
                    {T.quickActions}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <QuickActionButton onClick={() => onQuickAdd('projects')} icon={HardHat} label={T.newProject} color="bg-gradient-to-br from-orange-500 to-amber-600 shadow-orange-500/20" />
                    <QuickActionButton onClick={() => onQuickAdd('employees')} icon={Briefcase} label={T.addEmployee} color="bg-gradient-to-br from-indigo-600 to-violet-700 shadow-indigo-600/20" />
                    <QuickActionButton onClick={() => onQuickAdd('clients')} icon={Users} label={T.addClient} color="bg-gradient-to-br from-blue-600 to-sky-700 shadow-blue-600/20" />
                    <QuickActionButton onClick={() => onQuickAdd('transactions')} icon={Banknote} label={T.recordPayment} color="bg-gradient-to-br from-emerald-600 to-teal-700 shadow-emerald-600/20" />
                </div>
            </div>
  
            <div className="group relative bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-8 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
                <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-white/20 transition-all duration-500"></div>
                
                <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-xl tracking-tight">{T.safetyStatus}</h3>
                            <CheckCircle className="text-emerald-100" size={24} />
                        </div>
                        <p className="text-emerald-50 opacity-90 text-sm font-medium">{T.safetyRecord}</p>
                    </div>

                    <div className="py-6 flex items-baseline gap-2">
                        <span className="text-6xl font-bold tracking-tighter drop-shadow-sm">124</span>
                        <span className="text-sm font-medium text-emerald-100 uppercase tracking-widest">{T.daysWithoutIncident}</span>
                    </div>

                    <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden backdrop-blur-sm">
                        <div className="bg-white h-full w-[85%] rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                    </div>
                </div>
            </div>
        </div>
        
        <FinancialTrendChart transactions={transactions} T={T} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-card p-8 rounded-2xl border border-border shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-card-foreground flex items-center gap-2">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600">
                             <DollarSign size={20} /> 
                        </div>
                        {T.projectBudgetTracker}
                    </h3>
                    <button className="text-muted-foreground hover:text-foreground">
                        <MoreHorizontal size={20} />
                    </button>
                </div>

                <div className="space-y-6">
                    {stats.projectBudgetVsExpense.map((p, i) => (
                        <div key={i} className="group">
                            <div className="flex justify-between items-end mb-2">
                                <div>
                                    <h4 className="font-semibold text-foreground">{p.name}</h4>
                                    <p className="text-xs text-muted-foreground">{p.clientName}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`block font-bold text-sm ${p.ratio > 100 ? 'text-rose-500' : p.ratio > 80 ? 'text-amber-500' : 'text-emerald-500'}`}>
                                        {p.ratio.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                            
                            <div className="relative w-full bg-muted/50 h-3 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ease-out group-hover:brightness-110 shadow-sm
                                        ${p.ratio > 90 ? 'bg-gradient-to-r from-rose-500 to-red-400' : 
                                          p.ratio > 70 ? 'bg-gradient-to-r from-amber-400 to-orange-400' : 
                                          'bg-gradient-to-r from-emerald-500 to-teal-400'}`} 
                                    style={{ width: `${Math.min(p.ratio, 100)}%` }}>
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-xs mt-2 text-muted-foreground font-mono">
                                <span>Spent: ৳{p.expense.toLocaleString()}</span>
                                <span>Budget: ৳{p.budget.toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                    {stats.projectBudgetVsExpense.length === 0 && (
                        <div className="text-center py-10 opacity-50">
                             <PieChart size={40} className="mx-auto mb-2" />
                             <p>{T.noProjectsToTrack}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-card p-8 rounded-2xl border border-border shadow-sm flex flex-col hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="font-bold text-lg text-card-foreground flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg">
                            <Users size={20} /> 
                        </div>
                        {T.workforceAllocation}
                    </h3>
                    <button 
                        onClick={() => onNavigate('employees')}
                        className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-800/50 uppercase tracking-widest hover:bg-indigo-100 transition-colors"
                    >
                        View Directory
                    </button>
                </div>
                
                <div className="flex-1 flex flex-col items-center gap-8">
                    <div className="relative w-40 h-48 flex items-center justify-center group cursor-pointer" onClick={() => onNavigate('employees')}>
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="2.5" />
                            <circle 
                                cx="18" cy="18" r="16" fill="none" stroke="url(#indigoGradient)" strokeWidth="3" strokeLinecap="round" 
                                strokeDasharray={`${stats.utilizationRate}, 100`} 
                                className="drop-shadow-sm transition-all duration-1000 ease-in-out group-hover:stroke-[3.5]"
                            />
                            <defs>
                                <linearGradient id="indigoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#6366f1" />
                                    <stop offset="100%" stopColor="#a855f7" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{Math.round(stats.utilizationRate)}%</span>
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Utilized</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full">
                        <button 
                            onClick={() => onNavigate('employees')}
                            className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50 flex flex-col gap-1 text-left group hover:border-indigo-200 transition-all hover:bg-white dark:hover:bg-slate-900"
                        >
                            <div className="flex items-center justify-between mb-1">
                                <UserPlus size={16} className="text-indigo-500" />
                                <ChevronRight size={12} className="text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                            </div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{T.assigned}</p>
                            <p className="text-xl font-black text-slate-900 dark:text-white">{stats.assignedEmployees}</p>
                        </button>

                        <button 
                            onClick={() => onNavigate('workforce', { tab: 'attendance' })}
                            className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50 flex flex-col gap-1 text-left group hover:border-emerald-200 transition-all hover:bg-white dark:hover:bg-slate-900"
                        >
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-1.5">
                                    <ShieldCheck size={16} className="text-emerald-500" />
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                </div>
                                <ChevronRight size={12} className="text-slate-300 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                            </div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Attendance</p>
                            <p className="text-xl font-black text-slate-900 dark:text-white">{stats.todaysAttendanceCount}</p>
                        </button>

                        <button 
                            onClick={() => onNavigate('workforce', { tab: 'equipment' })}
                            className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50 flex flex-col gap-1 text-left group hover:border-orange-200 transition-all hover:bg-white dark:hover:bg-slate-900"
                        >
                            <div className="flex items-center justify-between mb-1">
                                <Wrench size={16} className="text-orange-500" />
                                <ChevronRight size={12} className="text-slate-300 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
                            </div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">In Use</p>
                            <p className="text-xl font-black text-slate-900 dark:text-white">{stats.equipmentInUseCount}</p>
                        </button>

                        <button 
                            onClick={() => onNavigate('workforce', { tab: 'materialManagement' })}
                            className={`p-4 rounded-2xl border flex flex-col gap-1 text-left group transition-all
                                ${stats.lowStockMaterialsCount > 0 
                                    ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800/50' 
                                    : 'bg-slate-50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800/50'}
                                hover:bg-white dark:hover:bg-slate-900 hover:border-rose-200
                            `}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <Archive size={16} className={stats.lowStockMaterialsCount > 0 ? 'text-rose-500' : 'text-slate-500'} />
                                {stats.lowStockMaterialsCount > 0 && <AlertTriangle size={14} className="text-rose-500 animate-bounce" />}
                                <ChevronRight size={12} className="text-slate-300 group-hover:text-rose-400 group-hover:translate-x-1 transition-all" />
                            </div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Low Stock</p>
                            <p className={`text-xl font-black ${stats.lowStockMaterialsCount > 0 ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>{stats.lowStockMaterialsCount}</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
  
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-card p-8 rounded-2xl border border-border shadow-sm">
            <h3 className="font-bold text-lg text-card-foreground mb-6 flex items-center gap-2">
                <HardHat size={20} className="text-blue-500" /> {T.projectStatus}
            </h3>
            <div className="space-y-6">
              <StatusRow label={T.ongoingProjects} count={stats.projectStatus.ongoing} total={stats.projectStatus.total} color="bg-orange-500" />
              <StatusRow label={T.completedProjects} count={stats.projectStatus.completed} total={stats.projectStatus.total} color="bg-emerald-500" />
              <StatusRow label={T.plannedProjects} count={stats.projectStatus.planned} total={stats.projectStatus.total} color="bg-slate-400" />
            </div>
          </div>
  
          <div className="bg-card p-8 rounded-2xl border border-border shadow-sm">
            <h3 className="font-bold text-lg text-card-foreground mb-6 flex items-center gap-2">
              <TrendingUp size={20} className="text-rose-500" /> {T.expenseBreakdown}
            </h3>
            <div className="space-y-5">
              <ExpenseBar label={T.rawMaterials} amount={stats.categoryExpense.materials} total={stats.totalExpenseValue} color="bg-rose-500" />
              <ExpenseBar label={T.laborCost} amount={stats.categoryExpense.labor} total={stats.totalExpenseValue} color="bg-purple-500" />
              <ExpenseBar label={T.overheadOther} amount={stats.categoryExpense.overhead} total={stats.totalExpenseValue} color="bg-gray-500" />
            </div>
            <div className="mt-8 pt-6 border-t border-border/50 flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-medium">{T.totalExpenses}</span>
              <span className="font-bold text-lg text-foreground">৳{stats.expense.toLocaleString()}</span>
            </div>
          </div>
  
          <div className="bg-card p-8 rounded-2xl border border-border shadow-sm">
            <div className="flex justify-between items-start mb-6">
                <h3 className="font-bold text-lg text-card-foreground flex items-center gap-2">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600">
                        <Users size={20}/>
                    </div>
                    {T.workforce}
                </h3>
                <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-md">
                    {employees.filter(e => e.status === 'Active').length} Active
                </span>
            </div>
            
            <div className="flex items-center gap-5 mb-8">
              <div className="w-20 h-20 rounded-full border-[6px] border-purple-100 dark:border-purple-900/30 flex items-center justify-center text-3xl font-bold text-purple-600 bg-purple-50 dark:bg-transparent">
                {employees.length}
              </div>
              <div>
                <p className="font-bold text-foreground text-lg">{T.totalEmployees}</p>
                <p className="text-sm text-muted-foreground">Registered on platform</p>
              </div>
            </div>
            
            <div className="space-y-3">
               <div className="bg-slate-50 dark:bg-slate-900/20 p-4 rounded-xl flex justify-between items-center border border-slate-100 dark:border-slate-800/50">
                  <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">{T.siteEngineers}</span>
                  </div>
                  <span className="font-bold text-foreground">{employees.filter(e => e.role === 'Site Engineer').length}</span>
               </div>
               <div className="bg-slate-50 dark:bg-slate-900/20 p-4 rounded-xl flex justify-between items-center border border-slate-100 dark:border-slate-800/50">
                  <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">{T.masonsAndLabor}</span>
                  </div>
                  <span className="font-bold text-foreground">{employees.filter(e => e.role?.includes('Mason') || e.role?.includes('Labor')).length}</span>
               </div>
            </div>
          </div>
        </div>
  
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-card p-8 rounded-2xl border border-border shadow-sm">
             <div className="flex justify-between items-center mb-8">
              <h3 className="font-bold text-lg text-card-foreground flex items-center gap-2">
                <Activity size={20} className="text-blue-500" /> {T.recentActivity}
              </h3>
              <button onClick={() => setShowAllActivity(true)} className="text-sm text-primary font-semibold hover:underline decoration-2 underline-offset-4">{T.viewAll}</button>
             </div>
             
             <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-3 space-y-8 pl-8 py-2">
               {recentActivity.map((act, idx) => (
                 <div key={idx} onClick={() => setModalContent({ type: act.type, data: act.data })} className="relative group cursor-pointer">
                   <div className={`absolute -left-[41px] top-1 w-6 h-6 rounded-full border-4 border-card flex items-center justify-center transition-transform group-hover:scale-110 
                     ${act.type === 'transaction' ? (act.data.type === 'income' ? 'bg-emerald-500 shadow-emerald-200' : 'bg-rose-500 shadow-rose-200') : 
                       act.type === 'project' ? 'bg-orange-500 shadow-orange-200' : 'bg-purple-500 shadow-purple-200'}`}>
                   </div>
                   
                   <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                {
                                act.type === 'transaction' ? `${act.data.type === 'income' ? T.income : T.expense} ৳${Number(act.data.amount || 0).toLocaleString()} • ${act.data.description}` :
                                act.type === 'project' ? `${T.newProject} "${act.data.name}"` :
                                `${T.addEmployee} "${act.data.name}"`
                                }
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 font-medium">
                                {act.type === 'project' ? 'Project initiated successfully' : act.type === 'employee' ? 'Joined the team' : act.data.category}
                            </p>
                        </div>
                        <span className="text-xs font-mono text-muted-foreground whitespace-nowrap bg-muted px-2 py-1 rounded">
                            {act.date?.seconds ? new Date(act.date.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
                        </span>
                   </div>
                 </div>
               ))}
               {recentActivity.length === 0 && <p className="text-muted-foreground text-center italic">{T.noRecentActivity}</p>}
             </div>
          </div>
  
          <div className="space-y-8">
            <div className="bg-card p-8 rounded-2xl border border-border shadow-sm">
              <h3 className="font-bold text-lg text-card-foreground mb-6 flex items-center gap-2">
                <TrendingUp size={20} className="text-emerald-500" /> {T.highValueProjects}
              </h3>
              <div className="space-y-4">
                 {highBudgetProjects.map(p => {
                   const client = clients.find(c => c.id === p.clientId);
                   return (
                    <div key={p.id} onClick={() => setModalContent({ type: 'project', data: p })} className="p-4 bg-muted/30 hover:bg-muted rounded-xl border border-transparent hover:border-border transition-all cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-foreground truncate max-w-[150px]">{p.name}</h4>
                            <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${p.status === 'Ongoing' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>{p.status}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1"><UserCheck size={12}/> {client?.name || 'Unknown'}</p>
                        <div className="flex justify-between items-end border-t border-border/40 pt-2 mt-2">
                            <span className="text-xs text-muted-foreground">{T.budget}</span>
                            <span className="font-mono font-bold text-foreground">৳{Number(p.budget || 0).toLocaleString()}</span>
                        </div>
                    </div>
                   );
                 })}
                 {highBudgetProjects.length === 0 && <p className="text-sm text-muted-foreground">{T.noProjectsData}</p>}
              </div>
            </div>
  
            {weather && (
                <div className={`relative bg-gradient-to-tr ${weather.bg} text-white p-8 rounded-2xl shadow-lg overflow-hidden group transition-all duration-700`}>
                   <div className="relative z-10">
                     <div className="flex justify-between items-start mb-6">
                        <div>
                           <h3 className="font-bold text-lg">{T.siteWeather} ({weather.period})</h3>
                           <p className={`${weather.color} text-sm font-medium flex items-center gap-1`}><Building size={12}/> {T.locationDhaka}</p>
                        </div>
                        <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                            <weather.icon className={`text-yellow-300 ${weather.icon === Sun ? 'animate-[spin_10s_linear_infinite]' : ''}`} size={24} />
                        </div>
                     </div>
                     <div className="flex items-end gap-2">
                        <span className="text-5xl font-bold tracking-tighter">{weather.temp}</span>
                        <span className="text-xl font-medium mb-1">C</span>
                     </div>
                     <p className={`${weather.color} mt-2 font-medium`}>{weather.desc}</p>
                   </div>
                   <weather.icon size={140} className="absolute -bottom-10 -right-10 text-yellow-300 opacity-20 group-hover:opacity-30 transition-opacity duration-700 rotate-12" />
                </div>
            )}
          </div>
        </div>
        
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-8 border-b border-border flex justify-between items-center bg-muted/20">
            <h3 className="font-bold text-lg text-card-foreground">{T.latestFinancialRecords}</h3>
            <button onClick={() => onNavigate('finance')} className="text-sm font-medium text-primary hover:bg-primary/10 px-4 py-2 rounded-lg transition-colors">{T.viewAll}</button>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground uppercase tracking-wider text-xs font-semibold">
                <tr>
                  <th className="px-8 py-5">{T.date}</th>
                  <th className="px-8 py-5">{T.description}</th>
                  <th className="px-8 py-5">{T.category}</th>
                  <th className="px-8 py-5 text-right">{T.amount}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.slice(0, 5).map(t => (
                  <tr key={t.id} onClick={() => setModalContent({ type: 'transaction', data: t })} className="group hover:bg-muted/30 transition-colors cursor-pointer">
                    <td className="px-8 py-5 text-muted-foreground font-mono text-xs">{t.date}</td>
                    <td className="px-8 py-5 font-medium text-foreground group-hover:text-primary transition-colors">{t.description}</td>
                    <td className="px-8 py-5">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize border border-slate-200 dark:border-slate-700">
                            {t.category}
                        </span>
                    </td>
                    <td className={`px-8 py-5 text-right font-bold font-mono ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {t.type === 'income' ? '+' : '-'}৳{Number(t.amount || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && <tr><td colSpan="4" className="p-10 text-center text-muted-foreground italic">{T.noTransactionsRecorded}</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Standardized Dashboard Modals with Full Screen Blur */}
        {modalContent && (
            <Modal
                title={
                    modalContent.type === 'project' ? T.projectReport :
                    modalContent.type === 'transaction' ? T.editTransaction :
                    modalContent.type === 'employee' ? T.editEmployee :
                    'Details'
                }
                onClose={() => setModalContent(null)}
                size={modalContent.type === 'project' ? 'max-w-5xl' : 'max-w-2xl'}
            >
                {modalContent.type === 'project' && <ProjectPopupDetails project={modalContent.data} T={T} transactions={transactions} employees={employees} equipment={equipment} attendance={attendance} onNavigate={onNavigate} onClose={() => setModalContent(null)} />}
                {modalContent.type === 'transaction' && <TransactionDetails transaction={modalContent.data} T={T} projects={projects} />}
                {modalContent.type === 'employee' && <EmployeeDetails employee={modalContent.data} projects={projects} T={T} />}
            </Modal>
        )}

        {showAllActivity && (
            <Modal 
                title={T.recentActivity} 
                onClose={() => setShowAllActivity(false)}
                size="max-w-3xl"
            >
                <ActivityInfiniteList 
                    activities={allActivities} 
                    T={T} 
                    language={language}
                />
            </Modal>
        )}

        {metricModal && (
            <Modal
                title={metricModal.title}
                onClose={() => setMetricModal(null)}
                size="max-w-3xl"
            >
                <div className="space-y-6">
                    <div className="bg-primary/5 border border-primary/20 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">{metricModal.title}</p>
                        <p className="text-4xl font-extrabold text-primary tracking-tighter">
                            ৳{
                                metricModal.type === 'revenue' ? stats.income.toLocaleString() :
                                metricModal.type === 'expense' ? stats.expense.toLocaleString() :
                                metricModal.type === 'profit' ? stats.netProfit.toLocaleString() :
                                stats.totalProjectBudgets.toLocaleString()
                            }
                        </p>
                        {metricModal.type === 'profit' && (
                            <div className="flex gap-4 mt-4 text-xs font-bold">
                                <span className="text-emerald-600">In: ৳{stats.income.toLocaleString()}</span>
                                <span className="text-rose-600">Out: ৳{stats.expense.toLocaleString()}</span>
                            </div>
                        )}
                    </div>

                    <MetricDataList 
                        data={
                            metricModal.type === 'revenue' ? transactions.filter(t => t.type === 'income') :
                            metricModal.type === 'expense' ? transactions.filter(t => t.type === 'expense') :
                            metricModal.type === 'profit' ? transactions :
                            projects
                        }
                        type={metricModal.type === 'assets' ? 'project' : 'transaction'}
                        T={T}
                        language={language}
                        projects={projects}
                    />
                </div>
            </Modal>
        )}
      </div>
    );
};
  
export default Dashboard;
