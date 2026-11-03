import { env } from '../config/env.js';

const cache = new Map();

async function translateText(text) {
  const value = typeof text === 'string' ? text.trim() : '';
  if (!value || env.translationSourceLanguage === env.translationTargetLanguage) return text || '';

  const cacheKey = `${env.translationSourceLanguage}:${env.translationTargetLanguage}:${value}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  // 1. Intentar Google Translate GTX API
  try {
    const gtxUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${env.translationSourceLanguage}&tl=${env.translationTargetLanguage}&dt=t&q=${encodeURIComponent(value)}`;
    const gtxRes = await fetch(gtxUrl);
    if (gtxRes.ok) {
      const gtxData = await gtxRes.json();
      if (Array.isArray(gtxData) && Array.isArray(gtxData[0])) {
        const translated = gtxData[0].map((item) => item[0]).join('');
        if (translated && translated.trim()) {
          cache.set(cacheKey, translated);
          return translated;
        }
      }
    }
  } catch {}

  // 2. Fallback a MyMemory API
  try {
    const url = new URL(env.translationApiUrl);
    url.searchParams.set('q', value);
    url.searchParams.set('langpair', `${env.translationSourceLanguage}|${env.translationTargetLanguage}`);

    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      const translated = data.responseData?.translatedText;
      if (typeof translated === 'string' && translated.trim()) {
        cache.set(cacheKey, translated);
        return translated;
      }
    }
  } catch {}

  return text || '';
}

export async function translateSpecies(species, language) {
  if (language !== 'en') return species;

  const fields = ['name', 'habitat', 'description', 'diet', 'conservation'];
  try {
    const translated = await Promise.all(fields.map((field) => translateText(species[field])));
    return fields.reduce(
      (result, field, index) => ({ ...result, [field]: translated[index] }),
      { ...species }
    );
  } catch (error) {
    console.error('Automatic species translation failed:', error);
    return species;
  }
}
