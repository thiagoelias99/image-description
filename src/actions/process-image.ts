"use server"

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, FileDataPart } from "@google/generative-ai"

const MODEL_NAME = "gemini-pro-vision";
const API_KEY = process.env.AI_STUDIO_API_KEY as string;

export type ProcessedAlt = {
  alt: string;
  description: string;
};

export async function processImage(image: unknown): Promise<ProcessedAlt> {
  console.log("Processing image")
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const prompt = `a partir desta imagem, preciso que retorne o JSON com dois campos.

  alt -> Uma descrição com poucas palavras (até 20) da imagem
  description -> Uma descrição bem detalhada da imagem, para poder ser utilizada em audio-descrição. Nesta descrição insira um sentimento que a imagem possa passar.`

  const generationConfig = {
    temperature: 1,
    topK: 0,
    topP: 0.95,
    maxOutputTokens: 8192,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  const result = await model.generateContent([image as FileDataPart, prompt])

  const start = result.response.text().indexOf("{")
  const end = result.response.text().lastIndexOf("}")

  const text = result.response.text().substring(start, end + 1)

  return JSON.parse(text) as ProcessedAlt
}

