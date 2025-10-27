// import { GoogleGenAI, Modality, Type } from '@google/genai';
import { Modality, Type } from '@google/genai';
import axios from 'axios';

// const API_KEY = process.env.API_KEY;

// if (!API_KEY) {
//     throw new Error('API_KEY environment variable not set');
// }

// const ai = new GoogleGenAI({ apiKey: API_KEY });
const ai = null as any;

export const getCityCountryCorrection = async (
    city: string,
    country: string,
): Promise<{
    correctedCity: string;
    correctedCountry: string;
    needsCorrection: boolean;
}> => {
    console.info('! city=', city, 'country=', country);
    const $res = await axios.post('http://localhost:8000/hello/get-city-country-correction/gemini', { city, country });
    console.info('! result =', $res?.data);
    if ($res?.data) return $res.data;

    // On failure, default to no correction
    return { correctedCity: city, correctedCountry: country, needsCorrection: false };
};

export const getAutocompleteSuggestions = async (
    fieldType: 'city' | 'country',
    query: string,
    context: { city?: string; country?: string },
): Promise<string[]> => {
    if (!ai) return [];
    if (query.length < 2) return [];

    let prompt = `Provide up to 5 autocomplete suggestions for a ${fieldType} starting with "${query}".`;
    if (fieldType === 'city' && context.country) {
        prompt += ` The country is ${context.country}.`;
    }
    prompt += ` Prioritize major and well-known locations. Return ONLY a JSON array of unique strings.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.STRING,
                    },
                },
            },
        });

        const result = JSON.parse(response.text);
        return result;
    } catch (error) {
        console.error(`Error getting ${fieldType} suggestions:`, error);
        return [];
    }
};

export const getCountryForCity = async (city: string): Promise<string | null> => {
    if (!city) return null;

    const prompt = `Given the city "${city}", what is its country? Respond ONLY with the country name in the specified JSON format.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        country: { type: Type.STRING, description: 'The country name for the given city.' },
                    },
                    required: ['country'],
                },
            },
        });

        const result = JSON.parse(response.text);
        return result.country || null;
    } catch (error) {
        console.error(`Error getting country for city "${city}":`, error);
        return null;
    }
};

export const generateStampImage = async (city: string, country: string): Promise<string> => {
    const prompt = `
    Create a highly detailed and artistic design for a circular passport stamp emblem.
    The design must represent the city of ${city}, ${country}.
    
    Style Guidelines:
    - Theme: Vintage, official seal, collectible quality.
    - Art Style: Intricate line art with subtle shading. A mix between engraving and vector art.
    - Content: Incorporate a famous landmark (like the Eiffel Tower for Paris) or a significant cultural symbol (like a cherry blossom for Tokyo) as the central element.
    - Text: The text "${city.toUpperCase()}" and "${country.toUpperCase()}" must be elegantly curved along the circle's edge. Use a classic, legible serif font.
    - Border: Include a decorative circular border, perhaps with elements like stars, leaves, or geometric patterns.
    - Color: The entire stamp should be a single color, deep navy blue, on a transparent background.
    - Do NOT include any other text, dates, or photographic elements. The design must be clean and symbolic.
    - The output must be just the circular stamp design itself.
  `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:image/png;base64,${base64ImageBytes}`;
            }
        }
        throw new Error('No image data found in Gemini response.');
    } catch (error) {
        console.error('Error generating stamp image:', error);
        throw new Error(
            'Failed to generate stamp. This could be a temporary issue or an unsupported location. Please try again.',
        );
    }
};
