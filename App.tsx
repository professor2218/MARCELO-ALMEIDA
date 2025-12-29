import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Asset, AssetType, PortfolioSummary, ViewState } from './types';
import AssetForm from './components/AssetForm';
import { getFinancialAdvice } from './services/geminiService';
import CreativeStudio from './components/CreativeStudio';

// Mock initial data
const INITIAL_ASSETS: Asset[] = [
  { id: '1', ticker: 'PETR4', name: 'PETROBRAS PN', type: AssetType.STOCK, quantity: 100, averagePrice: 28.50, currentPrice: 35.20, sector: 'Energia' },
  { id: '2', ticker: 'HGLG11', name: 'CSHG LOGISTICA', type: AssetType.FII, quantity: 15, averagePrice: 155.00, currentPrice: 162.30, sector: 'Logística' },
  { id: '3', ticker: 'BTC', name: 'BITCOIN', type: AssetType.CRYPTO, quantity: 0.005, averagePrice: 250000, currentPrice: 380000, sector: 'Cripto' },
  { id: '4', ticker: 'TESOURO SELIC', name: 'TESOURO SELIC 2027', type: AssetType.FIXED, quantity: 1, averagePrice: 12000, currentPrice: 12500, sector: 'Governo' },
];

// Colors for charts
const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];

const App: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [view, setView] = useState<ViewState>('dashboard');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [advice, setAdvice] = useState<string>('');
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  // Derived Statistics
  const summary: PortfolioSummary = useMemo(() => {
    let totalInvested = 0;
    let totalValue = 0;

    assets.forEach(asset => {
      totalInvested += asset.quantity * asset.averagePrice;
      totalValue += asset.quantity * asset.currentPrice;
    });

    const profitabilityValue = totalValue - totalInvested;
    const profitability = totalInvested > 0 ? (profitabilityValue / totalInvested) * 100 : 0;

    return { totalValue, totalInvested, profitability, profitabilityValue };
  }, [assets]);

  // Allocation Data for Chart
  const allocationData = useMemo(() => {
    const map = new Map<string, number>();
    assets.forEach(asset => {
      const currentVal = map.get(asset.type) || 0;
      map.set(asset.type, currentVal + (asset.quantity * asset.currentPrice));
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [assets]);

  const handleAddAsset = (newAsset: Omit<Asset, 'id'>) => {
    const asset: Asset = { ...newAsset, id: Math.random().toString(36).substr(2, 9) };
    setAssets([...assets, asset]);
  };

  const handleRemoveAsset = (id: string) => {
    setAssets(assets.filter(a => a.id !== id));
  };

  const fetchAdvice = async () => {
    setLoadingAdvice(true);
    const result = await getFinancialAdvice(assets, summary);
    setAdvice(result);
    setLoadingAdvice(false);
  };

  // Render Helpers
  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col hidden md:flex">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-emerald-400 tracking-tight flex items-center gap-2">
            <span className="text-3xl">✦</span> FinVest 360
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <button 
            onClick={() => setView('dashboard')} 
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${view === 'dashboard' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            Dashboard
          </button>
          
          <button 
            onClick={() => setView('wallet')} 
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${view === 'wallet' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Meus Ativos
          </button>
          
          <button 
            onClick={() => setView('advisor')} 
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${view === 'advisor' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            Consultor IA
          </button>

          <div className="pt-4 mt-4 border-t border-slate-700">
             <p className="px-4 text-xs font-semibold text-slate-500 uppercase mb-2">Futuro</p>
             <button 
              onClick={() => setView('vision-board')} 
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${view === 'vision-board' ? 'bg-indigo-900/50 text-indigo-300 border border-indigo-700' : 'text-indigo-400 hover:bg-indigo-900/30'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>
              Estúdio & Visão
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        
        {/* Mobile Header */}
        <div className="md:hidden bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
          <h1 className="text-xl font-bold text-emerald-400">FinVest 360</h1>
          <div className="flex gap-2">
            <button onClick={() => setView('dashboard')} className="p-2 text-slate-400">Dash</button>
            <button onClick={() => setView('vision-board')} className="p-2 text-indigo-400">IA</button>
          </div>
        </div>

        {/* Dashboard View */}
        {view === 'dashboard' && (
          <div className="p-6 max-w-7xl mx-auto space-y-6">
            
            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                <p className="text-slate-400 text-sm font-medium">Patrimônio Total</p>
                <h2 className="text-3xl font-bold text-white mt-2">{formatCurrency(summary.totalValue)}</h2>
              </div>
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                <p className="text-slate-400 text-sm font-medium">Rentabilidade</p>
                <div className="flex items-end gap-2 mt-2">
                  <h2 className={`text-3xl font-bold ${summary.profitability >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {summary.profitability >= 0 ? '+' : ''}{summary.profitability.toFixed(2)}%
                  </h2>
                  <span className={`text-sm mb-1 ${summary.profitabilityValue >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    ({formatCurrency(summary.profitabilityValue)})
                  </span>
                </div>
              </div>
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                <p className="text-slate-400 text-sm font-medium">Total Investido</p>
                <h2 className="text-3xl font-bold text-slate-200 mt-2">{formatCurrency(summary.totalInvested)}</h2>
              </div>
            </div>

            {/* Charts & Highlights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Allocation Chart */}
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg min-h-[400px]">
                <h3 className="text-lg font-bold text-white mb-4">Alocação por Ativo</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {allocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                        itemStyle={{ color: '#f8fafc' }}
                      />
                      <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: '20px'}}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Quick Actions / Recent */}
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col justify-center items-center text-center space-y-4">
                <div className="p-4 bg-emerald-500/10 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Sua carteira está crescendo!</h3>
                  <p className="text-slate-400 mt-2">Você tem {assets.length} ativos cadastrados.</p>
                </div>
                <button 
                  onClick={() => setIsFormOpen(true)}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-medium transition-colors"
                >
                  Adicionar Novo Aporte
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Wallet View */}
        {(view === 'wallet' || view === 'dashboard') && view !== 'dashboard' && (
          <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Meus Ativos</h2>
              <button 
                onClick={() => setIsFormOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <span>+</span> Novo Ativo
              </button>
            </div>
            
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs">
                    <tr>
                      <th className="p-4 font-semibold">Ticker</th>
                      <th className="p-4 font-semibold">Tipo</th>
                      <th className="p-4 font-semibold text-right">Qtd</th>
                      <th className="p-4 font-semibold text-right">Preço Médio</th>
                      <th className="p-4 font-semibold text-right">Preço Atual</th>
                      <th className="p-4 font-semibold text-right">Saldo Total</th>
                      <th className="p-4 font-semibold text-right">Resultado</th>
                      <th className="p-4 font-semibold text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {assets.map(asset => {
                      const total = asset.quantity * asset.currentPrice;
                      const gain = (asset.currentPrice - asset.averagePrice) * asset.quantity;
                      const gainPercent = ((asset.currentPrice / asset.averagePrice) - 1) * 100;

                      return (
                        <tr key={asset.id} className="hover:bg-slate-700/30 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-white">{asset.ticker}</div>
                            <div className="text-xs text-slate-500">{asset.name}</div>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-1 rounded text-xs font-medium bg-slate-700 text-slate-300">
                              {asset.type}
                            </span>
                          </td>
                          <td className="p-4 text-right text-slate-300">{asset.quantity}</td>
                          <td className="p-4 text-right text-slate-300">{formatCurrency(asset.averagePrice)}</td>
                          <td className="p-4 text-right text-white font-medium">{formatCurrency(asset.currentPrice)}</td>
                          <td className="p-4 text-right text-white font-bold">{formatCurrency(total)}</td>
                          <td className="p-4 text-right">
                            <div className={`font-medium ${gain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {gain >= 0 ? '+' : ''}{formatCurrency(gain)}
                            </div>
                            <div className={`text-xs ${gainPercent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                              {gainPercent.toFixed(2)}%
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <button 
                              onClick={() => handleRemoveAsset(asset.id)}
                              className="text-slate-500 hover:text-red-400 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Advisor View */}
        {view === 'advisor' && (
          <div className="p-6 max-w-4xl mx-auto">
            <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
              <div className="flex items-center gap-4 mb-6 border-b border-slate-700 pb-6">
                <div className="bg-emerald-500/20 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Consultor de Investimentos IA</h2>
                  <p className="text-slate-400">Análise personalizada baseada no seu portfólio atual.</p>
                </div>
              </div>

              {!advice ? (
                <div className="text-center py-12">
                  <p className="text-slate-400 mb-6">Clique no botão abaixo para gerar uma análise completa da sua carteira.</p>
                  <button 
                    onClick={fetchAdvice}
                    disabled={loadingAdvice}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-emerald-900/50 disabled:opacity-50"
                  >
                    {loadingAdvice ? 'Analisando dados...' : 'Gerar Análise Agora'}
                  </button>
                </div>
              ) : (
                <div className="prose prose-invert max-w-none">
                  <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700 text-slate-300 leading-relaxed whitespace-pre-line">
                    {advice}
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button 
                      onClick={fetchAdvice} 
                      className="text-sm text-emerald-400 hover:text-emerald-300 underline"
                    >
                      Atualizar Análise
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Vision Board (Nano Banana Pro / Veo) */}
        {view === 'vision-board' && <CreativeStudio />}

      </main>

      {/* Add Asset Modal */}
      {isFormOpen && (
        <AssetForm onAdd={handleAddAsset} onClose={() => setIsFormOpen(false)} />
      )}
    </div>
  );
};

export default App;