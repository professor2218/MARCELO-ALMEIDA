import React, { useState } from 'react';
import { Asset, AssetType } from '../types';

interface AssetFormProps {
  onAdd: (asset: Omit<Asset, 'id'>) => void;
  onClose: () => void;
}

const AssetForm: React.FC<AssetFormProps> = ({ onAdd, onClose }) => {
  const [ticker, setTicker] = useState('');
  const [type, setType] = useState<AssetType>(AssetType.STOCK);
  const [quantity, setQuantity] = useState('');
  const [averagePrice, setAveragePrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ticker: ticker.toUpperCase(),
      name: ticker.toUpperCase(), // Simplification
      type,
      quantity: Number(quantity),
      averagePrice: Number(averagePrice),
      currentPrice: Number(currentPrice)
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-4">Adicionar Novo Ativo</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Ticker / Nome</label>
            <input 
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              placeholder="Ex: PETR4, BTC, Tesouro Direto"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Tipo</label>
            <select 
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white outline-none"
              value={type}
              onChange={(e) => setType(e.target.value as AssetType)}
            >
              {Object.values(AssetType).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Quantidade</label>
              <input 
                required
                type="number"
                step="any"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white outline-none"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Preço Médio</label>
              <input 
                required
                type="number"
                step="any"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white outline-none"
                value={averagePrice}
                onChange={(e) => setAveragePrice(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Preço Atual (Simulado)</label>
            <input 
              required
              type="number"
              step="any"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white outline-none"
              value={currentPrice}
              onChange={(e) => setCurrentPrice(e.target.value)}
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-lg font-medium transition-colors"
            >
              Salvar
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AssetForm;