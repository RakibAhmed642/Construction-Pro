
import React, { useContext } from 'react';
import Image from 'next/image';
import { 
    LayoutDashboard, 
    Users, 
    HardHat, 
    Wallet, 
    Briefcase, 
    Building,
    X,
    Settings as SettingsIcon,
    Layers,
    Rocket,
    LogOut
} from 'lucide-react';
import { SettingsContext } from '@/context/SettingsContext';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';

const Sidebar = ({ activeTab, setActiveTab, mobileMenuOpen, setMobileMenuOpen }) => {
    const { language, translations, businessName, logoUrl } = useContext(SettingsContext);
    const T = translations[language];
    const auth = useAuth();

    const menuItems = [
      { id: 'dashboard', label: T.dashboard, icon: LayoutDashboard },
      { id: 'projects', label: T.projects, icon: HardHat },
      { id: 'employees', label: T.employees, icon: Briefcase }, 
      { id: 'clients', label: T.clients, icon: Users },
      { id: 'workforce', label: T.workforce, icon: Layers },
      { id: 'finance', label: T.finance, icon: Wallet },
      { id: 'profit-pilot', label: T.profitPilot, icon: Rocket },
    ];

    const handleLogout = () => {
      if (window.confirm(language === 'bn' ? 'আপনি কি লগ আউট করতে চান?' : 'Are you sure you want to logout?')) {
        signOut(auth);
      }
    };
  
    return (
      <>
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
        <div className={`
          fixed top-0 left-0 h-full w-64 bg-slate-900 text-white z-30 transform transition-transform duration-300 ease-in-out
          flex flex-col
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:h-screen
        `}>
          <div className="p-6 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="shrink-0">
                {logoUrl ? (
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-700 bg-white p-0.5 shadow-lg">
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="bg-primary p-2 rounded-lg">
                    <Building size={24} className="text-primary-foreground" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <h1 className="font-bold text-lg leading-tight break-words">{businessName || 'MIM Construction'}</h1>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mt-0.5">Construction Pro</span>
              </div>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden text-slate-400 p-1">
              <X size={24} />
            </button>
          </div>
  
          <nav className="p-4 space-y-2 flex-1 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === item.id 
                      ? 'bg-primary text-primary-foreground shadow-lg' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-800 space-y-2 shrink-0">
            <button
              onClick={() => {
                setActiveTab('settings');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'settings' 
                  ? 'bg-primary text-primary-foreground shadow-lg' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <SettingsIcon size={20} />
              <span className="font-medium">{T.settings}</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-400 hover:bg-red-500/10 hover:text-red-500"
            >
              <LogOut size={20} />
              <span className="font-medium">{language === 'bn' ? 'লগ আউট' : 'Logout'}</span>
            </button>
          </div>
        </div>
      </>
    );
};

export default Sidebar;
