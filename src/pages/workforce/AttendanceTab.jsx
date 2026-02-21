import React, { useState, useMemo, useContext } from 'react';
import { SettingsContext } from '@/context/SettingsContext';
import { Plus, Edit, Trash2 } from 'lucide-react';

// ডিফল্ট ভ্যালু সেট করা হয়েছে: attendance = [], employees = [], projects = [], T = {}
const AttendanceTab = ({ attendance = [], employees = [], projects = [], T = {}, onOpenModal, onDelete }) => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const records = useMemo(() => {
        // attendance.filter এর আগে Optional Chaining (?) দেওয়া হয়েছে
        return attendance?.filter(a => a.date === selectedDate).map(rec => {
            const employee = employees?.find(e => e.id === rec.employeeId);
            const project = projects?.find(p => p.id === rec.projectId);
            return { ...rec, employeeName: employee?.name || 'Unknown', projectName: project?.name || 'Unassigned' };
        }) || [];
    }, [attendance, employees, projects, selectedDate]);

    const StatusBadge = ({ status }) => {
        const styles = {
            Present: 'bg-green-100 text-green-700',
            Absent: 'bg-red-100 text-red-700',
            Late: 'bg-yellow-100 text-yellow-700',
            'Half-day': 'bg-blue-100 text-blue-700',
        };
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status] || 'bg-gray-100 text-gray-700'}`}>{status}</span>;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h3 className="text-xl font-bold text-card-foreground">{T.dailyAttendanceLog || 'Daily Attendance Log'}</h3>
                <div className="flex items-center gap-3">
                    <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="bg-card border border-border px-3 py-2 rounded-lg text-sm text-foreground focus:ring-2 focus:ring-primary outline-none"/>
                    <button onClick={() => onOpenModal?.('mark_attendance')} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2"><Plus size={16}/> {T.markAttendance || 'Mark Attendance'}</button>
                </div>
            </div>
            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted text-muted-foreground">
                            <tr>
                                <th className="p-4 font-medium">{T.worker || 'Worker'}</th>
                                <th className="p-4 font-medium">{T.projects || 'Projects'}</th>
                                <th className="p-4 font-medium">{T.status || 'Status'}</th>
                                <th className="p-4 font-medium">{T.checkIn || 'Check In'}</th>
                                <th className="p-4 font-medium">{T.checkOut || 'Check Out'}</th>
                                <th className="p-4 font-medium">{T.overtime || 'Overtime'} ({T.hours || 'Hours'})</th>
                                <th className="p-4 font-medium text-right">{T.actions || 'Actions'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {records.length > 0 ? records.map(rec => (
                                <tr key={rec.id} className="group hover:bg-muted/30 transition-colors">
                                    <td className="p-4 font-semibold text-foreground">{rec.employeeName}</td>
                                    <td className="p-4 text-muted-foreground">{rec.projectName}</td>
                                    <td className="p-4"><StatusBadge status={rec.status} /></td>
                                    <td className="p-4 text-muted-foreground font-mono">{rec.checkIn || '--:--'}</td>
                                    <td className="p-4 text-muted-foreground font-mono">{rec.checkOut || '--:--'}</td>
                                    <td className="p-4 text-right font-semibold text-primary">{rec.overtime ? rec.overtime.toFixed(1) : '0.0'}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => onOpenModal?.('edit_attendance', rec)} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"><Edit size={14} /></button>
                                            <button onClick={() => onDelete?.(rec.id)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="7" className="text-center p-12 text-muted-foreground">{T.noAttendanceRecords || 'No attendance records found.'}</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AttendanceTab;