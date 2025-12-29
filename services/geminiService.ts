import { GoogleGenAI, Type } from "@google/genai";
import { Asset, PortfolioSummary } from "../types";

// Helper to get client - ALWAYS new instance to handle dynamic keys in some contexts
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates financial advice based on the user's portfolio.
 */
export const getFinancialAdvice = async (assets: Asset[], summary: PortfolioSummary): Promise<string> => {
  const ai = getAiClient();
  
  const prompt = `
    Atue como um consultor financeiro especialista e analise meu portfólio pessoal.
    
    Resumo:
    - Total: R$ ${summary.totalValue.toFixed(2)}
    - Investido: R$ ${summary.totalInvested.toFixed(2)}
    - Rentabilidade: ${summary.profitability.toFixed(2)}%

    Ativos:
    ${JSON.stringify(assets.map(a => ({ ticker: a.ticker, type: a.type, total: a.quantity * a.currentPrice })))}

    Forneça uma análise concisa de 3 parágrafos:
    1. Análise de Diversificação (estou muito concentrado?).
    2. Sugestões de melhoria ou rebalanceamento baseadas no mercado atual.
    3. Uma nota de 0 a 10 para a saúde da carteira.
    
    Use formatação Markdown simples. Fale Português do Brasil.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "Você é um analista financeiro sênior, conservador mas atento a oportunidades. Seu tom é profissional e educativo."
      }
    });
    return response.text || "Não foi possível gerar a análise no momento.";
  } catch (error) {
    console.error("Erro na análise financeira:", error);
    return "Erro ao conectar com o consultor IA. Verifique sua chave API.";
  }
};

/**
 * Generates an image for the Vision Board (Nano Banana Pro).
 */
export const generateVisionBoardImage = async (prompt: string, resolution: '1K' | '2K' | '4K'): Promise<string | null> => {
  const ai = getAiClient();
  
  try {
    // Check key requirements for Pro Image model handled by app logic or generic env
    // Using gemini-3-pro-image-preview as requested
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          imageSize: resolution,
          aspectRatio: "16:9" // Good for vision boards
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Erro ao gerar imagem:", error);
    throw error;
  }
};

/**
 * Generates a video animation (Veo).
 */
export const generateGoalVideo = async (prompt: string, imageBase64: string, aspectRatio: '16:9' | '9:16'): Promise<string | null> => {
  // IMPORTANT: Re-instantiate specifically for Veo call flow if needed, but standard new GoogleGenAI works if env key is set.
  // However, Veo often requires specific billing checks.
  const ai = getAiClient();

  try {
    // Clean base64 header if present
    const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      image: {
        imageBytes: cleanBase64,
        mimeType: 'image/png', // Assuming PNG for simplicity, though API supports others
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p', // Fast preview supports 720p
        aspectRatio: aspectRatio
      }
    });

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) return null;

    // Fetch the actual video bytes
    const videoResponse = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
    const blob = await videoResponse.blob();
    return URL.createObjectURL(blob);

  } catch (error) {
    console.error("Erro na geração de vídeo:", error);
    throw error;
  }
};
