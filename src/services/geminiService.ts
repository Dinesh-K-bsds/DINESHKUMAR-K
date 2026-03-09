import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const analyzeIncident = async (description: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following incident description and determine the most likely category and severity level.
      
      Description: "${description}"
      
      Categories: accident, fire, medical, crime, hazard, other
      Severity Levels: low, medium, high, critical
      
      Return the result as JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            severity: { type: Type.STRING },
            isFake: { type: Type.BOOLEAN, description: "Whether the report seems fake, spam, or nonsensical" },
            confidence: { type: Type.NUMBER, description: "Confidence score from 0 to 1" },
            reasoning: { type: Type.STRING }
          },
          required: ["category", "severity", "isFake", "confidence"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return null;
  }
};

export const analyzeIncidentImage = async (base64Image: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image } },
          { text: "Analyze this image for public safety incidents. Detect fire, accidents, crowds, or hazards. Return findings as JSON." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedIncidents: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            severity: { type: Type.STRING },
            description: { type: Type.STRING },
            confidence: { type: Type.NUMBER }
          },
          required: ["detectedIncidents", "severity", "description", "confidence"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini image analysis failed:", error);
    return null;
  }
};

export const getSafetyGuidance = async (query: string, context?: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an Emergency Safety Assistant. Provide immediate, clear, and actionable safety or first-aid guidance.
      
      User Query: "${query}"
      Context: "${context || 'General emergency'}"
      
      Keep it concise and prioritize life-saving steps.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini guidance failed:", error);
    return "I'm sorry, I'm having trouble connecting. Please call emergency services immediately if this is a life-threatening situation.";
  }
};

export const predictRiskZones = async (incidents: any[]) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on these historical incidents, identify high-risk zones (clusters). 
      
      Data: ${JSON.stringify(incidents.slice(0, 50))}
      
      Return an array of risk zones with center coordinates, radius (meters), and risk level.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            zones: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  lat: { type: Type.NUMBER },
                  lng: { type: Type.NUMBER },
                  radius: { type: Type.NUMBER },
                  level: { type: Type.STRING },
                  reason: { type: Type.STRING }
                },
                required: ["lat", "lng", "radius", "level"]
              }
            }
          },
          required: ["zones"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini risk prediction failed:", error);
    return { zones: [] };
  }
};

export const transcribeVoice = async (audioBase64: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { mimeType: "audio/wav", data: audioBase64 } },
          { text: "Transcribe this emergency report. Extract: category, severity, and description. Return as JSON." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            transcription: { type: Type.STRING },
            category: { type: Type.STRING },
            severity: { type: Type.STRING }
          },
          required: ["transcription"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini transcription failed:", error);
    return null;
  }
};
