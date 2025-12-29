import React, { useState } from 'react';
import { generateVisionBoardImage, generateGoalVideo } from '../services/geminiService';

const CreativeStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'image' | 'video'>('image');
  
  // Image State
  const [imgPrompt, setImgPrompt] = useState('');
  const [resolution, setResolution] = useState<'1K' | '2K' | '4K'>('1K');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loadingImg, setLoadingImg] = useState(false);

  // Video State
  const [videoPrompt, setVideoPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [veoStatus, setVeoStatus] = useState<string>('');

  const handleImageGen = async () => {
    if (!imgPrompt) return;
    setLoadingImg(true);
    setGeneratedImage(null);
    try {
      const result = await generateVisionBoardImage(imgPrompt, resolution);
      setGeneratedImage(result);
    } catch (e) {
      alert("Erro ao gerar imagem. Tente novamente.");
    } finally {
      setLoadingImg(false);
    }
  };

  const handleVideoGen = async () => {
    if (!videoPrompt || !sourceImage) {
      alert("Por favor, forneça um prompt e uma imagem inicial.");
      return;
    }

    setLoadingVideo(true);
    setVeoStatus("Verificando acesso...");
    setGeneratedVideo(null);

    try {
      // API Key Check for Veo
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          setVeoStatus("Aguardando seleção de chave API...");
          await window.aistudio.openSelectKey();
          // Assume success after dialog interaction per guidelines
        }
      }

      setVeoStatus("Gerando vídeo (isso pode levar alguns minutos)...");
      const videoUrl = await generateGoalVideo(videoPrompt, sourceImage, aspectRatio);
      setGeneratedVideo(videoUrl);
      setVeoStatus("");

    } catch (e) {
      console.error(e);
      setVeoStatus("Erro ao gerar vídeo. Verifique se escolheu um projeto pago (Billing).");
    } finally {
      setLoadingVideo(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSourceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">Estúdio de Visão Financeira</h1>
        <p className="opacity-80">Materialize seus sonhos financeiros com Inteligência Artificial.</p>
      </div>

      <div className="flex space-x-4 border-b border-slate-700 pb-1">
        <button
          onClick={() => setActiveTab('image')}
          className={`px-4 py-2 font-medium transition-colors ${activeTab === 'image' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400 hover:text-white'}`}
        >
          Gerar Metas (Imagem)
        </button>
        <button
          onClick={() => setActiveTab('video')}
          className={`px-4 py-2 font-medium transition-colors ${activeTab === 'video' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400 hover:text-white'}`}
        >
          Animar Sonhos (Veo)
        </button>
      </div>

      {activeTab === 'image' && (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 animate-fade-in">
           <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Nano Banana Pro: Visualizador de Metas
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">O que você quer visualizar?</label>
                <textarea 
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none h-32 resize-none"
                  placeholder="Ex: Uma casa moderna na praia com um carro esportivo vermelho na garagem..."
                  value={imgPrompt}
                  onChange={(e) => setImgPrompt(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Resolução</label>
                <div className="flex gap-2">
                  {(['1K', '2K', '4K'] as const).map(r => (
                    <button
                      key={r}
                      onClick={() => setResolution(r)}
                      className={`flex-1 py-2 rounded-lg border ${resolution === r ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <button 
                onClick={handleImageGen}
                disabled={loadingImg || !imgPrompt}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold transition-all"
              >
                {loadingImg ? 'Gerando Imagem...' : 'Gerar Visualização'}
              </button>
            </div>
            
            <div className="bg-slate-900 rounded-lg border border-slate-700 flex items-center justify-center min-h-[300px] overflow-hidden relative">
              {loadingImg ? (
                <div className="animate-pulse text-indigo-400 font-medium">Criando sua visão com IA...</div>
              ) : generatedImage ? (
                <img src={generatedImage} alt="Generated Goal" className="w-full h-full object-contain" />
              ) : (
                <div className="text-slate-500 text-center p-4">
                  <p>Sua imagem aparecerá aqui.</p>
                  <p className="text-xs mt-2 opacity-60">Modelo: gemini-3-pro-image-preview</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'video' && (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 animate-fade-in">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            Veo Animator: Dê Vida aos Sonhos
          </h2>
          <div className="bg-amber-900/30 border border-amber-700/50 p-4 rounded-lg mb-6 text-amber-200 text-sm">
            Nota: A geração de vídeo com Veo requer seleção de chave API de um projeto com faturamento ativado (GCP).
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">1. Imagem de Origem</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-white hover:file:bg-slate-600"
                />
                {sourceImage && (
                  <div className="mt-2 h-32 w-full bg-slate-900 rounded overflow-hidden">
                    <img src={sourceImage} alt="Source" className="h-full w-full object-cover opacity-70" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">2. O que deve acontecer no vídeo?</label>
                <textarea 
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none h-24 resize-none"
                  placeholder="Ex: Câmera fazendo zoom out cinemático, luzes acendendo..."
                  value={videoPrompt}
                  onChange={(e) => setVideoPrompt(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">3. Formato</label>
                <div className="flex gap-2">
                  <button onClick={() => setAspectRatio('16:9')} className={`flex-1 py-2 rounded-lg border ${aspectRatio === '16:9' ? 'bg-pink-600 border-pink-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>16:9 (Landscape)</button>
                  <button onClick={() => setAspectRatio('9:16')} className={`flex-1 py-2 rounded-lg border ${aspectRatio === '9:16' ? 'bg-pink-600 border-pink-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>9:16 (Portrait)</button>
                </div>
              </div>

              <button 
                onClick={handleVideoGen}
                disabled={loadingVideo || !videoPrompt || !sourceImage}
                className="w-full bg-pink-600 hover:bg-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold transition-all shadow-lg shadow-pink-900/20"
              >
                {loadingVideo ? 'Processando (Veo)...' : 'Gerar Vídeo'}
              </button>
            </div>

            <div className="bg-slate-900 rounded-lg border border-slate-700 flex flex-col items-center justify-center min-h-[300px] overflow-hidden relative">
              {loadingVideo ? (
                <div className="text-center p-6 space-y-4">
                  <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-pink-400 font-medium animate-pulse">{veoStatus}</p>
                </div>
              ) : generatedVideo ? (
                <video src={generatedVideo} controls autoPlay loop className="w-full h-full object-contain" />
              ) : (
                <div className="text-slate-500 text-center p-4">
                  <p>Seu vídeo aparecerá aqui.</p>
                  <p className="text-xs mt-2 opacity-60">Modelo: veo-3.1-fast-generate-preview</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreativeStudio;