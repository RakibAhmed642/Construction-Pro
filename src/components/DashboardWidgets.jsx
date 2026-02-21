
import React from 'react';

export const DashboardCard = ({ title, value, icon: Icon, color, bg, label, highlight, onClick }) => (
    <div 
      onClick={onClick}
      className={`p-6 rounded-xl border transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer active:scale-95 ${
      highlight 
        ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 border-indigo-500 shadow-xl shadow-indigo-500/30 text-white scale-[1.02] relative overflow-hidden group' 
        : 'bg-card border-border shadow-sm text-card-foreground hover:border-primary/30'
    }`}>
      {highlight && (
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500"></div>
      )}
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className={`text-sm font-medium mb-1 ${highlight ? 'text-indigo-100' : 'text-muted-foreground'}`}>{title}</p>
          <h3 className="text-2xl font-bold">৳{typeof value === 'number' ? value.toLocaleString() : value}</h3>
          {label && <p className={`text-xs mt-1 ${highlight ? 'text-indigo-200' : 'text-muted-foreground'}`}>{label}</p>}
        </div>
        <div className={`p-3 rounded-xl ${highlight ? 'bg-white/20 text-white' : `${bg} ${color}`}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
);
  
export const QuickActionButton = ({ icon: Icon, label, color, onClick }) => (
    <button 
      onClick={onClick} 
      className={`flex flex-col items-center justify-center p-5 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1 active:scale-95 border border-white/10 relative overflow-hidden group ${color}`}
    >
      {/* Premium Gloss Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      
      {/* Icon Container */}
      <div className="p-3 bg-white/20 rounded-xl mb-2.5 group-hover:scale-110 transition-transform backdrop-blur-sm shadow-inner ring-1 ring-white/10">
        <Icon size={24} className="text-white" />
      </div>
      
      {/* Label */}
      <span className="text-[10px] font-black text-white text-center uppercase tracking-widest drop-shadow-md">{label}</span>
    </button>
);

export const StatusRow = ({ label, count, total, color }) => (
    <div>
      <div className="flex justify-between items-center mb-1 text-sm">
        <span className="text-foreground font-medium">{label}</span>
        <span className="text-card-foreground font-bold">{count}</span>
      </div>
      <div className={`w-full bg-muted h-2 rounded-full overflow-hidden`}>
        <div className={`h-full rounded-full ${color}`} style={{ width: `${total ? (count / total) * 100 : 0}%` }}></div>
      </div>
    </div>
);
  
export const ExpenseBar = ({ label, amount, total, color }) => (
    <div>
      <div className="flex justify-between items-center mb-1 text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-foreground font-medium">৳{amount.toLocaleString()}</span>
      </div>
      <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${total ? (amount / total) * 100 : 0}%` }}></div>
      </div>
    </div>
);
