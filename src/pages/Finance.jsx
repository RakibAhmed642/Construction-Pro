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
  DollarSign
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
                    <div>
                        <p className="text-sm text-muted-foreground">{T.projectReport || 'Project Report'}</p>
                        <h2 className="text-2xl font-bold text-card-foreground">{project.name}</h2>
                        <p className="text-sm text-muted-foreground">{T.client || 'Client'}: {project.clientName}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-card-foreground">{T.totalRevenue || 'Total Revenue'}</h3>
                        <div className="p-2 bg-green-100 rounded-lg"><ArrowUpRight size={18} className="text-green-600"/></div>
                    </div>
                    <p className="text-3xl font-bold text-green-600">৳{financialSummary.income.toLocaleString()}</p>
                </div>
                 <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-card-foreground">{T.totalExpenses || 'Total Expenses'}</h3>
                        <div className="p-2 bg-red-100 rounded-lg"><ArrowDownLeft size={18} className="text-red-600"/></div>
                    </div>
                    <p className="text-3xl font-bold text-red-600">৳{financialSummary.expense.toLocaleString()}</p>
                </div>
                 <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-card-foreground">{T.netBalance || 'Net Balance'}</h3>
                        <div className={`p-2 rounded-lg ${financialSummary.net >= 0 ? 'bg-primary/10' : 'bg-red-100'}`}>
                            <DollarSign size={18} className={`${financialSummary.net >= 0 ? 'text-primary' : 'text-red-600'}`}/>
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

const Finance = ({ transactions = [], projects = [], onDelete, onOpenModal }) => {
    // --- Safe Context Destructuring ---
    const context = useContext(SettingsContext) || {};
    const language = context.language || 'en';
    const T = context.translations ? context.translations[language] : {};

    const [activeView, setActiveView] = useState('transactions'); 
    const [filterType, setFilterType] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProjectForReport, setSelectedProjectForReport] = useState(null);
  
    const handleEdit = (t) => {
        onOpenModal?.('edit_transaction', t);
    };
  
    const projectFinancials = useMemo(() => {
      return projects?.map(proj => {
        const projTrans = transactions?.filter(t => t.projectId === proj.id) || [];
        const income = projTrans.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount || 0), 0);
        const expense = projTrans.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount || 0), 0);
        return {
          ...proj,
          totalIncome: income,
          totalExpense: expense,
          netProfit: income - expense
        };
      }) || [];
    }, [projects, transactions]);
  
    const filteredTransactions = transactions
      ?.filter(t => filterType === 'all' || t.type === filterType)
      ?.filter(t => t.description?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    t.amount?.toString().includes(searchQuery)) || [];
    
    if (activeView === 'reports' && selectedProjectForReport) {
        return (
            <ProjectFinancialDetailView 
                project={selectedProjectForReport}
                transactions={transactions}
                onBack={() => setSelectedProjectForReport(null)}
                T={T}
            />
        )
    }
  
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
             <h2 className="text-2xl font-bold text-foreground">{T.financialHub || 'Financial Hub'}</h2>
             <div className="flex gap-2 mt-2">
                <button 
                  onClick={() => setActiveView('transactions')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeView === 'transactions' ? 'bg-foreground text-background' : 'bg-card text-muted-foreground hover:bg-accent'}`}
                >
                  {T.transactionsLog || 'Transactions Log'}
                </button>
                <button 
                  onClick={() => setActiveView('reports')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeView === 'reports' ? 'bg-foreground text-background' : 'bg-card text-muted-foreground hover:bg-accent'}`}
                >
                  {T.projectReports || 'Project Reports'}
                </button>
             </div>
          </div>
          <button onClick={() => onOpenModal?.('transactions')} className="bg-foreground hover:bg-foreground/90 text-background px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-slate-800/20">
            <Plus size={20} />
            <span>{T.newTransaction || 'New Transaction'}</span>
          </button>
        </div>
  
        {activeView === 'transactions' ? (
          <div className="space-y-4">
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
                className="px-4 py-2 border border-border rounded-lg outline-none bg-background text-foreground"
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
                                 <HardHat size={12}/> {linkedProject.name}
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projectFinancials.map(proj => (
              <div 
                key={proj.id} 
                onClick={() => setSelectedProjectForReport(proj)}
                className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md hover:border-primary transition-all cursor-pointer group"
              >
                 <div className="flex justify-between items-start mb-4">
                   <div>
                     <h3 className="font-bold text-card-foreground text-lg group-hover:text-primary transition-colors">{proj.name}</h3>
                     <p className="text-xs text-muted-foreground">{proj.clientName}</p>
                   </div>
                   <span className={`px-2 py-1 text-xs rounded-full font-medium ${proj.netProfit >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {proj.netProfit >= 0 ? (T.profitable || 'Profitable') : (T.loss || 'Loss')}
                   </span>
                 </div>
                 
                 <div className="space-y-3">
                   <div className="flex justify-between items-center p-2 bg-green-500/10 rounded-lg">
                      <span className="text-sm text-green-700 flex items-center gap-2"><ArrowUpRight size={14}/> {T.income || 'Income'}</span>
                      <span className="font-bold text-green-800">৳{proj.totalIncome.toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between items-center p-2 bg-red-500/10 rounded-lg">
                      <span className="text-sm text-red-700 flex items-center gap-2"><ArrowDownLeft size={14}/> {T.expense || 'Expense'}</span>
                      <span className="font-bold text-red-800">৳{proj.totalExpense.toLocaleString()}</span>
                   </div>
                   <div className="pt-2 border-t border-border mt-2 flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">{T.netBalance || 'Net Balance'}</span>
                      <span className={`font-bold text-lg ${proj.netProfit >= 0 ? 'text-foreground' : 'text-red-600'}`}>
                        ৳{proj.netProfit.toLocaleString()}
                      </span>
                   </div>
                 </div>
              </div>
            ))}
            {projectFinancials.length === 0 && <div className="col-span-full text-center py-10 text-muted-foreground">{T.noProjectsToReport || 'No projects available to report on.'}</div>}
          </div>
        )}
      </div>
    );
};

export default Finance;