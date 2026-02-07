
import { GoogleGenAI, Type } from "@google/genai";
import { Lead } from "../types";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzeLeadShort = async (lead: Lead): Promise<string> => {
  const ai = getAIClient();
  const prompt = `Analiza brevemente este lead de CRM en una sola frase profesional y directa:
  Nombre: ${lead.name}
  Estado: ${lead.status}
  Notas: ${lead.notes || 'Sin notas'}
  Valor Estimado: $${lead.value}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        maxOutputTokens: 100,
        temperature: 0.7,
      }
    });
    return response.text || "Análisis no disponible";
  } catch (error) {
    console.error("Gemini short analysis error:", error);
    return "Error al generar análisis";
  }
};

export const analyzeChatScreenshot = async (base64Image: string, lead: Lead): Promise<string> => {
  const ai = getAIClient();
  
  const imagePart = {
    inlineData: {
      data: base64Image.split(',')[1],
      mimeType: 'image/png',
    },
  };

  const textPart = {
    text: `Analiza esta captura de pantalla de un chat para el prospecto ${lead.name}. 
    PROPORCIONA UN REPORTE MUY LIMPIO Y ESTRUCTURADO SIGUIENDO ESTE FORMATO EXACTO:

    📌 RESUMEN RÁPIDO
    • [Breve frase del contexto actual]

    💡 PUNTOS DE DOLOR (PAIN POINTS)
    • [Punto 1]
    • [Punto 2]

    🎯 NIVEL DE INTERÉS
    • [Bajo/Medio/Alto] - [Razón breve]

    🚀 ACCIONES PARA LA LLAMADA
    • [Acción concreta 1]
    • [Acción concreta 2]
    • [Acción concreta 3]

    IMPORTANTE: Usa solo bullet points (•), no escribas párrafos largos. Deja una línea en blanco entre secciones. Sé ultra conciso.`
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [imagePart, textPart] },
      config: {
        temperature: 0.4, // Lower temperature for more structured output
      }
    });
    return response.text || "No se pudo analizar la imagen.";
  } catch (error) {
    console.error("Gemini image analysis error:", error);
    return "Error al procesar la captura de pantalla.";
  }
};

export const generateLeadStrategy = async (lead: Lead): Promise<string> => {
  const ai = getAIClient();
  const prompt = `Actúa como un Consultor Senior de Ventas. 
  Genera una estrategia de cierre para: ${lead.name} ($${lead.value}).

  FORMATO REQUERIDO:
  
  👤 PERFIL DE COMPRA
  • [Descripción en una frase]

  🛠 PASOS A SEGUIR
  • [Paso 1]
  • [Paso 2]
  • [Paso 3]

  📞 GUION SUGERIDO
  "[Escribe aquí un guion corto y potente]"

  Mantén el formato de bullet points (•) y evita bloques de texto densos.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.95,
      }
    });
    return response.text || "No se pudo generar la estrategia.";
  } catch (error) {
    console.error("Gemini strategy generation error:", error);
    return "Hubo un error al conectar con la IA.";
  }
};
