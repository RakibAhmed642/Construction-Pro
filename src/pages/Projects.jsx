'use client'; // এটি যোগ করা হয়েছে

import React, { useState, useContext, useMemo, useEffect, useRef } from 'react';
import { 
  Plus, Trash2, Edit, MapPin, HardHat, Calendar, 
  ChevronRight, CheckSquare, Flag, Users, Clock, 
  LayoutGrid, List, BarChart3, Search, AlertCircle, 
  CheckCircle2, X, Circle, MoreHorizontal, ArrowUp, ArrowDown, ChevronsRight, FolderKanban,
  ZoomIn, ZoomOut, Maximize2, Target, CalendarDays, Check, PauseCircle,
  DollarSign, Briefcase, Wrench, Package, ArrowUpRight, ArrowDownLeft, UserCheck, FileText, Upload, File, Loader2, Download, Eye
} from 'lucide-react';

import { ProjectForm } from '@/components/Forms';
import { SettingsContext } from '@/context/SettingsContext';
import { Modal, Input } from '@/components/UI';


// --- HELPER COMPONENTS ---

const StatusBadge = ({ status, T = {} }) => {
  const styles = {
    Ongoing: "bg-orange-100 text-orange-700 border-orange-200",
    Completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Planned: "bg-primary/10 text-primary border-primary/20",
    Delayed: "bg-red-100 text-red-700 border-red-200",
    'On Hold': "bg-slate-100 text-slate-700 border-slate-200",
  };
  const activeStyle = styles[status] || styles['On Hold'];
  const statusKey = `status${status?.replace(/\s/g, '')}`;

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide border flex items-center gap-1.5 w-fit ${activeStyle}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
      {T[statusKey] || status}
    </span>
  );
};

const ProgressBar = ({ progress, height = "h-2", colorClass = "bg-primary" }) => (
  <div className={`w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ${height}`}>
    <div 
      className={`h-full rounded-full transition-all duration-700 ease-out ${colorClass}`}
      style={{ width: `${Math.max(0, Math.min(100, progress || 0))}%` }}
    />
  </div>
);

// --- TASK EDITING DRAWER ---

const TaskEditDrawer = ({ task, onClose, onSave, T = {} }) => {
  if (!task) return null;

  const [currentTask, setCurrentTask] = useState(task);

  useEffect(() => {
    setCurrentTask(task);
  }, [task]);

  const handleSave = () => {
    onSave(currentTask);
    onClose();
  };

  const priorityOptions = {
    High: { icon: ArrowUp, color: "text-red-500", bg: "bg-red-50 text-red-700 border-red-200" },
    Medium: { icon: ChevronsRight, color: "text-orange-500", bg: "bg-orange-50 text-orange-700 border-orange-200" },
    Low: { icon: ArrowDown, color: "text-emerald-500", bg: "bg-emerald-700 border-emerald-200" },
  };

  const statusOptions = {
    'Not Started': { icon: Circle, color: "text-slate-400" },
    'In Progress': { icon: Clock, color: "text-primary" },
    'Completed': { icon: CheckCircle2, color: "text-emerald-500" },
    'Blocked': { icon: AlertCircle, color: "text-red-500" },
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      <div className="relative z-10 h-full w-full max-w-sm bg-card border-l border-border shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
        <div className="p-5 border-b border-border flex justify-between items-center bg-muted/50">
          <h3 className="text-lg font-bold text-card-foreground">{task && task.id ? (T.editTask || 'Edit Task') : (T.addTask || 'Add Task')}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-accent text-muted-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-8">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{T.taskName || 'Task Name'}</label>
            <input 
              type="text" 
              value={currentTask.name} 
              onChange={(e) => setCurrentTask({...currentTask, name: e.target.value})}
              placeholder="Enter task description..."
              className="w-full px-4 py-3 border border-border bg-background rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm text-sm"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{T.status || 'Status'}</label>
            <div className="grid grid-cols-1 gap-2">
              {Object.keys(statusOptions).map(status => {
                const { icon: Icon, color } = statusOptions[status];
                const isActive = currentTask.status === status;
                return (
                  <button 
                    key={status}
                    onClick={() => setCurrentTask({...currentTask, status: status})}
                    className={`px-4 py-3 rounded-xl flex items-center justify-between border transition-all duration-200 group ${
                      isActive 
                        ? 'bg-primary/10 border-primary ring-1 ring-primary/20' 
                        : 'bg-background border-border hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                       <Icon size={18} className={`${isActive ? color : 'text-slate-400 group-hover:text-slate-600'}`}/>
                       <span className={`font-medium text-sm ${isActive ? 'text-card-foreground' : 'text-muted-foreground'}`}>
                         {T[`taskStatus${status.replace(/\s/g, '')}`] || status}
                       </span>
                    </div>
                    {isActive && <CheckCircle2 size={16} className="text-primary" />}
                  </button>
                )
              })}
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{T.priority || 'Priority'}</label>
            <div className="grid grid-cols-3 gap-3">
              {Object.keys(priorityOptions).map(priority => {
                const { icon: Icon, color, bg } = priorityOptions[priority];
                const isActive = currentTask.priority === priority;
                return (
                  <button 
                    key={priority}
                    onClick={() => setCurrentTask({...currentTask, priority: priority})}
                    className={`py-3 rounded-xl flex flex-col items-center justify-center gap-2 border transition-all duration-200 ${
                      isActive 
                        ? `${bg} ring-1 ring-inset` 
                        : 'bg-background border-border hover:bg-slate-50'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'text-current' : 'text-slate-400'}/>
                    <span className={`font-medium text-xs ${isActive ? 'text-current' : 'text-muted-foreground'}`}>
                        {T[`priority${priority}`] || priority}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-border bg-muted/50">
          <button
            onClick={handleSave}
            className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
          >
            {T.saveChanges || 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MILESTONE EDITING DRAWER ---

const MilestoneEditDrawer = ({ milestone, onClose, onSave, T = {} }) => {
  if (!milestone) return null;

  const [currentMilestone, setCurrentMilestone] = useState(milestone);

  useEffect(() => {
    setCurrentMilestone(milestone);
  }, [milestone]);

  const handleSave = () => {
    onSave(currentMilestone);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      <div className="relative z-10 h-full w-full max-w-sm bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-5 border-b border-border flex justify-between items-center bg-muted/50">
          <h3 className="text-lg font-bold text-card-foreground">{milestone.id ? (T.editMilestone || 'Edit Milestone') : (T.addMilestone || 'Add Milestone')}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-accent text-muted-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-6">
          <div>
            <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{T.milestoneName || 'Milestone Name'}</label>
            <input 
              type="text" 
              value={currentMilestone.name} 
              onChange={(e) => setCurrentMilestone({...currentMilestone, name: e.target.value})}
              placeholder="e.g., Foundation Complete"
              className="mt-2 w-full px-4 py-3 border border-border bg-background rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{T.deadline || 'Deadline'}</label>
            <input 
              type="date" 
              value={currentMilestone.deadline ? new Date(currentMilestone.deadline).toISOString().split('T')[0] : ''}
              onChange={(e) => setCurrentMilestone({...currentMilestone, deadline: e.target.value})}
              className="mt-2 w-full px-4 py-3 border border-border bg-background rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm text-sm"
            />
          </div>
          <div className="flex items-center gap-3 bg-muted p-3 rounded-xl">
             <input
                type="checkbox"
                id="milestoneCompleted"
                checked={currentMilestone.completed}
                onChange={(e) => setCurrentMilestone({...currentMilestone, completed: e.target.checked})}
                className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="milestoneCompleted" className="text-sm font-medium text-foreground">{T.completed || 'Completed'}</label>
          </div>
        </div>

        <div className="p-5 border-t border-border bg-muted/50">
          <button
            onClick={handleSave}
            className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
          >
            {T.saveChanges || 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};


// --- ADVANCED TIMELINE COMPONENT ---

const AdvancedTimeline = ({ projects = [], onProjectSelect, onProjectEdit, onProjectAdd, selectedProject, T = {}, language = 'en', clients = [] }) => {
    const [zoomLevel, setZoomLevel] = useState(0);
    const [todayPosition, setTodayPosition] = useState(null);
    const containerRef = useRef(null);

    const zoomConfig = {
        '-1': { colWidth: 15, fontSize: 'text-[0px]', label: 'Yearly' },
        0: { colWidth: 30, fontSize: 'text-[9px]', label: 'Semesterly' }, 
        1: { colWidth: 50, fontSize: 'text-[10px]', label: 'Quarterly' }, 
        2: { colWidth: 80, fontSize: 'text-[11px]', label: 'Standard' }, 
        3: { colWidth: 140, fontSize: 'text-xs', label: 'Detailed' }   
    };

    const currentConfig = zoomConfig[zoomLevel];

    const timelineData = useMemo(() => {
        const validProjects = projects.filter(p => p.startDate && p.endDate);

        // Fixed range: 2025 to 2040
        const timelineStart = new Date(2025, 0, 1);
        const timelineEnd = new Date(2040, 11, 31, 23, 59, 59);

        const months = [];
        let currentIter = new Date(timelineStart);
        
        while (currentIter <= timelineEnd) {
            months.push(new Date(currentIter));
            const nextMonth = new Date(currentIter.getFullYear(), currentIter.getMonth() + 1, 1);
            currentIter = nextMonth;
        }

        const years = [];
        months.forEach(date => {
            const year = date.getFullYear();
            const existing = years.find(y => y.year === year);
            if (existing) {
                existing.count++;
            } else {
                years.push({ year, count: 1 });
            }
        });

        const totalMonths = months.length;

        const items = validProjects.map(p => {
            const startDate = new Date(p.startDate);
            const endDate = new Date(p.endDate);

            const getMonthPosition = (date, isEnd = false) => {
                const monthsFromStart = (date.getFullYear() - timelineStart.getFullYear()) * 12 + (date.getMonth() - timelineStart.getMonth());
                const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
                
                let dayFraction = isEnd ? date.getDate() / daysInMonth : (date.getDate() - 1) / daysInMonth;
                return monthsFromStart + dayFraction;
            };

            const startPosUnits = getMonthPosition(startDate, false);
            const endPosUnits = getMonthPosition(endDate, true);
            const durationInMonths = endPosUnits - startPosUnits;

            const durationMs = endDate.getTime() - startDate.getTime();
            const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24)) + 1;

            const completedTasks = p.tasks ? p.tasks.filter(t => t.status === 'Completed').length : 0;
            const totalTasks = p.tasks ? p.tasks.length : 0;
            const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
            
            const client = clients.find(c => c.id === p.clientId);
            
            return { ...p, startPosUnits, durationInMonths, progress, durationDays, clientName: client?.name || 'Unknown' };
        });

        return { items, months, years, timelineStart, totalMonths };
    }, [projects, clients]);

    useEffect(() => {
        if (timelineData.timelineStart && timelineData.totalMonths) {
            const today = new Date();
            const start = timelineData.timelineStart;
            
            if (today < start || today > timelineData.months[timelineData.months.length-1]) { 
                setTodayPosition(null); 
                return; 
            }

            const monthsFromStart = (today.getFullYear() - start.getFullYear()) * 12 + (today.getMonth() - start.getMonth());
            const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
            const dayFraction = today.getDate() / daysInMonth;
            
            const posUnits = monthsFromStart + dayFraction;
            setTodayPosition(posUnits);
        }
    }, [timelineData]);

    if (!projects.length || (timelineData.items.length === 0 && projects.length > 0)) {
        return (
             <div className="flex flex-col items-center justify-center h-[400px] bg-muted/50 rounded-xl border border-dashed border-border text-muted-foreground">
                <div className="bg-card p-4 rounded-full shadow-sm mb-4">
                    <BarChart3 size={32} className="opacity-50 text-primary"/>
                </div>
                <p className="font-medium">{T.noProjectsFound || 'No projects found'}</p>
                <p className="text-sm text-muted-foreground mt-1">Add a project with dates to see the timeline.</p>
             </div>
        );
    }

    const SIDEBAR_WIDTH = 280;

    const getMonthLabel = (date) => {
        const monthIndex = date.getMonth();
        const monthName = date.toLocaleString(language === 'bn' ? 'bn-BD' : 'en-GB', { month: 'short' });
        
        if (zoomLevel <= -1) return '';
        if (zoomLevel === 0) {
            return monthIndex % 3 === 0 ? `Q${Math.floor(monthIndex / 3) + 1}` : '';
        }
        if (zoomLevel === 1) {
             return monthName.charAt(0);
        }
        return monthName;
    };

    return (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col h-[700px]">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 text-primary rounded-lg">
                        <Calendar size={20}/>
                    </div>
                    <div>
                        <h3 className="font-bold text-card-foreground leading-tight">{T.projectTimeline || 'Project Timeline'}</h3>
                        <p className="text-xs text-muted-foreground">Dynamic Gantt Chart</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-background rounded-lg border border-border shadow-sm overflow-hidden">
                        <button 
                            onClick={() => setZoomLevel(prev => Math.max(-1, prev - 1))}
                            className="p-2 hover:bg-accent border-r border-border text-muted-foreground"
                            disabled={zoomLevel === -1}
                        >
                            <ZoomOut size={16}/>
                        </button>
                        <span className="px-3 text-xs font-semibold text-muted-foreground w-20 text-center">
                            {currentConfig.label}
                        </span>
                        <button 
                            onClick={() => setZoomLevel(prev => Math.min(3, prev + 1))}
                            className="p-2 hover:bg-accent border-l border-border text-muted-foreground"
                            disabled={zoomLevel === 3}
                        >
                            <ZoomIn size={16}/>
                        </button>
                    </div>

                    <button 
                        onClick={onProjectAdd}
                        className="bg-foreground hover:bg-foreground/90 text-background text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md active:scale-95"
                    >
                        <Plus size={16} /> {T.newProject || 'New Project'}
                    </button>
                </div>
            </div>
            
            <div className="flex-1 overflow-auto relative custom-scrollbar bg-muted/20" ref={containerRef}>
                <div className="flex flex-col min-w-max">
                    
                    <div className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
                        <div className="flex">
                            <div 
                                style={{ width: SIDEBAR_WIDTH }} 
                                className="sticky left-0 z-50 bg-card border-r border-border flex items-end px-6 py-3 shadow-[4px_0_10px_-4px_rgba(0,0,0,0.05)]"
                            >
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{T.projectName || 'Project Name'}</span>
                            </div>

                            <div className="flex-1">
                                <div className="flex border-b border-border">
                                    {timelineData.years.map((y, i) => (
                                        <div 
                                            key={i} 
                                            style={{ width: y.count * currentConfig.colWidth }}
                                            className="px-2 py-1 text-xs font-bold text-muted-foreground border-r border-border bg-muted/50"
                                        >
                                            {y.year}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex">
                                    {timelineData.months.map((m, i) => {
                                        const label = getMonthLabel(m);
                                        return (
                                            <div 
                                                key={i} 
                                                style={{ width: currentConfig.colWidth }}
                                                className={`flex-shrink-0 px-1 py-2 text-center border-r border-border text-[10px] font-semibold uppercase tracking-wider overflow-hidden text-ellipsis whitespace-nowrap
                                                    ${m.getMonth() === new Date().getMonth() && m.getFullYear() === new Date().getFullYear() ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}
                                                    ${label.startsWith('Q') ? 'bg-muted/50 font-bold' : ''}
                                                `}
                                            >
                                                {label}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div 
                            className="absolute inset-0 pointer-events-none flex"
                            style={{ paddingLeft: SIDEBAR_WIDTH }}
                        >
                            {timelineData.months.map((m, i) => (
                                <div 
                                    key={i} 
                                    style={{ width: currentConfig.colWidth }}
                                    className={`h-full border-r border-border/50 flex-shrink-0 ${m.getMonth() % 3 === 0 && zoomLevel <= 1 ? 'border-r-border' : ''}`}
                                ></div>
                            ))}
                            {todayPosition !== null && (
                                <div 
                                    className="absolute top-0 bottom-0 z-30 w-0.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                                    style={{ 
                                        left: SIDEBAR_WIDTH + (todayPosition * currentConfig.colWidth) 
                                    }}
                                >
                                    <div className="absolute top-0 -translate-x-1/2 -mt-1.5 w-3 h-3 rounded-full bg-red-500 border-2 border-card"></div>
                                </div>
                            )}
                        </div>

                        <div className="relative z-10">
                            {timelineData.items.map((p) => (
                                <div 
                                    key={p.id} 
                                    className={`group flex items-center h-[72px] hover:bg-accent/50 transition-colors border-b border-border/50 ${selectedProject?.id === p.id ? 'bg-primary/5' : ''}`}
                                >
                                    <div 
                                        onClick={() => onProjectSelect(p)}
                                        style={{ width: SIDEBAR_WIDTH }}
                                        className="sticky left-0 z-30 flex-shrink-0 h-full px-6 py-3 bg-card border-r border-border group-hover:bg-accent/50 transition-colors cursor-pointer flex flex-col justify-center shadow-[4px_0_10px_-4px_rgba(0,0,0,0.05)]"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${p.status === 'Completed' ? 'bg-emerald-500' : p.status === 'Delayed' ? 'bg-red-500' : 'bg-primary'}`}></div>
                                            <p className={`font-bold text-sm truncate ${selectedProject?.id === p.id ? 'text-primary' : 'text-card-foreground'}`}>
                                                {p.name}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between mt-1.5">
                                            <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                                                <Users size={10}/> {p.clientName}
                                            </p>
                                            <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded border border-border">
                                                {p.durationDays}d
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex-1 h-full relative">
                                        <div 
                                            onClick={() => onProjectSelect(p)}
                                            className={`
                                                absolute top-1/2 -translate-y-1/2 h-10 rounded-lg shadow-sm cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-[calc(50%+1px)] group-hover:brightness-105 border
                                                ${p.status === 'Completed' 
                                                    ? 'bg-emerald-100 border-emerald-300 dark:bg-emerald-900/30 dark:border-emerald-700' 
                                                    : p.status === 'Delayed'
                                                        ? 'bg-red-100 border-red-300 dark:bg-red-900/30 dark:border-red-700'
                                                        : selectedProject?.id === p.id 
                                                            ? 'bg-card border-primary dark:bg-primary/20 dark:border-primary'
                                                            : 'bg-card border-primary/40 dark:bg-primary/20 dark:border-primary/50'
                                            }`}
                                            style={{
                                                left: p.startPosUnits * currentConfig.colWidth,
                                                width: Math.max(p.durationInMonths * currentConfig.colWidth, 10)
                                            }}
                                        >
                                            <div 
                                                className={`h-full opacity-20 ${p.status === 'Completed' ? 'bg-emerald-500' : p.status === 'Delayed' ? 'bg-red-500' : 'bg-primary'}`} 
                                                style={{ width: `${p.progress}%` }}
                                            ></div>
                                            
                                            <div className="absolute inset-0 flex items-center px-3 justify-between">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    {p.status === 'Delayed' && <AlertCircle size={14} className="text-red-600 dark:text-red-400 flex-shrink-0" />}
                                                    {p.status === 'Completed' && <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />}
                                                    
                                                    {(zoomLevel >= 2 || p.durationInMonths > 3) && (
                                                        <span className={`text-xs font-semibold truncate ${p.status === 'Completed' ? 'text-emerald-900 dark:text-emerald-100' : 'text-card-foreground'}`}>
                                                            {Math.round(p.progress)}%
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); onProjectEdit(p); }} 
                                                    className="opacity-0 group-hover:opacity-100 p-1 bg-card/80 dark:bg-black/50 rounded hover:text-primary transition-all backdrop-blur-sm"
                                                >
                                                    <Edit size={12}/>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="h-10"></div>
                </div>
            </div>
        </div>
    );
};

// --- PROJECT DETAIL PANEL (MISSING COMPONENT RESTORED) ---
const ProjectDetailPanel = ({ project, T = {}, onTaskUpdate, onTaskDelete, onSetEditingTask, onSetEditingMilestone, onDeleteMilestone, clients = [], onNavigate, ...restProps }) => {
    if (!project) return null;

    const completedTasks = project.tasks ? project.tasks.filter(t => t.status === 'Completed').length : 0;
    const totalTasks = project.tasks ? project.tasks.length : 0;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    const totalMilestones = project.milestones ? project.milestones.length : 0;
    const completedMilestones = project.milestones ? project.milestones.filter(m => m.completed).length : 0;
    const milestoneProgress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

    const isDelayed = project.endDate && new Date(project.endDate) < new Date() && progress < 100;

    const priorityIcons = {
        High: <ArrowUp size={14} className="text-red-500" />,
        Medium: <ChevronsRight size={14} className="text-orange-500" />,
        Low: <ArrowDown size={14} className="text-emerald-500" />,
    };

    const statusIcons = {
        'Completed': <CheckCircle2 size={16} className="text-emerald-500" />,
        'In Progress': <Clock size={16} className="text-primary" />,
        'Blocked': <AlertCircle size={16} className="text-red-500" />,
        'Not Started': <Circle size={16} className="text-slate-300" />,
    };

    const EmptyState = ({ icon: Icon, message }) => (
        <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 h-full border-2 border-dashed border-border rounded-lg">
            <Icon size={32} className="mb-2 opacity-30" />
            <p className="text-xs font-medium">{message}</p>
        </div>
    );

    const client = clients.find(c => c.id === project.clientId);

    return (
        <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-card rounded-xl border border-border shadow-sm p-6 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                            <FolderKanban size={18} className="text-primary"/>
                            <h3 className="text-xl font-bold text-card-foreground">{project.name}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground flex items-center gap-1.5 ml-0.5">
                            <Users size={14} /> {client?.name || 'Unknown Client'}
                            </p>
                        </div>
                        <StatusBadge status={project.status} T={T} />
                    </div>
                    
                    <div className="bg-muted/50 rounded-xl p-5 border border-border mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{T.timeline || 'Timeline'}</span>
                            {isDelayed && (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                                    <AlertCircle size={10} /> {T.delayed || 'Delayed'}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-card rounded-lg text-primary shadow-sm">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-card-foreground">
                                    {project.startDate ? new Date(project.startDate).toLocaleDateString('en-GB') : 'N/A'} 
                                    <span className="mx-1 text-muted-foreground">→</span> 
                                    {project.endDate ? new Date(project.endDate).toLocaleDateString('en-GB') : 'N/A'}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">Project Duration</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-border">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-sm font-medium text-muted-foreground">Overall Progress</span>
                            <span className="text-xl font-bold text-primary">{progress.toFixed(0)}%</span>
                        </div>
                        <ProgressBar progress={progress} height="h-3" colorClass="bg-gradient-to-r from-primary to-primary/80" />
                    </div>
                </div>

                <div className="bg-card rounded-xl border border-border shadow-sm p-6 flex flex-col h-[400px] lg:h-auto">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-md">
                                <CheckSquare size={16}/>
                            </div>
                            <h4 className="font-bold text-card-foreground">{T.tasks || 'Tasks'}</h4>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded-full">
                                {completedTasks}/{totalTasks}
                            </span>
                            <button onClick={() => onSetEditingTask({ id: null, name: '', status: 'Not Started', priority: 'Medium' })} className="bg-indigo-600 text-white rounded-lg p-1.5 shadow-sm hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95">
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2">
                        {project.tasks && project.tasks.length > 0 ? (
                            project.tasks.map(task => (
                                <div 
                                    key={task.id} 
                                    className="group flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-transparent hover:border-indigo-200 dark:hover:border-indigo-900 hover:bg-card transition-all cursor-default shadow-sm hover:shadow-md"
                                >
                                    {statusIcons[task.status] || statusIcons['Not Started']}
                                    <span className={`text-sm font-medium flex-1 ${task.status === 'Completed' ? 'text-muted-foreground line-through' : 'text-card-foreground'}`}>
                                        {task.name}
                                    </span>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={(e) => { e.stopPropagation(); onSetEditingTask(task); }} className="p-1.5 hover:bg-accent rounded-md text-muted-foreground hover:text-primary transition-colors"><Edit size={14} /></button>
                                        <button onClick={(e) => { e.stopPropagation(); onTaskDelete(task.id); }} className="p-1.5 hover:bg-accent rounded-md text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={14} /></button>
                                    </div>
                                    <div className="opacity-70 group-hover:opacity-0 transition-opacity bg-card p-1 rounded-md shadow-sm border border-border">
                                        {priorityIcons[task.priority]}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <EmptyState icon={CheckSquare} message="No tasks created yet. Click + to add one."/>
                        )}
                    </div>
                </div>
                
                <div className="bg-card rounded-xl border border-border shadow-sm p-6 flex flex-col h-[400px] lg:h-auto">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-orange-100 text-orange-600 rounded-md">
                                <Flag size={16}/>
                            </div>
                            <h4 className="font-bold text-card-foreground">{T.milestones || 'Milestones'}</h4>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => onSetEditingMilestone({ id: null, name: '', deadline: new Date().toISOString().split('T')[0], completed: false })}
                                className="bg-orange-600 text-white rounded-lg p-1.5 shadow-sm hover:bg-orange-700 transition-all hover:scale-105 active:scale-95"
                            >
                                <Plus size={16} />
                            </button>
                            
                            <div className="relative w-10 h-10 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                    <circle cx="18" cy="18" r="16" className="text-border stroke-current" strokeWidth="3" fill="none"/>
                                    <circle cx="18" cy="18" r="16" className="text-orange-500 stroke-current transition-all duration-700 ease-out" strokeWidth="3" fill="none" strokeDasharray="100.53" strokeDashoffset={100.53 - (milestoneProgress / 100 * 100.53)}/>
                                </svg>
                                <span className="absolute text-[9px] font-bold text-muted-foreground">{Math.round(milestoneProgress)}%</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="relative pl-2 flex-1 overflow-y-auto custom-scrollbar">
                        <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-border z-0"></div>

                        {project.milestones && project.milestones.length > 0 ? (
                            project.milestones.map((milestone, idx) => {
                                const isCompleted = milestone.completed;
                                return (
                                    <div key={milestone.id || idx} className="relative pl-10 py-2 group">
                                        <span 
                                            className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 z-10 flex items-center justify-center transition-all duration-300 shadow-sm
                                                ${isCompleted ? 'bg-emerald-500 border-emerald-500' : 'bg-card border-border'}
                                            `}
                                        >
                                            {isCompleted && <Check size={12} className="text-white"/>}
                                        </span>
                                        
                                        <div className="p-3 rounded-xl border transition-all bg-card border-border">
                                            <div className="flex justify-between items-start">
                                                <p className={`text-sm font-semibold pr-4 ${isCompleted ? 'text-muted-foreground line-through' : 'text-card-foreground'}`}>{milestone.name}</p>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => onSetEditingMilestone(milestone)} className="p-1.5 hover:bg-accent rounded-md text-muted-foreground hover:text-primary transition-colors"><Edit size={14} /></button>
                                                    <button onClick={() => onDeleteMilestone(milestone.id)} className="p-1.5 hover:bg-accent rounded-md text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={14} /></button>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                                                <CalendarDays size={12} />
                                                {milestone.deadline ? new Date(milestone.deadline).toLocaleDateString('en-GB') : 'No Date'}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <EmptyState icon={Target} message="No milestones set." />
                        )}
                    </div>
                </div>
            </div>
            <ProjectDetailsContent project={project} T={T} clients={clients} onNavigate={onNavigate} onClose={() => {}} {...restProps} />
        </div>
    );
};

const ProjectDetailsContent = ({ project, transactions = [], employees = [], equipment = [], attendance = [], T = {}, clients = [], onNavigate, onClose }) => {
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
        const isClickable = ['transactions', 'employees', 'equipment', 'attendance'].includes(section);

        return (
            <button 
                onClick={() => isClickable && setActiveSection(section)}
                disabled={!isClickable}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left group
                    ${isActive 
                        ? 'bg-primary/5 border-primary shadow-sm' 
                        : 'bg-card border-border hover:border-primary/30 hover:shadow-md'
                    } ${!isClickable ? 'cursor-default' : ''}`}
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
                <DetailCard icon={ArrowUpRight} label={T.totalIncome || 'Total Income'} value={projectData.income} colorClass="bg-green-500" section="transactions" formatAsCurrency />
                <DetailCard icon={ArrowDownLeft} label={T.totalExpenses || 'Total Expenses'} value={projectData.expense} colorClass="bg-red-500" section="transactions" formatAsCurrency />
                <DetailCard icon={DollarSign} label={T.netBalance || 'Net Balance'} value={projectData.net} colorClass="bg-primary" section="transactions" formatAsCurrency />
                <DetailCard icon={Briefcase} label={T.projectEmployees || 'Employees'} value={projectData.employeeCount} colorClass="bg-purple-500" section="employees" />
                <DetailCard icon={Wrench} label={T.projectEquipment || 'Equipment'} value={projectData.equipmentCount} colorClass="bg-orange-500" section="equipment" />
                <DetailCard icon={UserCheck} label={T.todaysAttendance || "Today's Attendance"} value={projectData.todaysAttendance} colorClass="bg-blue-500" section="attendance" />
            </div>

            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden min-h-[300px] flex flex-col">
                <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-card-foreground uppercase tracking-widest flex items-center gap-2">
                        {activeSection === 'transactions' && <><DollarSign size={16} className="text-primary"/> {T.recentProjectTransactions || 'Recent Transactions'}</>}
                        {activeSection === 'employees' && <><Users size={16} className="text-purple-500"/> {T.projectEmployees || 'Employees'}</>}
                        {activeSection === 'equipment' && <><Wrench size={16} className="text-orange-500"/> {T.projectEquipment || 'Equipment'}</>}
                        {activeSection === 'attendance' && <><UserCheck size={16} className="text-blue-500"/> {T.todaysAttendance || 'Attendance'}</>}
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
                                    <tr><td colSpan="4" className="p-12 text-center text-muted-foreground italic">{T.noProjectTransactions || 'No transactions found.'}</td></tr>
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
                                            {emp.name?.charAt(0) || '?'}
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

export default function Projects({ projects = [], clients = [], onAdd, onUpdate, onDelete, onNavigate, onOpenModal, documents = [], onAddDocument, onDeleteDocument, ...restProps }) {
    // --- Safe Context Destructuring ---
    const context = useContext(SettingsContext) || {};
    const language = context.language || 'en';
    const T = context.translations ? context.translations[language] : {};
    
    const [activeView, setActiveView] = useState('scheduler');
    const [selectedProject, setSelectedProject] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingTask, setEditingTask] = useState(null);
    const [editingMilestone, setEditingMilestone] = useState(null);
    const [modalProject, setModalProject] = useState(null);
    const [docsProject, setDocsProject] = useState(null);

    useEffect(() => {
        const hasProjects = projects && projects.length > 0;
        if (selectedProject) {
            const updatedSelectedProject = projects.find(p => p.id === selectedProject.id);
            setSelectedProject(updatedSelectedProject || (hasProjects ? projects[0] : null));
        } else if (hasProjects) {
            setSelectedProject(projects[0]);
        } else {
            setSelectedProject(null);
        }
    }, [projects, selectedProject?.id]);

    const handleTaskUpdate = (updatedTask) => {
        if (!selectedProject) return;
        let newTasks;
        if (updatedTask.id) {
            newTasks = (selectedProject.tasks || []).map(t => t.id === updatedTask.id ? updatedTask : t);
        } else {
            newTasks = [...(selectedProject.tasks || []), { ...updatedTask, id: `task_${Date.now()}` }];
        }
        onUpdate?.(selectedProject.id, { ...selectedProject, tasks: newTasks });
    };

    const handleTaskDelete = (taskId) => {
        if (!selectedProject || !window.confirm(T.confirmDelete || 'Are you sure you want to delete?')) return;
        const newTasks = selectedProject.tasks.filter(t => t.id !== taskId);
        onUpdate?.(selectedProject.id, { ...selectedProject, tasks: newTasks });
    };

    const handleMilestoneSave = (milestoneToSave) => {
        if (!selectedProject) return;
        let newMilestones;
        if (milestoneToSave.id) {
            newMilestones = (selectedProject.milestones || []).map(m => m.id === milestoneToSave.id ? milestoneToSave : m);
        } else {
            newMilestones = [...(selectedProject.milestones || []), { ...milestoneToSave, id: `mile_${Date.now()}` }];
        }
        onUpdate?.(selectedProject.id, { ...selectedProject, milestones: newMilestones });
    };

    const handleMilestoneDelete = (milestoneId) => {
        if (!selectedProject || !window.confirm(T.confirmDelete || 'Are you sure you want to delete?')) return;
        const newMilestones = selectedProject.milestones.filter(m => m.id !== milestoneId);
        onUpdate?.(selectedProject.id, { ...selectedProject, milestones: newMilestones });
    };

    const filteredProjects = useMemo(() => {
        if (!projects) return [];
        const query = searchQuery.toLowerCase();
        return projects.filter(p => {
            const client = clients.find(c => c.id === p.clientId);
            const clientName = client?.name?.toLowerCase() || '';
            const projectName = p.name?.toLowerCase() || '';
            const location = p.location?.toLowerCase() || '';
            
            return projectName.includes(query) || 
                   clientName.includes(query) || 
                   location.includes(query);
        });
    }, [projects, searchQuery, clients]);

    const stats = useMemo(() => ({
        total: projects.length,
        ongoing: projects.filter(p => p.status === 'Ongoing').length,
        onHold: projects.filter(p => p.status === 'On Hold').length,
        completed: projects.filter(p => p.status === 'Completed').length,
    }), [projects]);

    return (
        <div className="space-y-8 p-1 sm:p-2 max-w-[1600px] mx-auto">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-extrabold tracking-tight text-card-foreground">{T.projects || 'Projects'}</h2>
                        <button 
                            onClick={() => onOpenModal?.('projects')}
                            className="p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all shadow-md active:scale-95 group"
                            title={T.newProject || 'New Project'}
                        >
                            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                    </div>
                    <p className="text-muted-foreground mt-2 text-sm">{T.projectManageSubtitle || 'Manage your projects'}</p>
                </div>
                
                <div className="grid grid-cols-2 lg:flex gap-4">
                     <div className="bg-card px-5 py-3 rounded-xl border border-border shadow-sm flex items-center gap-3">
                         <div className="p-2 bg-primary/10 text-primary rounded-lg"><HardHat size={20}/></div>
                         <div><p className="text-xs text-muted-foreground font-bold uppercase">{T.totalProjects || 'Total Projects'}</p><p className="text-xl font-bold">{stats.total}</p></div>
                     </div>
                     <div className="bg-card px-5 py-3 rounded-xl border border-border shadow-sm flex items-center gap-3">
                         <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Clock size={20}/></div>
                         <div><p className="text-xs text-muted-foreground font-bold uppercase">{T.ongoingProjects || 'Ongoing'}</p><p className="text-xl font-bold">{stats.ongoing}</p></div>
                     </div>
                     <div className="bg-card px-5 py-3 rounded-xl border border-border shadow-sm flex items-center gap-3">
                         <div className="p-2 bg-slate-100 text-slate-600 rounded-lg"><PauseCircle size={20}/></div>
                         <div><p className="text-xs text-muted-foreground font-bold uppercase">{T.onHoldProjects || 'On Hold'}</p><p className="text-xl font-bold">{stats.onHold}</p></div>
                     </div>
                     <div className="bg-card px-5 py-3 rounded-xl border border-border shadow-sm flex items-center gap-3">
                         <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><CheckCircle2 size={20}/></div>
                         <div><p className="text-xs text-muted-foreground font-bold uppercase">{T.completedProjects || 'Completed'}</p><p className="text-xl font-bold">{stats.completed}</p></div>
                     </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-card p-2 rounded-2xl border border-border shadow-sm sticky top-2 z-40">
                <div className="flex bg-muted p-1 rounded-xl w-full sm:w-auto">
                    <button 
                        onClick={() => setActiveView('scheduler')}
                        className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${activeView === 'scheduler' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <LayoutGrid size={16}/> {T.scheduler || 'Scheduler'}
                    </button>
                    <button 
                        onClick={() => setActiveView('list')}
                        className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${activeView === 'list' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <List size={16}/> {T.projectList || 'List View'}
                    </button>
                </div>
                
                <div className="flex gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-72 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                        <input 
                            type="text" 
                            placeholder={T.searchProjects || 'Search projects...'}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-muted border border-transparent focus:bg-card focus:border-primary rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="min-h-[500px]">
                {activeView === 'list' ? (
                    <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden animate-in fade-in duration-500">
                         <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider border-b border-border">
                                        <th className="p-5 font-bold">{T.projectName || 'Project Name'}</th>
                                        <th className="p-5 font-bold">{T.client || 'Client'}</th>
                                        <th className="p-5 font-bold">{T.location || 'Location'}</th>
                                        <th className="p-5 font-bold">{T.budget || 'Budget'}</th>
                                        <th className="p-5 font-bold">{T.status || 'Status'}</th>
                                        <th className="p-5 font-bold text-right">{T.actions || 'Actions'}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredProjects.map((project) => {
                                        const client = clients.find(c => c.id === project.clientId);
                                        return (
                                            <tr key={project.id} onClick={() => setModalProject(project)} className="hover:bg-accent group cursor-pointer">
                                                <td className="p-5">
                                                    <div className="font-bold text-card-foreground">{project.name}</div>
                                                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                        <Calendar size={12}/> {project.startDate ? new Date(project.startDate).toLocaleDateString('en-GB') : 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="p-5 text-muted-foreground text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                                                            {client?.name?.charAt(0) || '?'}
                                                        </div>
                                                        {client?.name || 'Unknown'}
                                                    </div>
                                                </td>
                                                <td className="p-5 text-muted-foreground text-sm">
                                                    <div className="flex items-center gap-1.5">
                                                        <MapPin size={14} /> {project.location || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="p-5 font-mono text-card-foreground text-sm font-medium">
                                                    ৳{Number(project.budget || 0).toLocaleString()}
                                                </td>
                                                <td className="p-5">
                                                    <StatusBadge status={project.status} T={T} />
                                                </td>
                                                <td className="p-5 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); setDocsProject(project); }} 
                                                            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" 
                                                            title={T.documents || 'Documents'}
                                                        >
                                                            <FileText size={16} />
                                                        </button>
                                                        <button onClick={(e) => { e.stopPropagation(); onOpenModal?.('edit_project', project); }} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title={T.edit || 'Edit'}>
                                                            <Edit size={16} />
                                                        </button>
                                                        <button onClick={(e) => { e.stopPropagation(); onDelete?.(project.id); }} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors" title={T.delete || 'Delete'}>
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {filteredProjects.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="p-16 text-center text-muted-foreground">
                                                <div className="flex flex-col items-center justify-center">
                                                    <Search size={48} className="mb-4 opacity-20"/>
                                                    <p className="font-medium text-lg">{T.noProjectsFound || 'No projects found.'}</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <AdvancedTimeline 
                            projects={filteredProjects} 
                            clients={clients}
                            onProjectSelect={setSelectedProject}
                            onProjectEdit={(p) => onOpenModal?.('edit_project', p)}
                            onProjectAdd={() => onOpenModal?.('projects')}
                            selectedProject={selectedProject}
                            T={T}
                            language={language}
                        />

                        <div id="project-details-section">
                            {selectedProject ? (
                                <ProjectDetailPanel 
                                    project={selectedProject} 
                                    T={T}
                                    clients={clients}
                                    onTaskUpdate={handleTaskUpdate}
                                    onTaskDelete={handleTaskDelete}
                                    onSetEditingTask={setEditingTask}
                                    onSetEditingMilestone={setEditingMilestone}
                                    onDeleteMilestone={handleMilestoneDelete}
                                    onNavigate={onNavigate}
                                    {...restProps}
                                />
                            ) : (
                                <div className="flex h-32 bg-muted/50 rounded-xl border border-dashed border-border flex-col items-center justify-center text-center text-muted-foreground p-4 animate-pulse">
                                    <span className="text-sm font-medium flex items-center gap-2">
                                        <ArrowUp size={16} className="animate-bounce"/>
                                        {T.selectProjectDesc || 'Select a project to view details.'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Standardized Modals with Full Screen Blur */}
            {editingTask && (
                <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" onClick={() => setEditingTask(null)} />
                    <TaskEditDrawer key={editingTask.id || 'new'} task={editingTask} onClose={() => setEditingTask(null)} onSave={handleTaskUpdate} T={T} />
                </div>
            )}
            
            {editingMilestone && (
                <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" onClick={() => setEditingMilestone(null)} />
                    <MilestoneEditDrawer key={editingMilestone.id || 'new'} milestone={editingMilestone} onClose={() => setEditingMilestone(null)} onSave={handleMilestoneSave} T={T} />
                </div>
            )}
            
            {modalProject && (
                <Modal title={modalProject.name} onClose={() => setModalProject(null)} size="max-w-5xl">
                    <ProjectDetailsContent project={modalProject} T={T} clients={clients} onNavigate={onNavigate} onClose={() => setModalProject(null)} {...restProps} />
                </Modal>
            )}

            {docsProject && (
                <Modal title={T.projectDocuments || 'Documents'} onClose={() => setDocsProject(null)} size="max-w-lg">
                    <div className="space-y-6">
                        <div className="flex justify-between items-center bg-muted/30 p-4 rounded-xl border border-border">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                    <FolderKanban size={18}/>
                                </div>
                                <span className="font-bold text-sm text-foreground truncate max-w-[200px]">{docsProject.name}</span>
                            </div>
                        </div>

                        <div className="p-4 bg-muted/50 rounded-xl border border-primary/20 space-y-4">
                            <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide block">Add New Document</label>
                            <input 
                                type="text" 
                                placeholder={T.documentNameEg || 'e.g. Plan'} 
                                className="w-full px-4 py-2 border border-border bg-background rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                id="new-doc-name"
                            />
                            <div className="flex gap-2">
                                <input 
                                    type="file" 
                                    id="file-upload"
                                    className="hidden" 
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        const nameInput = document.getElementById('new-doc-name');
                                        const name = nameInput?.value || file?.name || 'Document';
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onload = (event) => {
                                                const fileData = event.target.result;
                                                onAddDocument?.({
                                                    name: name,
                                                    fileUrl: fileData,
                                                    fileType: file.type,
                                                    projectId: docsProject.id
                                                });
                                                if (nameInput) nameInput.value = '';
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                                <button 
                                    onClick={() => document.getElementById('file-upload').click()}
                                    className="w-full h-24 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-all group"
                                >
                                    <Upload size={24} className="text-muted-foreground group-hover:text-primary"/>
                                    <span className="text-xs font-bold text-muted-foreground uppercase">Upload Image/PDF</span>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {documents.filter(d => d.projectId === docsProject.id).length > 0 ? documents.filter(d => d.projectId === docsProject.id).sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).map(doc => (
                                <div key={doc.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:shadow-md transition-all group">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="p-2.5 bg-muted rounded-lg text-primary shrink-0">
                                            {doc.fileType?.includes('pdf') ? <File size={20}/> : <FileText size={20}/>}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-sm text-foreground truncate">{doc.name}</p>
                                            <p className="text-[10px] text-muted-foreground font-mono">
                                                {doc.createdAt?.seconds ? new Date(doc.createdAt.seconds * 1000).toLocaleString(language === 'bn' ? 'bn-BD' : 'en-GB') : 'Just now'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0 ml-2">
                                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"><Eye size={16}/></a>
                                        <a href={doc.fileUrl} download={doc.name} className="p-2 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><Download size={16}/></a>
                                        <button onClick={() => onDeleteDocument?.(doc.id)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <FileText size={48} className="mx-auto mb-4 opacity-20"/>
                                    <p className="text-sm font-medium">{T.noDocuments || 'No documents added.'}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}