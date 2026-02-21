import React, { useState, useMemo, useContext } from 'react';
import { SettingsContext } from '@/context/SettingsContext';
import { 
    FileText,
    Download,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

const PayrollTab = ({ payrollData, employees, attendance, T, onOpenPayslip }) => {
    const { payrollRates, overtimeMultiplier } = useContext(SettingsContext);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const handleMonthChange = (offset) => {
        setCurrentMonth(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
    };

    const payrollSummary = useMemo(() => {
        return employees.map(emp => {
            // Pull the base salary from customized Settings
            const baseSalary = payrollRates[emp.role] || 20000;
            
            const monthlyAttendance = attendance.filter(a => {
                const attDate = new Date(a.date);
                return a.employeeId === emp.id && 
                       attDate.getFullYear() === currentMonth.getFullYear() &&
                       attDate.getMonth() === currentMonth.getMonth();
            });

            const overtimeHours = monthlyAttendance.reduce((sum, rec) => sum + (rec.overtime || 0), 0);
            const absentDays = monthlyAttendance.filter(rec => rec.status === 'Absent').length;

            const dailyRate = baseSalary / 30;
            const hourlyRate = dailyRate / 8;
            
            // Apply the overtime multiplier from settings
            const overtimePay = overtimeHours * hourlyRate * (overtimeMultiplier || 1.5);
            const absenceDeductions = absentDays * dailyRate;

            const netSalary = baseSalary + overtimePay - absenceDeductions;
            
            const totalPaid = payrollData.filter(t => 
                t.employeeId === emp.id && 
                new Date(t.date).getMonth() === currentMonth.getMonth() && 
                new Date(t.date).getFullYear() === currentMonth.getFullYear()
            ).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
            
            let status = 'Due';
            if (totalPaid >= netSalary && netSalary > 0) status = 'Paid';
            else if (totalPaid > 0) status = 'Partial';

            return {
                ...emp,
                month: currentMonth.toISOString(),
                baseSalary,
                overtimeHours,
                overtimePay,
                absentDays,
                absenceDeductions,
                netSalary,
                totalPaid,
                status
            }
        });
    }, [payrollData, employees, attendance, currentMonth, payrollRates, overtimeMultiplier]);
    
     const StatusBadge = ({ status }) => {
        const styles = {
            Paid: 'bg-green-100 text-green-700',
            Due: 'bg-red-100 text-red-700',
            Partial: 'bg-yellow-100 text-yellow-700',
        };
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{T[`status${status}`]}</span>;
    };

    const generateCSV = () => {
        const headers = ['Employee Name', 'Role', 'Month', 'Base Salary', 'Overtime Pay', 'Deductions', 'Net Salary', 'Status'];
        const rows = payrollSummary.map(p => [
            p.name,
            p.role,
            currentMonth.toLocaleString(T.locale, { month: 'long', year: 'numeric'}),
            p.baseSalary.toFixed(2),
            p.overtimePay.toFixed(2),
            p.absenceDeductions.toFixed(2),
            p.netSalary.toFixed(2),
            p.status
        ]);

        let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `payroll_${currentMonth.getFullYear()}_${currentMonth.getMonth()+1}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h3 className="text-xl font-bold text-card-foreground">{T.payrollOverview}</h3>
                 <div className="flex items-center gap-3">
                    <div className="flex items-center bg-card border border-border rounded-lg">
                        <button onClick={() => handleMonthChange(-1)} className="p-2 border-r border-border hover:bg-accent"><ChevronLeft size={16}/></button>
                        <span className="px-4 text-sm font-semibold w-36 text-center">{currentMonth.toLocaleString(T.locale, { month: 'long', year: 'numeric' })}</span>
                        <button onClick={() => handleMonthChange(1)} className="p-2 border-l border-border hover:bg-accent"><ChevronRight size={16}/></button>
                    </div>
                    <button onClick={generateCSV} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2"><Download size={16}/> {T.generatePayslips}</button>
                </div>
            </div>
             <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted text-muted-foreground">
                            <tr>
                                <th className="p-4 font-medium">{T.employee}</th>
                                <th className="p-4 font-medium text-right">{T.baseSalary}</th>
                                <th className="p-4 font-medium text-right">{T.overtimePay}</th>
                                <th className="p-4 font-medium text-right">{T.deductions}</th>
                                <th className="p-4 font-medium text-right">{T.netSalary}</th>
                                <th className="p-4 font-medium">{T.paymentStatus}</th>
                                <th className="p-4 font-medium text-right">{T.actions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {payrollSummary.map(p => (
                                <tr key={p.id}>
                                    <td className="p-4 font-semibold text-foreground">{p.name}</td>
                                    <td className="p-4 text-right font-mono text-muted-foreground">৳{p.baseSalary.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                    <td className="p-4 text-right font-mono text-green-600">+ ৳{p.overtimePay.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                    <td className="p-4 text-right font-mono text-red-500">- ৳{p.absenceDeductions.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                    <td className="p-4 text-right font-mono font-bold text-primary">৳{p.netSalary.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                    <td className="p-4"><StatusBadge status={p.status}/></td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => onOpenPayslip(p)} className="p-2 text-muted-foreground hover:text-primary"><FileText size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PayrollTab;