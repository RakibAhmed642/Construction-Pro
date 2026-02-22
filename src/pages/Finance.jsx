'use client'; // এটি যোগ করা হয়েছে

import React, { useState, useMemo, useContext } from 'react';
import {
  Plus,
  Trash2,
  HardHat,
  Edit,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronLeft,
  DollarSign,
  Filter,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Building2,
  BadgeCheck,
  Clock,
  Briefcase
} from 'lucide-react';
import { SettingsContext } from '@/context/SettingsContext';


const ProjectFinancialDetailView = ({ project, transactions = [], onBack, T = {} }) => {
  const projectTransactions = useMemo(() => {
    return transactions.filter(t => t.projectId === project?.id);
  }, [transactions, project]);

  const financialSummary = useMemo(() => {
    const income = projectTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const expense = projectTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const net = income - expense;
    return { income, expense, net };
  }, [projectTransactions]);

  if (!project) return null;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-accent rounded-full transition-colors">
            <ChevronLeft size={24} className="text-muted-foreground" />
          </button>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-1">
              <p className="text-sm font-semibold text-primary uppercase tracking-wider">{T.projectReport || 'Project Report'}</p>
              {project.status && (
                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider w-fit ${project.status === 'completed' ? 'bg-green-100 text-green-700' :
                  project.status === 'ongoing' ? 'bg-blue-100 text-blue-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                  {T[project.status] || project.status}
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-card-foreground mb-3">{project.name}</h2>
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Briefcase size={16} /> {project.clientName}</span>
              {project.location && <span className="flex items-center gap-1.5"><MapPin size={16} /> {project.location}</span>}
              {project.startDate && <span className="flex items-center gap-1.5"><Calendar size={16} /> {project.startDate}</span>}
            </div>
            {project.description && <p className="mt-4 pt-4 border-t border-border text-sm text-muted-foreground max-w-3xl">{project.description}</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-card-foreground">{T.totalRevenue || 'Total Revenue'}</h3>
            <div className="p-2 bg-green-100 rounded-lg"><ArrowUpRight size={18} className="text-green-600" /></div>
          </div>
          <p className="text-3xl font-bold text-green-600">৳{financialSummary.income.toLocaleString()}</p>
        </div>
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-card-foreground">{T.totalExpenses || 'Total Expenses'}</h3>
            <div className="p-2 bg-red-100 rounded-lg"><ArrowDownLeft size={18} className="text-red-600" /></div>
          </div>
          <p className="text-3xl font-bold text-red-600">৳{financialSummary.expense.toLocaleString()}</p>
        </div>
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-card-foreground">{T.netBalance || 'Net Balance'}</h3>
            <div className={`p-2 rounded-lg ${financialSummary.net >= 0 ? 'bg-primary/10' : 'bg-red-100'}`}>
              <DollarSign size={18} className={`${financialSummary.net >= 0 ? 'text-primary' : 'text-red-600'}`} />
            </div>
          </div>
          <p className={`text-3xl font-bold ${financialSummary.net >= 0 ? 'text-primary' : 'text-red-600'}`}>
            ৳{financialSummary.net.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <h3 className="font-bold text-card-foreground p-6 border-b border-border">{T.transactionsForProject || 'Transactions for this Project'}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{T.date || 'Date'}</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{T.description || 'Description'}</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{T.category || 'Category'}</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">{T.amount || 'Amount'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {projectTransactions.length > 0 ? projectTransactions.map(t => (
                <tr key={t.id}>
                  <td className="p-4 text-sm text-muted-foreground font-mono">{t.date}</td>
                  <td className="p-4 text-sm font-medium text-foreground">{t.description}</td>
                  <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${t.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{T[t.type] || t.type}</span></td>
                  <td className={`p-4 text-right font-mono font-medium ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>{t.type === 'income' ? '+' : '-'}৳{Number(t.amount).toLocaleString()}</td>
                </tr>
              )) : (
                <tr><td colSpan="4" className="p-12 text-center text-muted-foreground">{T.noTransactionsForProject || 'No transactions found.'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const ClientFinancialDetailView = ({ client, projects = [], transactions = [], onBack, T = {} }) => {
  const clientProjects = useMemo(() => projects.filter(p => p.clientId === client?.id), [projects, client]);
  const clientTransactions = useMemo(() => {
    const projIds = clientProjects.map(p => p.id);
    return transactions.filter(t => projIds.includes(t.projectId));
  }, [transactions, clientProjects]);

  const financialSummary = useMemo(() => {
    const income = clientTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const expense = clientTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const net = income - expense;
    return { income, expense, net };
  }, [clientTransactions]);

  if (!client) return null;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-accent rounded-full transition-colors">
            <ChevronLeft size={24} className="text-muted-foreground" />
          </button>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-1">
              <p className="text-sm font-semibold text-primary uppercase tracking-wider">{T.clientReport || 'Client Report'}</p>
              {client.status && (
                <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider w-fit bg-green-100 text-green-700">
                  {T[client.status] || client.status}
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-card-foreground mb-3">{client.name}</h2>
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-sm text-muted-foreground">
              {client.company && <span className="flex items-center gap-1.5"><Building2 size={16} /> {client.company}</span>}
              {client.phone && <span className="flex items-center gap-1.5"><Phone size={16} /> {client.phone}</span>}
              {client.email && <span className="flex items-center gap-1.5"><Mail size={16} /> {client.email}</span>}
              {client.address && <span className="flex items-center gap-1.5"><MapPin size={16} /> {client.address}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-card-foreground">{T.totalRevenue || 'Total Revenue'}</h3>
            <div className="p-2 bg-green-100 rounded-lg"><ArrowUpRight size={18} className="text-green-600" /></div>
          </div>
          <p className="text-3xl font-bold text-green-600">৳{financialSummary.income.toLocaleString()}</p>
        </div>
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-card-foreground">{T.totalProjectExpenses || 'Total Project Expenses'}</h3>
            <div className="p-2 bg-red-100 rounded-lg"><ArrowDownLeft size={18} className="text-red-600" /></div>
          </div>
          <p className="text-3xl font-bold text-red-600">৳{financialSummary.expense.toLocaleString()}</p>
        </div>
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-card-foreground">{T.netBalance || 'Net Balance'}</h3>
            <div className={`p-2 rounded-lg ${financialSummary.net >= 0 ? 'bg-primary/10' : 'bg-red-100'}`}>
              <DollarSign size={18} className={`${financialSummary.net >= 0 ? 'text-primary' : 'text-red-600'}`} />
            </div>
          </div>
          <p className={`text-3xl font-bold ${financialSummary.net >= 0 ? 'text-primary' : 'text-red-600'}`}>
            ৳{financialSummary.net.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <h3 className="font-bold text-card-foreground p-6 border-b border-border">{T.transactionsForClient || 'Transactions for this Client'}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{T.date || 'Date'}</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{T.description || 'Description'}</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{T.project || 'Project'}</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">{T.amount || 'Amount'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {clientTransactions.length > 0 ? clientTransactions.map(t => {
                const proj = clientProjects.find(p => p.id === t.projectId);
                return (
                  <tr key={t.id}>
                    <td className="p-4 text-sm text-muted-foreground font-mono">{t.date}</td>
                    <td className="p-4 text-sm font-medium text-foreground">{t.description}</td>
                    <td className="p-4 text-sm text-muted-foreground">{proj?.name || 'N/A'}</td>
                    <td className={`p-4 text-right font-mono font-medium ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>{t.type === 'income' ? '+' : '-'}৳{Number(t.amount).toLocaleString()}</td>
                  </tr>
                )
              }) : (
                <tr><td colSpan="4" className="p-12 text-center text-muted-foreground">{T.noTransactionsForClient || 'No transactions found.'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const EmployeeFinancialDetailView = ({ employee, transactions = [], onBack, T = {} }) => {
  const employeeTransactions = useMemo(() => {
    return transactions.filter(t => t.employeeId === employee?.id);
  }, [transactions, employee]);

  const totalPaid = useMemo(() => {
    return employeeTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount || 0), 0);
  }, [employeeTransactions]);

  if (!employee) return null;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-accent rounded-full transition-colors">
            <ChevronLeft size={24} className="text-muted-foreground" />
          </button>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-1">
              <p className="text-sm font-semibold text-primary uppercase tracking-wider">{T.employeeReport || 'Employee Report'}</p>
              <div className="flex gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider w-fit bg-blue-100 text-blue-700">
                  {employee.role || 'Staff'}
                </span>
                {employee.status && (
                  <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider w-fit bg-green-100 text-green-700">
                    {T[employee.status] || employee.status}
                  </span>
                )}
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-card-foreground mb-3">{employee.name}</h2>
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-sm text-muted-foreground border-b border-border pb-4 mb-4">
              {employee.phone && <span className="flex items-center gap-1.5"><Phone size={16} /> {employee.phone}</span>}
              {employee.email && <span className="flex items-center gap-1.5"><Mail size={16} /> {employee.email}</span>}
              {employee.joinDate && <span className="flex items-center gap-1.5"><Calendar size={16} /> {T.joined || 'Joined'} {employee.joinDate}</span>}
              {employee.baseSalary && <span className="flex items-center gap-1.5"><DollarSign size={16} /> {T.baseSalary || 'Base Salary'}: ৳{Number(employee.baseSalary).toLocaleString()}</span>}
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {employee.skills?.map((skill, idx) => (
                <span key={idx} className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card p-6 rounded-xl border border-border shadow-sm mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-card-foreground mb-1">{T.totalSalaryPaid || 'Total Salary Paid'}</h3>
          <p className="text-sm text-muted-foreground">Historical payments to this employee</p>
        </div>
        <p className="text-4xl font-bold text-red-600">৳{totalPaid.toLocaleString()}</p>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <h3 className="font-bold text-card-foreground p-6 border-b border-border">{T.paymentHistory || 'Payment History'}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{T.date || 'Date'}</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{T.description || 'Description'}</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">{T.amount || 'Amount'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {employeeTransactions.length > 0 ? employeeTransactions.filter(t => t.type === 'expense').map(t => (
                <tr key={t.id}>
                  <td className="p-4 text-sm text-muted-foreground font-mono">{t.date}</td>
                  <td className="p-4 text-sm font-medium text-foreground">{t.description}</td>
                  <td className="p-4 text-right font-mono font-bold text-red-600">-৳{Number(t.amount).toLocaleString()}</td>
                </tr>
              )) : (
                <tr><td colSpan="3" className="p-12 text-center text-muted-foreground">{T.noPaymentsFound || 'No payment history found.'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const Finance = ({ transactions = [], projects = [], clients = [], employees = [], onDelete, onOpenModal }) => {
  // --- Safe Context Destructuring ---
  const context = useContext(SettingsContext) || {};
  const language = context.language || 'en';
  const T = context.translations ? context.translations[language] : {};

  const [activeView, setActiveView] = useState('transactions');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Details Modals States
  const [selectedProjectForReport, setSelectedProjectForReport] = useState(null);
  const [selectedClientForReport, setSelectedClientForReport] = useState(null);
  const [selectedEmployeeForReport, setSelectedEmployeeForReport] = useState(null);
  const [employeeRoleFilter, setEmployeeRoleFilter] = useState('all');

  const handleEdit = (t) => {
    onOpenModal?.('edit_transaction', t);
  };

  const projectFinancials = useMemo(() => {
    return projects?.map(proj => {
      const projTrans = transactions?.filter(t => t.projectId === proj.id) || [];
      const income = projTrans.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount || 0), 0);
      const expense = projTrans.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount || 0), 0);
      return { ...proj, totalIncome: income, totalExpense: expense, netProfit: income - expense };
    }) || [];
  }, [projects, transactions]);

  const clientFinancials = useMemo(() => {
    return clients?.map(client => {
      const clientProjs = projects?.filter(p => p.clientId === client.id) || [];
      const projIds = clientProjs.map(p => p.id);
      const clientTrans = transactions?.filter(t => projIds.includes(t.projectId)) || [];
      const income = clientTrans.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount || 0), 0);
      const expense = clientTrans.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount || 0), 0);
      return { ...client, totalIncome: income, totalExpense: expense, netProfit: income - expense, activeProjectsCount: clientProjs.length };
    }) || [];
  }, [clients, projects, transactions]);

  const employeeFinancials = useMemo(() => {
    return employees?.map(emp => {
      const empTrans = transactions?.filter(t => t.employeeId === emp.id && t.type === 'expense') || [];
      const totalPaid = empTrans.reduce((sum, t) => sum + Number(t.amount || 0), 0);
      return { ...emp, totalPaid };
    }) || [];
  }, [employees, transactions]);

  const filteredTransactions = transactions
    ?.filter(t => filterType === 'all' || t.type === filterType)
    ?.filter(t => t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.amount?.toString().includes(searchQuery)) || [];

  const unqiueRoles = useMemo(() => {
    const roles = new Set(employees?.map(e => e.role).filter(Boolean));
    return Array.from(roles);
  }, [employees]);

  const filteredProjectReports = useMemo(() => {
    return projectFinancials.filter(p => !searchQuery ||
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.clientName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [projectFinancials, searchQuery]);

  const filteredClientReports = useMemo(() => {
    return clientFinancials.filter(c => !searchQuery ||
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone?.includes(searchQuery) ||
      c.company?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [clientFinancials, searchQuery]);

  const filteredEmployeeReports = useMemo(() => {
    return employeeFinancials.filter(e => !searchQuery ||
      e.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.phone?.includes(searchQuery) ||
      e.role?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [employeeFinancials, searchQuery]);

  if (activeView === 'project_reports' && selectedProjectForReport) {
    return <ProjectFinancialDetailView project={selectedProjectForReport} transactions={transactions} onBack={() => setSelectedProjectForReport(null)} T={T} />
  }
  if (activeView === 'client_reports' && selectedClientForReport) {
    return <ClientFinancialDetailView client={selectedClientForReport} projects={projects} transactions={transactions} onBack={() => setSelectedClientForReport(null)} T={T} />
  }
  if (activeView === 'employee_reports' && selectedEmployeeForReport) {
    return <EmployeeFinancialDetailView employee={selectedEmployeeForReport} transactions={transactions} onBack={() => setSelectedEmployeeForReport(null)} T={T} />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{T.financialHub || 'Financial Hub'}</h2>
          <div className="flex flex-wrap gap-2 mt-2">
            {[
              { id: 'transactions', label: T.transactionsLog || 'Transactions Log' },
              { id: 'project_reports', label: T.projectReports || 'Project Reports' },
              { id: 'client_reports', label: T.clientReports || 'Client Reports' },
              { id: 'employee_reports', label: T.employeeReports || 'Employee Reports' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeView === tab.id ? 'bg-foreground text-background shadow-md' : 'bg-card text-muted-foreground hover:bg-accent hover:text-foreground'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => onOpenModal?.('transactions')} className="bg-foreground hover:bg-foreground/90 text-background px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-slate-800/20 whitespace-nowrap">
          <Plus size={20} />
          <span>{T.newTransaction || 'New Transaction'}</span>
        </button>
      </div>

      {activeView === 'transactions' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="text"
                placeholder={T.searchTransactions || 'Search transactions...'}
                className="w-full pl-10 pr-4 py-2 border border-border bg-background rounded-lg outline-none focus:ring-2 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border border-border rounded-lg outline-none bg-background text-foreground shrink-0"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">{T.allTypes || 'All Types'}</option>
              <option value="income">{T.incomeOnly || 'Income Only'}</option>
              <option value="expense">{T.expenseOnly || 'Expense Only'}</option>
            </select>
          </div>

          <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 text-muted-foreground text-sm border-b border-border">
                    <th className="p-4 font-semibold">{T.date || 'Date'}</th>
                    <th className="p-4 font-semibold">{T.description || 'Description'}</th>
                    <th className="p-4 font-semibold">{T.projectContext || 'Project Context'}</th>
                    <th className="p-4 font-semibold">{T.method || 'Method'}</th>
                    <th className="p-4 font-semibold">{T.category || 'Category'}</th>
                    <th className="p-4 font-semibold text-right">{T.amount || 'Amount'}</th>
                    <th className="p-4 font-semibold text-right">{T.actions || 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredTransactions.map((t) => {
                    const linkedProject = projects?.find(p => p.id === t.projectId);
                    return (
                      <tr key={t.id} className="hover:bg-accent/50 transition-colors group">
                        <td className="p-4 text-muted-foreground text-sm font-mono">{t.date}</td>
                        <td className="p-4 font-medium text-foreground">
                          {t.description}
                          {t.reference && <span className="block text-xs text-muted-foreground">Ref: {t.reference}</span>}
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {linkedProject ? (
                            <span className="flex items-center gap-1 text-primary bg-primary/10 px-2 py-0.5 rounded w-fit">
                              <HardHat size={12} /> {linkedProject.name}
                            </span>
                          ) : (
                            <span className="text-muted-foreground italic">{T.general || 'General'}</span>
                          )}
                        </td>
                        <td className="p-4 text-sm text-muted-foreground capitalize">{t.paymentMethod || 'Cash'}</td>
                        <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${t.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{T[t.type] || t.type}</span></td>
                        <td className={`p-4 text-right font-mono font-medium ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>{t.type === 'income' ? '+' : '-'}৳{Number(t.amount || 0).toLocaleString()}</td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(t)} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"><Edit size={16} /></button>
                            <button onClick={() => onDelete?.(t.id)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredTransactions.length === 0 && <tr><td colSpan="7" className="p-8 text-center text-muted-foreground">{T.noTransactionsFound || 'No transactions found.'}</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeView === 'project_reports' && (
        <div className="space-y-4 animate-fade-in">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder={T.searchProjects || 'Search projects by name or client...'}
              className="w-full pl-10 pr-4 py-2 border border-border bg-background rounded-lg outline-none focus:ring-2 focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjectReports.map(proj => (
              <div
                key={proj.id}
                onClick={() => setSelectedProjectForReport(proj)}
                className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md hover:border-primary transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-card-foreground text-lg group-hover:text-primary transition-colors">{proj.name}</h3>
                    <p className="text-xs text-muted-foreground max-w-[150px] truncate">{proj.clientName}</p>
                  </div>
                  <span className={`px-2 py-1 text-[10px] uppercase tracking-wider rounded-md font-bold shrink-0 ${proj.netProfit >= 0 ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                    {proj.netProfit >= 0 ? (T.profitable || 'Profitable') : (T.loss || 'Loss')}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-green-500/10 rounded-lg">
                    <span className="text-xs font-bold text-green-700 flex items-center gap-1.5 uppercase tracking-widest"><ArrowUpRight size={14} /> {T.income || 'Income'}</span>
                    <span className="font-bold text-green-800">৳{proj.totalIncome.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-red-500/10 rounded-lg">
                    <span className="text-xs font-bold text-red-700 flex items-center gap-1.5 uppercase tracking-widest"><ArrowDownLeft size={14} /> {T.expense || 'Expense'}</span>
                    <span className="font-bold text-red-800">৳{proj.totalExpense.toLocaleString()}</span>
                  </div>
                  <div className="pt-3 border-t border-border flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">{T.netBalance || 'Net Balance'}</span>
                    <span className={`font-bold text-xl tracking-tight ${proj.netProfit >= 0 ? 'text-foreground' : 'text-red-600'}`}>
                      ৳{proj.netProfit.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {filteredProjectReports.length === 0 && <div className="col-span-full text-center py-10 text-muted-foreground">{T.noProjectsToReport || 'No projects available to report on based on your search.'}</div>}
          </div>
        </div>
      )}

      {activeView === 'client_reports' && (
        <div className="space-y-4 animate-fade-in">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder={T.searchClients || 'Search clients by name, phone, or company...'}
              className="w-full pl-10 pr-4 py-2 border border-border bg-background rounded-lg outline-none focus:ring-2 focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClientReports.map(client => (
              <div
                key={client.id}
                onClick={() => setSelectedClientForReport(client)}
                className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md hover:border-primary transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3 items-center min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl shrink-0">
                      {client.name?.charAt(0) || '?'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-card-foreground text-lg group-hover:text-primary transition-colors truncate">{client.name}</h3>
                      <p className="text-xs text-muted-foreground truncate">{client.company || 'Individual Client'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                    <span className="text-xs font-bold text-green-700 flex items-center gap-1.5 uppercase tracking-widest"><ArrowUpRight size={14} /> {T.valueBilled || 'Billed'}</span>
                    <span className="font-bold text-green-800 tracking-tight">৳{client.totalIncome.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2 px-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><HardHat size={12} /> {client.activeProjectsCount} {T.projects || 'Projects'}</span>
                  </div>
                </div>
              </div>
            ))}
            {filteredClientReports.length === 0 && <div className="col-span-full text-center py-10 text-muted-foreground">{T.noClientsToReport || 'No clients found based on your search.'}</div>}
          </div>
        </div>
      )}

      {activeView === 'employee_reports' && (
        <div className="space-y-6 animate-fade-in">
          {unqiueRoles.length > 0 && (
            <div className="bg-card p-4 sm:p-6 rounded-xl border border-border shadow-sm mb-6">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                <Filter size={16} /> Role Based Financial Summary
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                  onClick={() => setEmployeeRoleFilter('all')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${employeeRoleFilter === 'all' ? 'bg-primary/10 border-primary shadow-sm' : 'bg-muted/30 border-transparent hover:border-border'}`}
                >
                  <p className="font-bold text-foreground">All Staff</p>
                  <p className="text-xl font-black text-rose-600 mt-2 tracking-tight">৳{employeeFinancials.reduce((sum, e) => sum + e.totalPaid, 0).toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase mt-1">Total Salaries</p>
                </div>
                {unqiueRoles.map(role => {
                  const rolePaid = employeeFinancials.filter(e => e.role === role).reduce((sum, e) => sum + e.totalPaid, 0);
                  return (
                    <div
                      key={role}
                      onClick={() => setEmployeeRoleFilter(role)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${employeeRoleFilter === role ? 'bg-primary/10 border-primary shadow-sm' : 'bg-muted/30 border-transparent hover:border-border'}`}
                    >
                      <p className="font-bold text-foreground truncate">{role}</p>
                      <p className="text-lg font-bold text-rose-600 mt-2 tracking-tight">৳{rolePaid.toLocaleString()}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder={T.searchEmployees || 'Search employees by name, role, or phone...'}
              className="w-full pl-10 pr-4 py-2 border border-border bg-background rounded-lg outline-none focus:ring-2 focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredEmployeeReports.filter(e => employeeRoleFilter === 'all' || e.role === employeeRoleFilter).map(emp => (
              <div
                key={emp.id}
                onClick={() => setSelectedEmployeeForReport(emp)}
                className="bg-card p-5 rounded-xl border border-border shadow-sm hover:shadow-md hover:border-primary transition-all cursor-pointer group flex flex-col items-center text-center"
              >
                <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center font-bold text-2xl mb-3 shadow-inner">
                  {emp.name?.charAt(0) || '?'}
                </div>
                <h3 className="font-bold text-card-foreground group-hover:text-primary transition-colors truncate w-full">{emp.name}</h3>
                <span className="px-2 py-0.5 mt-1 rounded text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary">{emp.role || 'Staff'}</span>

                <div className="w-full h-[1px] bg-border my-4"></div>

                <div className="w-full flex justify-between items-center">
                  <span className="text-xs text-muted-foreground font-medium uppercase">{T.totalPaid || 'Total Paid'}</span>
                  <span className="font-bold text-rose-600">৳{emp.totalPaid.toLocaleString()}</span>
                </div>
              </div>
            ))}
            {employeeFinancials.length === 0 && <div className="col-span-full text-center py-10 text-muted-foreground">{T.noEmployeesToReport || 'No employees available to report on.'}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
