
'use client';
import React, { useContext, useState, useEffect, useRef } from 'react';
import { SettingsContext, DEFAULT_PAYROLL_RATES, DEFAULT_ROLES } from '@/context/SettingsContext';
import { Sun, Moon, Languages, User, Building, Wallet, Save, CheckCircle, Plus, X, Briefcase, Camera, Upload } from 'lucide-react';
import { Modal } from '@/components/UI';

const Settings = () => {
    const { 
        theme, setTheme, 
        language, setLanguage, 
        userName, setUserName, 
        businessName, setBusinessName,
        logoUrl, setLogoUrl,
        payrollRates, setPayrollRates,
        overtimeMultiplier, setOvertimeMultiplier,
        roles, setRoles,
        saveToDb,
        translations 
    } = useContext(SettingsContext);
    
    const T = translations[language];
    const [tempUserName, setTempUserName] = useState(userName);
    const [tempBusinessName, setTempBusinessName] = useState(businessName);
    const [tempLogoUrl, setTempLogoUrl] = useState(logoUrl);
    const [tempRates, setTempRates] = useState(payrollRates);
    const [tempOT, setTempOT] = useState(overtimeMultiplier);
    const [tempRoles, setTempRoles] = useState(roles);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');
    
    const fileInputRef = useRef(null);

    useEffect(() => {
        setTempUserName(userName);
        setTempBusinessName(businessName);
        setTempLogoUrl(logoUrl);
        setTempRates(payrollRates);
        setTempOT(overtimeMultiplier);
        setTempRoles(roles);
    }, [userName, businessName, logoUrl, payrollRates, overtimeMultiplier, roles]);

    const handleSave = () => {
        setUserName(tempUserName);
        setBusinessName(tempBusinessName);
        setLogoUrl(tempLogoUrl);
        setPayrollRates(tempRates);
        setOvertimeMultiplier(tempOT);
        setRoles(tempRoles);
        
        if (saveToDb) {
            saveToDb({
                userName: tempUserName,
                businessName: tempBusinessName,
                logoUrl: tempLogoUrl,
                payrollRates: tempRates,
                overtimeMultiplier: tempOT,
                roles: tempRoles
            });
        }

        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_SIZE = 400;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_SIZE) {
                        height *= MAX_SIZE / width;
                        width = MAX_SIZE;
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width *= MAX_SIZE / height;
                        height = MAX_SIZE;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                const webpData = canvas.toDataURL('image/webp', 0.8);
                setTempLogoUrl(webpData);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    const handleRateChange = (role, val) => {
        setTempRates(prev => ({
            ...prev,
            [role]: Number(val) || 0
        }));
    };

    const handleAddRole = (e) => {
        e.preventDefault();
        if (!newRoleName.trim()) return;
        
        const role = newRoleName.trim();
        if (!tempRoles.includes(role)) {
            setTempRoles([...tempRoles, role]);
            setTempRates(prev => ({ ...prev, [role]: 0 }));
        }
        
        setNewRoleName('');
        setIsAddRoleModalOpen(false);
    };

    const handleRemoveRole = (role) => {
        if (window.confirm(T.confirmDelete)) {
            setTempRoles(tempRoles.filter(r => r !== role));
            const { [role]: _, ...remainingRates } = tempRates;
            setTempRates(remainingRates);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in-up max-w-4xl mx-auto pb-20">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-foreground">{T.settings}</h2>
                <button 
                    onClick={handleSave}
                    className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
                >
                    <Save size={18} />
                    {T.saveSettings}
                </button>
            </div>

            {showSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-3 text-emerald-600 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle size={20} />
                    <span className="font-semibold">{T.settingsSaved}</span>
                </div>
            )}

            <div className="bg-card p-8 rounded-2xl border border-border shadow-sm space-y-8">
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <User size={20} className="text-primary" /> {T.profile}
                </h3>
                
                <div className="flex flex-col md:flex-row items-center gap-10">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-border overflow-hidden bg-muted flex items-center justify-center relative">
                            {tempLogoUrl ? (
                                <img src={tempLogoUrl} alt="Business Logo" className="w-full h-full object-contain" />
                            ) : (
                                <div className="text-center p-4">
                                    <Building size={32} className="text-muted-foreground mx-auto mb-2" />
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Business Logo</span>
                                </div>
                            )}
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                            >
                                <Camera className="text-white" size={24} />
                            </div>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleLogoChange} accept="image/*" className="hidden" />
                        {tempLogoUrl && (
                            <button 
                                onClick={() => setTempLogoUrl(null)}
                                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-md hover:bg-destructive/90 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-muted-foreground">{T.userName}</label>
                            <input 
                                type="text" 
                                value={tempUserName} 
                                onChange={(e) => setTempUserName(e.target.value)}
                                className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-muted-foreground">{T.businessName}</label>
                            <input 
                                type="text" 
                                value={tempBusinessName} 
                                onChange={(e) => setTempBusinessName(e.target.value)}
                                className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-card p-8 rounded-2xl border border-border shadow-sm space-y-6">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <Wallet size={20} className="text-emerald-500" /> {T.payrollSettings}
                    </h3>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 bg-muted/50 p-2 rounded-xl border border-border">
                            <label className="text-xs font-bold text-muted-foreground uppercase">{T.overtimeMultiplier}</label>
                            <input 
                                type="number" 
                                step="0.1"
                                value={tempOT}
                                onChange={(e) => setTempOT(e.target.value)}
                                className="w-16 px-2 py-1 bg-card border border-border rounded-lg text-sm font-bold text-center focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                        </div>
                        <button 
                            onClick={() => setIsAddRoleModalOpen(true)}
                            className="p-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-md active:scale-95 group"
                            title={T.addNewRole}
                        >
                            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                    </div>
                </div>
                
                <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {tempRoles.map(role => (
                            <div key={role} className="space-y-1.5 p-4 bg-muted/30 rounded-xl border border-border/50 relative group/role">
                                <div className="flex justify-between items-start gap-2">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate block flex-1">
                                        {T[`role${role.replace(/\s/g, '').replace(/[()]/g, '')}`] || role}
                                    </label>
                                    {!DEFAULT_ROLES.includes(role) && (
                                        <button 
                                            onClick={() => handleRemoveRole(role)}
                                            className="text-muted-foreground hover:text-destructive opacity-0 group-hover/role:opacity-100 transition-opacity"
                                        >
                                            <X size={12} />
                                        </button>
                                    )}
                                </div>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">৳</span>
                                    <input 
                                        type="number" 
                                        value={tempRates[role] || 0} 
                                        onChange={(e) => handleRateChange(role, e.target.value)}
                                        className="w-full pl-7 pr-3 py-2 bg-card border border-border rounded-lg text-sm font-mono font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card p-8 rounded-2xl border border-border shadow-sm">
                    <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                        <Sun size={20} className="text-amber-500" /> {T.theme}
                    </h3>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setTheme('light')}
                            className={`flex-1 p-4 rounded-xl flex items-center justify-center gap-3 transition-all border-2 ${
                                theme === 'light' ? 'border-primary bg-primary/10 text-primary shadow-inner' : 'border-border bg-muted/50 hover:bg-accent'
                            }`}
                        >
                            <Sun size={20} />
                            <span className="font-bold">{T.light}</span>
                        </button>
                        <button
                            onClick={() => setTheme('dark')}
                            className={`flex-1 p-4 rounded-xl flex items-center justify-center gap-3 transition-all border-2 ${
                                theme === 'dark' ? 'border-primary bg-primary/10 text-primary shadow-inner' : 'border-border bg-muted/50 hover:bg-accent'
                            }`}
                        >
                            <Moon size={20} />
                            <span className="font-bold">{T.dark}</span>
                        </button>
                    </div>
                </div>

                <div className="bg-card p-8 rounded-2xl border border-border shadow-sm">
                    <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                        <Languages size={20} className="text-blue-500" /> {T.language}
                    </h3>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setLanguage('en')}
                            className={`flex-1 p-4 rounded-xl flex items-center justify-center gap-3 transition-all border-2 ${
                                language === 'en' ? 'border-primary bg-primary/10 text-primary shadow-inner' : 'border-border bg-muted/50 hover:bg-accent'
                            }`}
                        >
                            <span className="font-bold">{T.english}</span>
                        </button>
                        <button
                            onClick={() => setLanguage('bn')}
                            className={`flex-1 p-4 rounded-xl flex items-center justify-center gap-3 transition-all border-2 ${
                                language === 'bn' ? 'border-primary bg-primary/10 text-primary shadow-inner' : 'border-border bg-muted/50 hover:bg-accent'
                            }`}
                        >
                            <span className="font-bold">{T.bengali}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Add Role Modal with Unified Standardized Backdrop */}
            {isAddRoleModalOpen && (
                <Modal title={T.addNewRole} onClose={() => setIsAddRoleModalOpen(false)}>
                    <form onSubmit={handleAddRole} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-muted-foreground">{T.roleCategory}</label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <input 
                                    type="text"
                                    autoFocus
                                    value={newRoleName}
                                    onChange={(e) => setNewRoleName(e.target.value)}
                                    placeholder={T.enterRoleName}
                                    className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                                />
                            </div>
                        </div>
                        <button 
                            type="submit" 
                            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg active:scale-[0.98]"
                        >
                            {T.add}
                        </button>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default Settings;
