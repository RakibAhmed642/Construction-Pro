"use client";

import React, { useState, useEffect, useRef, useContext } from 'react';
import { SettingsContext } from '@/context/SettingsContext';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Camera, Calendar, Printer, ChevronDown, ChevronRight, RotateCcw, Layers, Wallet, Sliders, Activity, Scale, Gauge, Coins, Trophy, Percent, UserPlus, UserCheck, HeartPulse, Megaphone, FileText, Hourglass, Flame, Flag, ArrowDown, Users, Crosshair, Table, Trash2, Rocket, CheckCircle, AlertTriangle } from 'lucide-react';

ChartJS.register(...registerables);

const ProfitPilot = ({ scenarios = [], onAddScenario, onDeleteScenario }) => {
    // --- Safe Context Destructuring ---
    const context = useContext(SettingsContext) || {};
    const language = context.language || 'en';
    const theme = context.theme || 'light';
    const T = context.translations ? context.translations[language] : {};

    const [currency, setCurrency] = useState('BDT'); 
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [showTable, setShowTable] = useState(false);
    const [toast, setToast] = useState({ show: false, msg: '' });
    const [alert, setAlert] = useState({ show: false, msg: '' });
    const [snapshotData, setSnapshotData] = useState(null);
    const [scenarioName, setScenarioName] = useState('');

    const mainChartRef = useRef(null);
    const radarChartRef = useRef(null);
    const distChartRef = useRef(null);
    const breakEvenChartRef = useRef(null);
    const chartInstances = useRef({ main: null, radar: null, dist: null, breakEven: null });

    const [config, setConfig] = useState({
      preset: 'custom',
      investment: 50000,
      fixedCosts: 2000,
      marketing: 1000,
      margin: 25,
      demand: 70,
      growth: 5,
      risk: 10,
      loanAmount: 0,
      interestRate: 10,
      tax: 15,
      customers: 100,
      employees: 0,
      seasonality: 'none'
    });

    const [outputs, setOutputs] = useState({
      rowRev: 0, rowCOGS: 0, rowFixedMarketing: 0, rowInterest: 0, rowNet: 0,
      kpis: {}, swot: { s: [], w: [], o: [], t: [] }, aiInsights: [], ledger: [], sensitivity: {},
      charts: { labels: [], cashData: [], beRev: [], beCost: [], cogs: 0, opex: 0, tax: 0, profit: 0, roi: 0, efficiency: 0, scoreGrowth: 0, scoreSafety: 0 }
    });

    const presets = {
        saas: { margin: 85, risk: 15, demand: 30, fixedCosts: 3000, marketing: 2000, growth: 8, loanAmount: 50000, employees: 5 },
        ecommerce: { margin: 25, risk: 20, demand: 60, fixedCosts: 1000, marketing: 1500, growth: 5, loanAmount: 0, employees: 2 },
        restaurant: { margin: 20, risk: 25, demand: 65, fixedCosts: 4000, marketing: 500, growth: 3, loanAmount: 20000, employees: 8 },
        agency: { margin: 90, risk: 5, demand: 75, fixedCosts: 200, marketing: 100, growth: 10, loanAmount: 0, employees: 1 },
        manufacturing: { margin: 30, risk: 20, demand: 70, fixedCosts: 5000, marketing: 500, growth: 2, loanAmount: 100000, employees: 15 },
        custom: { margin: 40, risk: 10, demand: 50, fixedCosts: 1500, marketing: 500, growth: 5, loanAmount: 0, employees: 0 }
    };

    const currencies = {
      USD: { symbol: '$', locale: 'en-US', code: 'USD' },
      BDT: { symbol: '৳', locale: 'bn-BD', code: 'BDT' },
      EUR: { symbol: '€', locale: 'de-DE', code: 'EUR' }
    };

    const formatMoney = (num) => {
        const c = currencies[currency];
        return new Intl.NumberFormat(c.locale, { 
          style: 'currency', currency: c.code, maximumFractionDigits: 0, notation: "compact" 
        }).format(num || 0);
    };

    const showToastMsg = (msg) => {
        setToast({ show: true, msg });
        setTimeout(() => setToast({ show: false, msg: '' }), 3000);
    };

    useEffect(() => {
        const calculate = () => {
            const { investment, fixedCosts, marketing, margin, demand, growth, risk, loanAmount, interestRate, tax, customers, employees, seasonality } = config;
            const Invest = parseFloat(investment) || 0;
            const Fixed = parseFloat(fixedCosts) || 0;
            const Marketing = parseFloat(marketing) || 0;
            const PM = parseFloat(margin) || 0;
            const D = parseFloat(demand) || 0;
            const G = parseFloat(growth) || 0;
            const R = parseFloat(risk) || 0;
            const Loan = parseFloat(loanAmount) || 0;
            const IntRate = parseFloat(interestRate) || 0;
            const TaxRate = parseFloat(tax) || 0;
            const Cust = parseFloat(customers) || 1;
            const Empl = parseFloat(employees) || 0;

            let cash = -Invest + Loan;
            let totalRevenue = 0, totalNet = 0, totalEBITDA = 0;
            let lowestCash = cash, breakEvenMonth = null;
            let chartLabels = [], chartCash = [], breakEvenRevData = [], breakEvenCostData = [], ledgerData = [];
            let baseMonthlyRev = Invest * (D / 100);
            const monthlyInterest = (Loan * (IntRate / 100)) / 12;
            let sRev=0, sCOGS=0, sOpEx=0, sInt=0, sNet=0;

            for (let i = 1; i <= 12; i++) {
                let growthFactor = Math.pow(1 + (G/100), i-1);
                let seasonalMultiplier = 1;
                if (seasonality === 'seasonal') seasonalMultiplier = 1 + 0.3 * Math.sin((i - 1) * Math.PI / 6);
                else if (seasonality === 'volatile') seasonalMultiplier = 0.8 + Math.random() * 0.4;
                else if (seasonality === 'decay') seasonalMultiplier = 1.5 * Math.exp(-0.1 * i);

                let monthlyRev = baseMonthlyRev * growthFactor * seasonalMultiplier;
                let cogs = monthlyRev * (1 - PM/100);
                let riskLoss = (monthlyRev - cogs) * (R/100);
                let totalCOGS = cogs + riskLoss;
                let opEx = Fixed + Marketing;
                let totalCost = totalCOGS + opEx + monthlyInterest;
                let ebitda = monthlyRev - totalCOGS - opEx;
                let preTax = ebitda - monthlyInterest;
                let taxVal = preTax > 0 ? preTax * (TaxRate/100) : 0;
                let net = preTax - taxVal;

                if (taxVal > 0) totalCost += taxVal;
                totalRevenue += monthlyRev;
                totalNet += net;
                totalEBITDA += ebitda;
                cash += net;
                if (cash < lowestCash) lowestCash = cash;
                if (net > 0 && !breakEvenMonth) breakEvenMonth = i;
                if (i===1) { sRev = monthlyRev; sCOGS = totalCOGS; sOpEx = opEx; sInt = monthlyInterest + taxVal; sNet = net; }
                chartLabels.push(`${T.monthAbbr || 'M'}${i}`);
                chartCash.push(cash);
                breakEvenRevData.push(monthlyRev);
                breakEvenCostData.push(totalCost);
                ledgerData.push({ month: `${T.monthAbbr || 'M'}${i}`, rev: monthlyRev, exp: totalCOGS + opEx, net: net, cash: cash });
            }

            const avgNet = totalNet / 12;
            const roi = Invest > 0 ? (totalNet / Invest) * 100 : 0;
            const cac = Cust > 0 ? Marketing / Cust : 0;
            const arpu = Cust > 0 ? (totalRevenue / 12) / Cust : 0;
            const ltv = arpu * (PM/100) * 12;
            const ratio = cac > 0 ? ltv/cac : 0;
            let burn = Math.abs(avgNet);
            let runway = avgNet < 0 ? (Invest / burn) : Infinity;
            const effMargin = (PM/100)*(1-R/100);
            const breakEven = effMargin > 0 ? (Fixed+Marketing+monthlyInterest)/effMargin : 0;

            let tips = [];
            if (seasonality === 'volatile') tips.push(`🌊 <b>${T.pp_volatility_alert_title || 'Volatility Alert'}:</b> ${T.pp_volatility_alert_desc || 'High variance detected.'}`);
            if (seasonality === 'decay') tips.push(`📉 <b>${T.pp_hype_cycle_title || 'Hype Cycle'}:</b> ${T.pp_hype_cycle_desc || 'Revenue is decaying.'}`);
            if (runway < 6 && runway !== Infinity) tips.push(`⚠️ <b>${T.pp_critical_runway_title || 'Critical'}:</b> ${T.pp_critical_runway_desc ? T.pp_critical_runway_desc(runway.toFixed(1)) : 'Low cash runway.'}`);
            if (ratio > 5) tips.push(`🚀 <b>${T.pp_scale_opportunity_title || 'Scale Opportunity'}:</b> ${T.pp_scale_opportunity_desc ? T.pp_scale_opportunity_desc(ratio.toFixed(1)) : 'Good LTV:CAC.'}`);
            else if (ratio < 3 && ratio > 0) tips.push(`📉 <b>${T.pp_efficiency_warning_title || 'Efficiency Warning'}:</b> ${T.pp_efficiency_warning_desc || 'CAC is too high.'}`);
            if (lowestCash < 0) tips.push(`💰 <b>${T.pp_financing_needed_title || 'Financing Needed'}:</b> ${T.pp_financing_needed_desc || 'Secure a loan.'}`);
            if (tips.length === 0) tips.push(`✅ ${T.pp_healthy_business || 'Business is healthy.'}`);

            const s = [], w = [], o = [], t = [];
            if (PM > 50) s.push(T.swot_s_margin || 'High Margin'); if (roi > 20) s.push(T.swot_s_roi || 'Good ROI'); if (ratio > 3) s.push(T.swot_s_ltv || 'Strong LTV'); if (s.length === 0) s.push(T.swot_s_stable || 'Stable');
            if (PM < 20) w.push(T.swot_w_margin || 'Low Margin'); if (runway < 6 && runway !== Infinity) w.push(T.swot_w_runway || 'Short Runway'); if (ratio < 1) w.push(T.swot_w_marketing || 'Inefficient Marketing'); if (w.length === 0) w.push(T.swot_w_optimized || 'Optimized');
            if (G > 10) o.push(T.swot_o_scaling || 'Scaling'); if (seasonality === 'seasonal') o.push(T.swot_o_seasonal || 'Seasonal Peak'); if (Marketing < 500) o.push(T.swot_o_ads || 'Ad Expansion'); if (o.length === 0) o.push(T.swot_o_market || 'Market Expansion');
            if (R > 15) t.push(T.swot_t_risk || 'High Risk'); if (seasonality === 'volatile') t.push(T.swot_t_revenue || 'Unpredictable Rev'); if (Fixed > 5000) t.push(T.swot_t_overhead || 'High Overhead'); if (t.length === 0) t.push(T.swot_t_competition || 'Competition');

            const calcSen = (dMod, mMod) => {
                const newD = D * (1 + dMod); const newM = Math.min(100, PM * (1 + mMod));
                let rev = Invest * (newD / 100); let cogs = rev * (1 - newM/100);
                let riskVal = (rev - cogs) * (R/100); let opExVal = Fixed + Marketing + (Loan * (IntRate/100))/12;
                let preTaxVal = rev - cogs - riskVal - opExVal;
                return preTaxVal - (preTaxVal > 0 ? preTaxVal * (TaxRate/100) : 0);
            };
            const sensitivity = {
                s00: calcSen(-0.1, -0.1), s01: calcSen(0, -0.1), s02: calcSen(0.1, -0.1),
                s10: calcSen(-0.1, 0),    s11: calcSen(0, 0),    s12: calcSen(0.1, 0),
                s20: calcSen(-0.1, 0.1),  s21: calcSen(0, 0.1),  s22: calcSen(0.1, 0.1)
            };

            const scoreGrowth = Math.min(100, Math.max(0, G * 5)); 
            const scoreProfit = Math.min(100, Math.max(0, roi * 2)); 
            const scoreSafety = Math.min(100, Math.max(0, 100 - R)); 
            const scoreEff = Math.min(100, Math.max(0, effMargin * 200));

            if (lowestCash < 0 && runway !== Infinity) setAlert({ show: true, msg: `${T.pp_alert_critical || 'CRITICAL ALERT: Cash runway only'} ${runway.toFixed(1)} ${T.pp_alert_months || 'months'}` });
            else if (lowestCash < 1000) setAlert({ show: true, msg: `${T.pp_alert_warning || 'WARNING: Low Cash Reserves'} (${formatMoney(lowestCash)})` });
            else setAlert({ show: false, msg: '' });

            setOutputs({
                rowRev: sRev, rowCOGS: sCOGS, rowFixedMarketing: sOpEx, rowInterest: sInt, rowNet: sNet,
                kpis: {
                    m1_net: avgNet, m1_sub: totalRevenue > 0 ? ((totalNet/totalRevenue)*100).toFixed(1) + '%' : '0%',
                    m2_ebitda: totalEBITDA, m3_roi: roi.toFixed(1) + '%', m4_rev: totalRevenue, m5_margin: PM + '%',
                    m6_cac: cac, m7_ltv: ltv, m8_ratio: ratio.toFixed(1) + 'x', m9_roas: (Marketing > 0 ? totalRevenue / (Marketing*12) : 0).toFixed(2) + 'x',
                    m10_opex: (totalRevenue > 0 ? ((Fixed+Marketing)*12 / totalRevenue)*100 : 0).toFixed(1) + '%',
                    m11_payback: avgNet > 0 ? ((Invest-Loan)/avgNet).toFixed(1) + ` ${T.pp_months || 'Mo'}` : (T.pp_never || 'Never'),
                    m12_runway: runway === Infinity ? '∞' : runway.toFixed(1) + ` ${T.pp_months || 'Mo'}`, m13_be: breakEven,
                    m14_floor: lowestCash, m15_rpe: Empl > 0 ? totalRevenue/Empl : 0
                },
                swot: { s, w, o, t }, aiInsights: tips, ledger: ledgerData, sensitivity: sensitivity,
                charts: {
                    labels: chartLabels, cashData: chartCash, beRev: breakEvenRevData, beCost: breakEvenCostData,
                    cogs: sCOGS, opex: sOpEx, tax: sInt, profit: Math.max(0, sNet),
                    scoreGrowth, scoreProfit, scoreSafety, scoreEff
                }
            });
        };
        calculate();
    }, [config, currency, T]);

    useEffect(() => {
        if (!mainChartRef.current) return;
        const darkMode = theme === 'dark';

        const themeText = darkMode ? '#94a3b8' : '#64748b';
        const themeGrid = darkMode ? '#1e293b' : '#f1f5f9';
        const themeBaseline = darkMode ? '#475569' : '#94a3b8';

        ChartJS.defaults.font.family = "'Inter', sans-serif";
        ChartJS.defaults.color = themeText;
        ChartJS.defaults.scale.grid.color = themeGrid;

        Object.values(chartInstances.current).forEach(chart => chart?.destroy());

        chartInstances.current.main = new ChartJS(mainChartRef.current, {
            type: 'line',
            data: { 
                labels: outputs.charts.labels, 
                datasets: [
                    { label: T.pp_cash_flow_title || 'Cash Flow', data: outputs.charts.cashData, borderColor: '#0ea5e9', backgroundColor: 'rgba(14, 165, 233, 0.2)', fill: true, tension: 0.3, pointRadius: 2, pointBackgroundColor: '#fff' },
                    ...(snapshotData ? [{ label: T.pp_baseline || 'Baseline', data: snapshotData, borderColor: themeBaseline, borderDash: [5, 5], fill: false, pointRadius: 0 }] : [])
                ] 
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { ticks: { callback: (v) => formatMoney(v) } } } }
        });

        chartInstances.current.breakEven = new ChartJS(breakEvenChartRef.current, {
            type: 'line',
            data: { labels: outputs.charts.labels, datasets: [
                { label: T.revenue || 'Revenue', data: outputs.charts.beRev, borderColor: '#10b981', fill: false, tension: 0.4 },
                { label: T.expenses || 'Expenses', data: outputs.charts.beCost, borderColor: '#ef4444', borderDash: [4,4], fill: false, tension: 0.1 }
            ]},
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { ticks: { callback: (v) => formatMoney(v) } } } }
        });

        chartInstances.current.dist = new ChartJS(distChartRef.current, {
            type: 'doughnut',
            data: { labels: [T.pp_cogs_risk || 'COGS', T.pp_opex || 'OpEx', T.pp_tax_int || 'Tax/Int', T.pp_profit || 'Profit'], datasets: [{ data: [outputs.charts.cogs, outputs.charts.opex, outputs.charts.tax, outputs.charts.profit], backgroundColor: ['#64748b', '#f59e0b', '#94a3b8', '#10b981'], borderWidth: 0 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { boxWidth: 8, font: { size: 10 } } } }, cutout: '70%' }
        });

        chartInstances.current.radar = new ChartJS(radarChartRef.current, {
            type: 'radar',
            data: { labels: [T.pp_growth || 'Growth', T.pp_profit || 'Profit', T.pp_safety || 'Safety', T.pp_efficiency || 'Efficiency'], datasets: [{ label: T.pp_current || 'Current', data: [outputs.charts.scoreGrowth, outputs.charts.scoreProfit, outputs.charts.scoreSafety, outputs.charts.scoreEff], borderColor: '#8b5cf6', backgroundColor: 'rgba(139, 92, 246, 0.2)' }] },
            options: { responsive: true, maintainAspectRatio: false, scales: { r: { min: 0, max: 100, ticks: { display: false }, pointLabels: { font: { size: 10, weight: 'bold' } } } }, plugins: { legend: { display: false } } }
        });

    }, [outputs, theme, snapshotData, currency, T]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    const handlePresetChange = (e) => {
        const val = e.target.value;
        setConfig(prev => ({ ...prev, preset: val, ...(presets[val] || {}) }));
    };

    const resetInputs = () => {
        if(window.confirm(T.pp_confirm_reset || 'Reset all inputs?')) {
            setConfig({ preset: 'custom', investment: 50000, fixedCosts: 2000, marketing: 1000, margin: 25, demand: 70, growth: 5, risk: 10, loanAmount: 0, interestRate: 10, tax: 15, customers: 100, employees: 0, seasonality: 'none' });
            setSnapshotData(null);
            showToastMsg(T.pp_reset_complete || 'Reset complete');
        }
    };

    const handleSaveScenario = () => {
        if (!scenarioName.trim()) { showToastMsg(T.pp_scenario_name_req || 'Scenario name required'); return; }
        onAddScenario?.({ 
            name: scenarioName, 
            date: new Date().toLocaleDateString(), 
            data: config 
        });
        setScenarioName('');
        showToastMsg(T.pp_scenario_saved || 'Scenario saved');
    };

    const loadScenario = (id) => {
        const s = scenarios.find(sc => sc.id === id);
        if (s) {
            setConfig(s.data);
            showToastMsg(`${T.pp_loaded || 'Loaded'}: ${s.name}`);
        }
    };
    
    const takeSnapshot = () => {
        if (outputs.charts.cashData.length > 0) {
            setSnapshotData([...outputs.charts.cashData]);
            showToastMsg(T.pp_snapshot_saved || 'Snapshot saved');
        }
    };

    const kpiCards = [
        { id: 'm1_net', label: T.pp_kpi_avg_profit || 'Avg Profit', icon: Wallet, value: formatMoney(outputs.kpis.m1_net), sub: outputs.kpis.m1_sub, subIcon: Activity, colorize: true },
        { id: 'm2_ebitda', label: T.pp_kpi_ebitda || 'EBITDA', icon: Layers, value: formatMoney(outputs.kpis.m2_ebitda), sub: T.pp_kpi_ebitda_sub || 'Operating Income' },
        { id: 'm3_roi', label: T.pp_kpi_roi || 'ROI', icon: Trophy, value: outputs.kpis.m3_roi, sub: T.pp_kpi_roi_sub || 'Target: 15%', subColor: 'text-emerald-600', border: 'border-b-emerald-500' },
        { id: 'm4_rev', label: T.pp_kpi_total_rev || 'Total Rev', icon: Coins, value: formatMoney(outputs.kpis.m4_rev), sub: T.pp_kpi_total_rev_sub || 'Growth included', subColor: 'text-purple-600' },
        { id: 'm5_margin', label: T.pp_kpi_g_margin || 'Gross Margin', icon: Percent, value: outputs.kpis.m5_margin, sub: T.pp_kpi_g_margin_sub || 'Efficiency' },
        { id: 'm6_cac', label: T.pp_kpi_cac || 'CAC', icon: UserPlus, value: formatMoney(outputs.kpis.m6_cac), sub: T.pp_kpi_cac_sub || 'Cost/Acquisition' },
        { id: 'm7_ltv', label: T.pp_kpi_ltv || 'LTV', icon: UserCheck, value: formatMoney(outputs.kpis.m7_ltv), sub: T.pp_kpi_ltv_sub || 'Lifetime Val' },
        { id: 'm8_ratio', label: T.pp_kpi_ltv_cac || 'LTV:CAC', icon: HeartPulse, value: outputs.kpis.m8_ratio, sub: T.pp_kpi_ltv_cac_sub || 'Health Metric', subColor: 'text-indigo-600', border: 'border-b-indigo-500' },
        { id: 'm9_roas', label: T.pp_kpi_roas || 'ROAS', icon: Megaphone, value: outputs.kpis.m9_roas, sub: T.pp_kpi_roas_sub || 'Ad Efficiency' },
        { id: 'm10_opex', label: T.pp_kpi_opex_ratio || 'OpEx Ratio', icon: FileText, value: outputs.kpis.m10_opex, sub: T.pp_kpi_opex_ratio_sub || 'Overhead' },
        { id: 'm11_payback', label: T.pp_kpi_payback || 'Payback', icon: Hourglass, value: outputs.kpis.m11_payback, sub: T.pp_kpi_payback_sub || 'Time to ROI' },
        { id: 'm12_runway', label: T.pp_kpi_runway || 'Runway', icon: Flame, value: outputs.kpis.m12_runway, sub: T.pp_kpi_runway_sub || 'Survival Time', subColor: 'text-red-500', border: 'border-b-red-500' },
        { id: 'm13_be', label: T.pp_kpi_breakeven || 'Break-Even', icon: Flag, value: formatMoney(outputs.kpis.m13_be), sub: T.pp_kpi_breakeven_sub || 'Target Rev.' },
        { id: 'm14_floor', label: T.pp_kpi_cash_floor || 'Cash Floor', icon: ArrowDown, value: formatMoney(outputs.kpis.m14_floor), colorize: true, sub: T.pp_kpi_cash_floor_sub || 'Min Balance' },
        { id: 'm15_rpe', label: T.pp_kpi_rev_emp || 'Rev/Emp', icon: Users, value: formatMoney(outputs.kpis.m15_rpe), colorize: true, sub: T.pp_kpi_rev_emp_sub || 'Productivity' },
    ];
      
    return (
        <div className={`space-y-8 animate-fade-in pb-12 max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 ${theme === 'dark' ? 'dark' : ''}`}>
            
            {toast.show && (
                <div className="fixed top-20 right-5 z-[100] transform transition-all duration-500 translate-x-0 opacity-100">
                    <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 border-l-4 border-emerald-500">
                        <div className="bg-emerald-500/20 rounded-full p-1"><CheckCircle className="text-emerald-500 text-lg" /></div>
                        <div><h6 className="font-bold text-sm">{T.pp_system_notification || 'System Notification'}</h6><span className="text-xs opacity-90">{toast.msg}</span></div>
                    </div>
                </div>
            )}

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                <h2 className="text-3xl font-extrabold tracking-tight text-card-foreground">{T.profitPilot || 'Profit Pilot'}</h2>
                <p className="text-muted-foreground mt-2 text-sm">{T.pp_subtitle || 'Strategic Command Center for Business Simulation'}</p>
                </div>
                <div className="flex items-center gap-3">
                <button onClick={takeSnapshot} className={`flex items-center gap-2 bg-card text-foreground px-4 py-2 rounded-lg text-sm font-semibold transition-all border border-border shadow-sm active:scale-95 group ${snapshotData ? 'border-primary text-primary' : 'hover:bg-accent'}`}>
                    <Camera size={16} className="group-hover:rotate-12 transition-transform" /> 
                    <span>{snapshotData ? (T.pp_baseline_set || 'Baseline Set') : (T.pp_snapshot || 'Snapshot')}</span>
                </button>
                <button onClick={() => window.print()} className="bg-foreground text-background px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm font-semibold text-sm">
                    <Printer size={16}/> {T.print || 'Print'}
                </button>
                </div>
            </div>

            {alert.show && (
                <div className="bg-red-500/10 border-b border-red-500/20 p-2 flex items-center justify-center gap-3 text-red-600 dark:text-red-400">
                    <AlertTriangle className="animate-pulse" /> <span className="text-xs font-bold uppercase tracking-wide">{alert.msg}</span>
                </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                {/* LEFT CONTROL DECK */}
                <div className="lg:col-span-3 space-y-6 no-print order-2 lg:order-1">
                    <div className="flex items-center gap-2 mb-2 px-1">
                        <Sliders size={14} className="text-slate-400" />
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{T.pp_configuration || 'Configuration'}</h3>
                    </div>

                    <div className="glass-card rounded-2xl p-1">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Layers size={12} className="text-slate-400" /></div>
                            <select name="preset" value={config.preset} onChange={handlePresetChange} className="w-full bg-slate-50 dark:bg-slate-900/50 border-0 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl focus:ring-2 focus:ring-primary-500 block pl-9 p-3 appearance-none transition-all cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                                <option value="custom">{T.pp_preset_custom || 'Custom Setup'}</option>
                                <option value="saas">{T.pp_preset_saas || 'SaaS (B2B)'}</option>
                                <option value="ecommerce">{T.pp_preset_ecommerce || 'E-commerce'}</option>
                                <option value="restaurant">{T.pp_preset_restaurant || 'Restaurant'}</option>
                                <option value="agency">{T.pp_preset_agency || 'Agency'}</option>
                                <option value="manufacturing">{T.pp_preset_manufacturing || 'Manufacturing'}</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400"><ChevronDown size={10} /></div>
                        </div>
                    </div>

                    <div className="glass-card rounded-2xl overflow-hidden flex flex-col sticky top-24">
                        <div className="p-4 bg-muted/50 border-b border-border flex justify-between items-center">
                            <h3 className="font-bold text-foreground text-xs uppercase tracking-wider">{T.pp_input_parameters || 'Input Parameters'}</h3>
                            <button onClick={resetInputs} className="text-[10px] text-slate-400 hover:text-red-500 font-bold uppercase transition-colors flex items-center gap-1"><RotateCcw size={12} /> {T.pp_reset || 'Reset'}</button>
                        </div>
                        <div className="p-5 space-y-8 overflow-y-auto custom-scrollbar">
                            <div className="group">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1.5 flex justify-between">{T.pp_initial_investment || 'Initial Investment'} <Wallet className="text-slate-300" /></label>
                                <div className="relative"><span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">{currencies[currency].symbol}</span>
                                    <input type="number" name="investment" value={config.investment} onChange={handleInputChange} className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-border bg-background text-sm font-mono font-bold text-foreground focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-[10px] font-bold text-muted-foreground uppercase mb-1.5 block">{T.pp_fixed_costs || 'Fixed Costs'}</label><input type="number" name="fixedCosts" value={config.fixedCosts} onChange={handleInputChange} className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm font-mono font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all" /></div>
                                <div><label className="text-[10px] font-bold text-muted-foreground uppercase mb-1.5 block">{T.pp_ads_costs || 'Ads Costs'}</label><input type="number" name="marketing" value={config.marketing} onChange={handleInputChange} className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm font-mono font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all" /></div>
                            </div>
                            <div className="space-y-7 pt-2">
                                 <div>
                                    <div className="flex justify-between items-end mb-2"><label className="text-sm font-bold text-foreground">{T.pp_gross_margin || 'Gross Margin'}</label><span className="text-xs font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">{config.margin}%</span></div>
                                    <input type="range" name="margin" min="0" max="100" value={config.margin} onChange={handleInputChange} className="slider-emerald" />
                                </div>
                                <div>
                                    <div className="flex justify-between items-end mb-2"><label className="text-sm font-bold text-foreground">{T.pp_market_demand || 'Market Demand'}</label><span className="text-xs font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-md border border-blue-200 dark:border-blue-800">{config.demand}%</span></div>
                                    <input type="range" name="demand" min="0" max="100" value={config.demand} onChange={handleInputChange} className="slider-blue" />
                                </div>
                                <div>
                                    <div className="flex justify-between items-end mb-2"><label className="text-sm font-bold text-foreground">{T.pp_monthly_growth || 'Monthly Growth'}</label><span className="text-xs font-bold text-purple-600 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-md border border-purple-200 dark:border-purple-800">{config.growth}%</span></div>
                                    <input type="range" name="growth" min="0" max="20" step="0.5" value={config.growth} onChange={handleInputChange} className="slider-purple" />
                                </div>
                                 <div>
                                    <div className="flex justify-between items-end mb-2"><label className="text-sm font-bold text-foreground">{T.pp_risk_factor || 'Risk Factor'}</label><span className="text-xs font-bold text-red-500 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-md border border-red-200 dark:border-red-800">{config.risk}%</span></div>
                                    <input type="range" name="risk" min="0" max="100" value={config.risk} onChange={handleInputChange} className="slider-red" />
                                </div>
                            </div>
                            <div className="pt-4 border-t border-border">
                                <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-xs font-bold text-muted-foreground hover:text-primary-500 w-full flex justify-between items-center bg-muted p-3 rounded-lg border border-border transition-all">
                                    <span className="uppercase tracking-wider">{T.pp_advanced_config || 'Advanced Config'}</span><ChevronRight size={16} className={`transition-transform duration-300 ${showAdvanced ? 'rotate-90' : ''}`} />
                                </button>
                                {showAdvanced && (
                                    <div className="mt-3 space-y-4 p-4 rounded-xl border border-border bg-background/50">
                                        <div className="bg-card p-3 rounded-lg border border-border"><label className="text-[9px] font-bold text-primary-500 block mb-2 uppercase tracking-wide">{T.pp_seasonality || 'Seasonality'}</label><select name="seasonality" value={config.seasonality} onChange={handleInputChange} className="w-full text-xs font-bold p-2 rounded-lg border border-border bg-background focus:ring-1 focus:ring-primary-500 outline-none"><option value="none">{T.pp_season_linear || 'Linear'}</option><option value="seasonal">{T.pp_season_seasonal || 'Seasonal'}</option><option value="volatile">{T.pp_season_volatile || 'Volatile'}</option><option value="decay">{T.pp_season_decay || 'Decaying'}</option></select></div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div><label className="text-[9px] font-bold text-muted-foreground block mb-1.5">{T.pp_loan_amount || 'Loan Amount'}</label><input type="number" name="loanAmount" value={config.loanAmount} onChange={handleInputChange} className="w-full text-xs font-bold p-2 rounded-lg border border-border bg-card focus:ring-1 focus:ring-primary-500 outline-none" /></div>
                                            <div><label className="text-[9px] font-bold text-muted-foreground block mb-1.5">{T.pp_interest_rate || 'Interest %'}</label><input type="number" name="interestRate" value={config.interestRate} onChange={handleInputChange} className="w-full text-xs font-bold p-2 rounded-lg border border-border bg-card focus:ring-1 focus:ring-primary-500 outline-none" /></div>
                                            <div><label className="text-[9px] font-bold text-muted-foreground block mb-1.5">{T.pp_tax_rate || 'Tax %'}</label><input type="number" name="tax" value={config.tax} onChange={handleInputChange} className="w-full text-xs font-bold p-2 rounded-lg border border-border bg-card focus:ring-1 focus:ring-primary-500 outline-none" /></div>
                                            <div><label className="text-[9px] font-bold text-muted-foreground block mb-1.5">{T.pp_customer_base || 'Customers'}</label><input type="number" name="customers" value={config.customers} onChange={handleInputChange} className="w-full text-xs font-bold p-2 rounded-lg border border-border bg-card focus:ring-1 focus:ring-primary-500 outline-none" /></div>
                                            <div className="col-span-2"><label className="text-[9px] font-bold text-muted-foreground block mb-1.5">{T.pp_employee_count || 'Employees'}</label><input type="number" name="employees" value={config.employees} onChange={handleInputChange} className="w-full text-xs font-bold p-2 rounded-lg border border-border bg-card focus:ring-1 focus:ring-primary-500 outline-none" /></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* MAIN DASHBOARD */}
                <div className="lg:col-span-9 space-y-6 lg:space-y-8 order-1 lg:order-2">
                    <div className="glass-card rounded-2xl p-6 lg:p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-8 flex flex-col h-full border-b lg:border-b-0 lg:border-r border-border lg:pr-8 pb-6 lg:pb-0">
                               <div className="flex justify-between items-center mb-6">
                                    <div><h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-2 h-6 bg-emerald-500 rounded-full"></div> {T.pp_cash_flow_title || 'Cash Flow Projection'}</h4><p className="text-[10px] text-muted-foreground mt-1 pl-3 font-medium">{T.pp_cash_flow_subtitle || '12 Months'}</p></div>
                                    <div className="flex gap-4">
                                        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div><span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{T.pp_current || 'Current'}</span></div>
                                        {snapshotData && <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-slate-400"></div><span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{T.pp_baseline || 'Baseline'}</span></div>}
                                    </div>
                                </div>
                                <div className="chart-wrapper flex-grow"><canvas ref={mainChartRef}></canvas></div>
                            </div>
                            <div className="lg:col-span-4 flex flex-col justify-between h-full pl-2">
                               <div className="bg-muted rounded-xl p-5 border border-border">
                                  <h4 className="text-[10px] font-extrabold text-muted-foreground uppercase mb-4 tracking-widest flex items-center gap-2"><Calendar size={14} /> {T.pp_month_1_snapshot || 'M1 Snapshot'}</h4>
                                  <div className="space-y-3 text-sm">
                                      <div className="flex justify-between items-center"><span className="text-muted-foreground text-xs font-semibold">{T.revenue || 'Revenue'}</span><span className="font-bold text-foreground font-mono">{formatMoney(outputs.rowRev)}</span></div>
                                      <div className="flex justify-between items-center"><span className="text-muted-foreground text-xs font-semibold">{T.pp_cogs_risk || 'COGS'}</span><span className="font-semibold text-red-400 font-mono text-xs">-{formatMoney(outputs.rowCOGS)}</span></div>
                                      <div className="flex justify-between items-center"><span className="text-muted-foreground text-xs font-semibold">{T.pp_opex || 'OpEx'}</span><span className="font-semibold text-orange-400 font-mono text-xs">-{formatMoney(outputs.rowFixedMarketing)}</span></div>
                                      <div className="flex justify-between items-center"><span className="text-muted-foreground text-xs font-semibold">{T.pp_debt_service || 'Debt Service'}</span><span className="font-semibold text-slate-400 font-mono text-xs">-{formatMoney(outputs.rowInterest)}</span></div>
                                      <div className="h-px bg-border my-2"></div>
                                      <div className="flex justify-between items-center"><span className="font-bold text-foreground text-sm">{T.netProfit || 'Net Profit'}</span><span className={`font-bold font-mono text-xl tracking-tight ${outputs.rowNet >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{formatMoney(outputs.rowNet)}</span></div>
                                  </div>
                               </div>
                               <div className="mt-6 flex-grow flex flex-col justify-end">
                                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase mb-3 tracking-widest text-center">{T.pp_cost_distribution || 'Cost Distribution'}</h4>
                                    <div className="h-[140px] w-full relative"><canvas ref={distChartRef}></canvas></div>
                               </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card rounded-xl p-0.5 bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary-100 dark:border-primary-900">
                        <div className="bg-background/80 backdrop-blur rounded-[10px] p-5 flex items-start gap-5 relative overflow-hidden">
                            <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>
                            <div className="bg-gradient-to-br from-primary to-indigo-600 text-white w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/30"><Rocket size={18} className="animate-pulse" /></div>
                            <div>
                                <h4 className="text-sm font-bold text-foreground mb-1.5 flex items-center gap-2">{T.pp_ai_analyst || 'AI Analyst'} <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold uppercase">{T.pp_beta || 'Beta'}</span></h4>
                                <div className="text-xs text-muted-foreground leading-relaxed space-y-1.5">
                                    {outputs.aiInsights.map((tip, i) => <div key={i} className='flex gap-2 items-start'><span className='mt-1 text-primary'>•</span><span dangerouslySetInnerHTML={{__html: tip}}></span></div>)}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        <div className="glass-card rounded-2xl p-6 flex flex-col relative overflow-hidden">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-4"><Activity size={14} className="text-purple-500" /> {T.pp_business_health || 'Business Health'}</h4>
                            <div className="relative w-full h-[220px] flex items-center justify-center z-10"><canvas ref={radarChartRef}></canvas></div>
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-100/50 via-transparent to-transparent dark:from-slate-800/20 dark:to-transparent pointer-events-none"></div>
                        </div>
                        <div className="glass-card rounded-2xl p-6 flex flex-col">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-5"><Crosshair size={14} className="text-blue-500" /> {T.pp_sensitivity_analysis || 'Sensitivity'}</h4>
                            <div className="grid grid-cols-4 gap-2 text-[10px] font-mono text-center flex-grow">
                                <div className="col-start-2 bg-muted p-2 rounded-lg text-muted-foreground font-bold">{T.pp_sens_demand_neg || '-10% Dmd'}</div>
                                <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg text-primary font-bold">{T.pp_sens_base || 'Base'}</div>
                                <div className="bg-muted p-2 rounded-lg text-muted-foreground font-bold">{T.pp_sens_demand_pos || '+10% Dmd'}</div>
                                <div className="bg-muted p-2 rounded-lg flex items-center justify-center font-bold text-muted-foreground">{T.pp_sens_margin_neg || '-10% Mgn'}</div>
                                {['s00', 's01', 's02'].map(k => <div key={k} className={`matrix-cell p-2 flex items-center justify-center rounded-lg border border-border font-bold ${outputs.sensitivity[k] >= 0 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-red-500 bg-red-50 dark:bg-red-900/20'}`}>{formatMoney(outputs.sensitivity[k] || 0)}</div>)}
                                <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg flex items-center justify-center font-bold text-primary">{T.pp_sens_base || 'Base'}</div>
                                {['s10', 's11', 's12'].map(k => <div key={k} className={`matrix-cell p-2 flex items-center justify-center rounded-lg border ${k==='s11' ? 'bg-primary/10 border-primary/20 font-bold shadow-inner' : 'border-border font-bold ' + (outputs.sensitivity[k] >= 0 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-red-500 bg-red-50 dark:bg-red-900/20')}`}>{formatMoney(outputs.sensitivity[k] || 0)}</div>)}
                                <div className="bg-muted p-2 rounded-lg flex items-center justify-center font-bold text-muted-foreground">{T.pp_sens_margin_pos || '+10% Mgn'}</div>
                                {['s20', 's21', 's22'].map(k => <div key={k} className={`matrix-cell p-2 flex items-center justify-center rounded-lg border border-border font-bold ${outputs.sensitivity[k] >= 0 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-red-500 bg-red-50 dark:bg-red-900/20'}`}>{formatMoney(outputs.sensitivity[k] || 0)}</div>)}
                            </div>
                        </div>
                        <div className="glass-card rounded-2xl overflow-hidden md:col-span-2 xl:col-span-1 flex flex-col h-full">
                            <div className="p-5 bg-muted/50 flex justify-between items-center border-b border-border cursor-pointer group" onClick={() => setShowTable(!showTable)}>
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2"><Table size={14} /> {T.pp_detailed_ledger || 'Ledger'}</h4>
                                <ChevronDown size={12} className={`text-slate-400 transition-transform duration-300 group-hover:text-primary ${showTable ? 'rotate-180' : ''}`} />
                            </div>
                            <div className={`overflow-hidden transition-all duration-300 flex-grow relative ${showTable ? 'h-[300px]' : 'h-0'}`}>
                                <div className="absolute inset-0 overflow-auto custom-scrollbar">
                                    <table className="w-full text-left">
                                        <thead className="sticky top-0 bg-background z-10 shadow-sm"><tr className="border-b border-border"><th className="px-4 py-3 text-[9px] font-bold text-muted-foreground uppercase">{T.pp_month || 'Mo'}</th><th className="px-4 py-3 text-[9px] font-bold text-muted-foreground uppercase text-right">{T.revenue || 'Rev'}</th><th className="px-4 py-3 text-[9px] font-bold text-muted-foreground uppercase text-right">{T.expenses || 'Exp'}</th><th className="px-4 py-3 text-[9px] font-bold text-muted-foreground uppercase text-right">{T.netProfit || 'Net'}</th><th className="px-4 py-3 text-[9px] font-bold text-muted-foreground uppercase text-right">{T.pp_cash || 'Cash'}</th></tr></thead>
                                        <tbody className="text-[10px] font-mono text-foreground">{outputs.ledger.map((row, i) => <tr key={i} className="border-b border-border hover:bg-muted/50 transition-colors"><td className="px-4 py-3 font-bold text-muted-foreground">{row.month}</td><td className="px-4 py-3 text-right">{formatMoney(row.rev)}</td><td className="px-4 py-3 text-right text-muted-foreground">-{formatMoney(row.exp)}</td><td className={`px-4 py-3 text-right font-bold ${row.net>=0 ? 'text-emerald-500' : 'text-red-500'}`}>{formatMoney(row.net)}</td><td className={`px-4 py-3 text-right font-bold ${row.cash>=0 ? 'text-foreground' : 'text-red-500'}`}>{formatMoney(row.cash)}</td></tr>)}</tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="glass-card rounded-2xl p-6 lg:p-8">
                        <h4 className="text-sm font-bold text-foreground flex items-center gap-2 mb-6"><Scale size={14} className="text-purple-500" /> {T.pp_op_trends || 'Trends'}</h4>
                        <div className="chart-wrapper h-[250px]"><canvas ref={breakEvenChartRef}></canvas></div>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-2 px-1"><div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-lg"><Gauge size={14} /></div><div><h3 className="text-sm font-bold text-foreground leading-none">{T.pp_mission_control || 'Mission Control'}</h3><span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{T.pp_kpis || 'KPIs'}</span></div></div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {kpiCards.map(kpi => (
                                <div key={kpi.id} className={`kpi-card glass-card p-4 group ${kpi.border || ''}`}>
                                    <div className="flex justify-between items-start mb-2"><span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{kpi.label}</span>{React.createElement(kpi.icon, { size: 12, className: "text-slate-400 group-hover:text-primary transition-colors" })}</div>
                                    <div className={`text-xl font-bold font-mono tracking-tighter mb-1 ${kpi.colorize && (parseFloat(kpi.value) < 0 || kpi.value.startsWith('-')) ? 'text-red-500' : kpi.colorize ? 'text-emerald-600' : 'text-foreground'}`}>{kpi.value}</div>
                                    <div className={`text-[10px] font-semibold flex items-center gap-1 ${kpi.subColor || 'text-muted-foreground'}`}>{kpi.sub}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
                        <div className="glass-card rounded-2xl p-6">
                            <h4 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4"><Layers size={14} className="text-primary" /> {T.pp_scenario_planner || 'Planner'}</h4>
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <input type="text" id="scenarioNameInput" value={scenarioName} onChange={e => setScenarioName(e.target.value)} placeholder={T.pp_scenario_placeholder || 'Plan Name...'} className="flex-grow bg-muted border border-border rounded-lg px-3 py-2 text-xs font-bold focus:ring-1 focus:ring-primary outline-none" />
                                    <button onClick={handleSaveScenario} className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors">{T.save || 'Save'}</button>
                                </div>
                                <div className="bg-muted/50 rounded-xl p-1 border border-border h-[140px] overflow-y-auto custom-scrollbar">
                                    <div className="space-y-1 p-2">
                                        {scenarios.length === 0 && <div className="text-[10px] text-muted-foreground text-center py-4 italic">{T.pp_no_scenarios || 'No scenarios saved.'}</div>}
                                        {scenarios.map((s, i) => <div key={i} className="flex justify-between items-center bg-card p-2 rounded-lg border border-border hover:border-primary/30 transition-colors group"><div onClick={() => loadScenario(s.id)} className="cursor-pointer flex-grow"><div className="text-[10px] font-bold text-foreground">{s.name}</div><div className="text-[8px] text-muted-foreground">{s.date}</div></div><button onClick={() => onDeleteScenario(s.id)} className="text-slate-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={10} /></button></div>)}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="glass-card rounded-2xl p-6">
                            <h4 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4"><Crosshair size={14} className="text-primary" /> {T.pp_swot_analysis || 'SWOT Analysis'}</h4>
                            <div className="grid grid-cols-2 gap-3 h-[180px]">
                                <div className="swot-box bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30"><h5 className="text-[10px] font-extrabold text-emerald-600 uppercase mb-2">{T.pp_strengths || 'Strengths'}</h5><div className="text-[10px] text-muted-foreground space-y-1">{outputs.swot.s.map((t,i) => <div key={i}>• {t}</div>)}</div></div>
                                <div className="swot-box bg-orange-50/50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-800/30"><h5 className="text-[10px] font-extrabold text-orange-600 uppercase mb-2">{T.pp_weaknesses || 'Weaknesses'}</h5><div className="text-[10px] text-muted-foreground space-y-1">{outputs.swot.w.map((t,i) => <div key={i}>• {t}</div>)}</div></div>
                                <div className="swot-box bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800/30"><h5 className="text-[10px] font-extrabold text-blue-600 uppercase mb-2">{T.pp_opportunities || 'Opportunities'}</h5><div className="text-[10px] text-muted-foreground space-y-1">{outputs.swot.o.map((t,i) => <div key={i}>• {t}</div>)}</div></div>
                                <div className="swot-box bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-800/30"><h5 className="text-[10px] font-extrabold text-red-600 uppercase mb-2">{T.pp_threats || 'Threats'}</h5><div className="text-[10px] text-muted-foreground space-y-1">{outputs.swot.t.map((t,i) => <div key={i}>• {t}</div>)}</div></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfitPilot;