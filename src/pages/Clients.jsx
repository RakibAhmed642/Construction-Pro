import React, { useState, useMemo, useContext } from 'react';
import { Plus, Edit, Trash2, Phone, Building, ChevronLeft, Search, HardHat, DollarSign, Mail, ArrowUpRight, ArrowDownLeft, Users } from 'lucide-react';
import { Modal } from '@/components/UI';
import { ClientForm } from '@/components/Forms';
import { SettingsContext } from '@/context/SettingsContext';

const ClientDetailView = ({ client, projects, transactions, onBack }) => {
    const { language, translations } = useContext(SettingsContext);
    const T = translations[language];

    const clientProjects = useMemo(() => {
        return projects.filter(p => p.clientId === client.id);
    }, [projects, client.id]);

    const clientTransactions = useMemo(() => {
        const projectIds = clientProjects.map(p => p.id);
        return transactions.filter(t => projectIds.includes(t.projectId));
    }, [transactions, clientProjects]);

    const financialSummary = useMemo(() => {
        const income = clientTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
        const expense = clientTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
        return { income, expense };
    }, [clientTransactions]);

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-2 hover:bg-accent rounded-full transition-colors">
                            <ChevronLeft size={24} className="text-muted-foreground" />
                        </button>
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl border-4 border-card shadow-sm">
                            {client.name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-card-foreground">{client.name}</h2>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-sm mt-1">
                                <span className="flex items-center gap-1.5"><Phone size={14} /> {client.phone}</span>
                                <span className="flex items-center gap-1.5"><Building size={14} /> {client.address}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <h3 className="font-bold text-card-foreground mb-4 flex items-center gap-2"><DollarSign size={18} className="text-green-500" /> {T.financialSummary}</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg">
                            <span className="text-sm font-medium text-green-700 flex items-center gap-2"><ArrowUpRight size={14} /> {T.totalBilled}</span>
                            <span className="font-bold text-lg text-green-800">৳{financialSummary.income.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-red-500/10 rounded-lg">
                            <span className="text-sm font-medium text-red-700 flex items-center gap-2"><ArrowDownLeft size={14} /> {T.projectExpenses}</span>
                            <span className="font-bold text-lg text-red-800">৳{financialSummary.expense.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <h3 className="font-bold text-card-foreground mb-4 flex items-center gap-2"><HardHat size={18} className="text-orange-500" /> {T.projectsWithCount(clientProjects.length)}</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {clientProjects.length > 0 ? clientProjects.map(p => (
                            <div key={p.id} className="p-3 bg-muted rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-foreground">{p.name}</p>
                                    <p className="text-xs text-muted-foreground">{p.location}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === 'Ongoing' ? 'bg-orange-100 text-orange-700' : p.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>{T[`status${p.status.replace(/\s/g, '')}`]}</span>
                            </div>
                        )) : <p className="text-muted-foreground text-sm text-center py-4">{T.noProjectsAssociated}</p>}
                    </div>
                </div>
            </div>

            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                <h3 className="font-bold text-card-foreground p-6 border-b border-border">{T.transactionHistory}</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{T.date}</th>
                                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{T.description}</th>
                                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{T.projects}</th>
                                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{T.type}</th>
                                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">{T.amount}</th>
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
                                        <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${t.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{T[t.type]}</span></td>
                                        <td className={`p-4 text-right font-mono font-medium ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>{t.type === 'income' ? '+' : '-'}৳{Number(t.amount).toLocaleString()}</td>
                                    </tr>
                                );
                            }) : (
                                <tr><td colSpan="5" className="p-12 text-center text-muted-foreground">{T.noTransactionsForClient}</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};


const Clients = ({ clients = [], projects = [], transactions = [], onDelete, onOpenModal }) => {
    const { language, translations } = useContext(SettingsContext);
    const T = translations[language];

    const [selectedClient, setSelectedClient] = useState(null);
    const [view, setView] = useState('list'); // 'list' or 'detail'
    const [searchQuery, setSearchQuery] = useState('');

    const handleEdit = (e, client) => { 
        e.stopPropagation(); 
        onOpenModal('edit_client', client);
    };
    const handleDeleteClick = (e, id) => { e.stopPropagation(); onDelete(id); };

    const handleViewDetails = (client) => {
        setSelectedClient(client);
        setView('detail');
    };
    
    const handleBackToList = () => {
        setSelectedClient(null);
        setView('list');
    };

    const filteredClients = useMemo(() => {
        if (!clients) return [];
        return clients.filter(c => 
            c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.address?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [clients, searchQuery]);

    if (view === 'detail' && selectedClient) {
        return <ClientDetailView client={selectedClient} projects={projects} transactions={transactions} onBack={handleBackToList} />
    }
  
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold text-foreground">{T.clientDirectory}</h2>
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                <input 
                  type="text" 
                  placeholder={T.searchClients}
                  className="w-full pl-10 pr-4 py-2 border border-border bg-background rounded-lg outline-none focus:ring-2 focus:ring-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <button onClick={() => onOpenModal('clients')} className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"><Plus size={20} /><span>{T.addClient}</span></button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map(client => {
            const clientProjectsCount = projects.filter(p => p.clientId === client.id).length;
            return (
                <div key={client.id} onClick={() => handleViewDetails(client)} className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer relative group">
                  <div className="absolute top-4 right-4 flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button onClick={(e) => handleEdit(e, client)} className="p-1.5 bg-card border border-border text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg shadow-sm"><Edit size={16} /></button>
                      <button onClick={(e) => handleDeleteClick(e, client.id)} className="p-1.5 bg-card border border-border text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg shadow-sm"><Trash2 size={16} /></button>
                   </div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl border-2 border-card shadow-sm">{client.name.charAt(0)}</div>
                    <div>
                        <h3 className="font-bold text-card-foreground text-lg group-hover:text-primary transition-colors">{client.name}</h3>
                        <p className="text-sm text-muted-foreground">{client.address}</p>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm border-t border-border pt-4">
                     <div className="flex justify-between items-center"><span className="text-muted-foreground flex items-center gap-2"><Phone size={14}/> {T.contact}</span><span className="font-medium text-foreground">{client.phone}</span></div>
                     <div className="flex justify-between items-center"><span className="text-muted-foreground flex items-center gap-2"><HardHat size={14}/> {T.projects}</span><span className="font-bold text-foreground bg-muted px-2 rounded-full">{clientProjectsCount}</span></div>
                  </div>
                </div>
            )
          })}
        </div>
         {filteredClients.length === 0 && <div className="col-span-full bg-card p-12 rounded-xl border-2 border-dashed border-border text-center text-muted-foreground"><Users size={48} className="mx-auto mb-4 text-muted" /><p>{T.noClientsFound}</p></div>}
      </div>
    );
};

export default Clients;