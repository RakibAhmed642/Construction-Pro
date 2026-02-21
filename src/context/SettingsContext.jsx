
'use client';
import React, { createContext, useState, useEffect, useMemo } from 'react';
import { translations } from '@/lib/i18n';

export const SettingsContext = createContext();

export const DEFAULT_PAYROLL_RATES = {
  'Site Engineer': 50000,
  'Project Manager': 80000,
  'Foreman': 35000,
  'Mason (Rajmistri)': 28000,
  'Rod Mistri': 26000,
  'Electrician': 25000,
  'Plumber': 24000,
  'Painter': 22000,
  'Carpenter': 23000,
  'Tiles Mistri': 27000,
  'Security Guard': 15000,
  'Labor (Jogali)': 18000,
  'Other': 15000
};

export const DEFAULT_ROLES = [
  'Site Engineer', 'Foreman', 'Mason (Rajmistri)', 'Labor (Jogali)',
  'Rod Mistri', 'Electrician', 'Plumber', 'Painter', 'Carpenter',
  'Tiles Mistri', 'Security Guard', 'Project Manager', 'Other'
];

export const SettingsProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');
  const [userName, setUserName] = useState('Admin');
  const [businessName, setBusinessName] = useState('MIM Construction');
  const [logoUrl, setLogoUrl] = useState(null);
  const [payrollRates, setPayrollRates] = useState(DEFAULT_PAYROLL_RATES);
  const [overtimeMultiplier, setOvertimeMultiplier] = useState(1.5);
  const [roles, setRoles] = useState(DEFAULT_ROLES);
  
  // Bridge function to sync from DB (provided by AppContent)
  const [saveToDb, setSaveToDb] = useState(() => null);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const storedLang = localStorage.getItem('language');
    const storedUserName = localStorage.getItem('userName');
    const storedBusinessName = localStorage.getItem('businessName');
    const storedLogoUrl = localStorage.getItem('logoUrl');
    const storedPayrollRates = localStorage.getItem('payrollRates');
    const storedOTMult = localStorage.getItem('overtimeMultiplier');
    const storedRoles = localStorage.getItem('roles');

    if (storedTheme) setTheme(storedTheme);
    if (storedLang) setLanguage(storedLang);
    if (storedUserName) setUserName(storedUserName);
    if (storedBusinessName) setBusinessName(storedBusinessName);
    if (storedLogoUrl) setLogoUrl(storedLogoUrl);
    if (storedPayrollRates) setPayrollRates(JSON.parse(storedPayrollRates));
    if (storedOTMult) setOvertimeMultiplier(parseFloat(storedOTMult));
    if (storedRoles) setRoles(JSON.parse(storedRoles));
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  useEffect(() => localStorage.setItem('language', language), [language]);
  useEffect(() => localStorage.setItem('userName', userName), [userName]);
  useEffect(() => localStorage.setItem('businessName', businessName), [businessName]);
  useEffect(() => {
    if (logoUrl) localStorage.setItem('logoUrl', logoUrl);
    else localStorage.removeItem('logoUrl');
  }, [logoUrl]);
  useEffect(() => localStorage.setItem('payrollRates', JSON.stringify(payrollRates)), [payrollRates]);
  useEffect(() => localStorage.setItem('overtimeMultiplier', overtimeMultiplier.toString()), [overtimeMultiplier]);
  useEffect(() => localStorage.setItem('roles', JSON.stringify(roles)), [roles]);

  const value = useMemo(() => ({
    theme, setTheme,
    language, setLanguage,
    userName, setUserName,
    businessName, setBusinessName,
    logoUrl, setLogoUrl,
    payrollRates, setPayrollRates,
    overtimeMultiplier, setOvertimeMultiplier,
    roles, setRoles,
    saveToDb, setSaveToDb,
    translations
  }), [theme, language, userName, businessName, logoUrl, payrollRates, overtimeMultiplier, roles, saveToDb]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
