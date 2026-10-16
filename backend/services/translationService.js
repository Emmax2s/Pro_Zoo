import { env } from '../config/env.js';

const cache = new Map();

async function translateText(text) {
  const value = typeof text === 'string' ? text.trim() : '';
  if (!value || env.translationLanguage === 'es') return text || '';

  const cacheKey = `${env.translationSourceLanguage}:${env.translationTargetLanguage}:${value}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const url = new URL(env.translationApiUrl);
  url.searchParams.set('q', value);
  url.searchParams.set('langpair', `${env.translationSourceLanguage}|${env.translationTargetLanguage}`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Translation service responded with status ${response.status}`);
  }

  const data = await response.json();
  const translated = data.responseData?.translatedText;
  if (typeof translated !== 'string' || !translated.trim()) {
    throw new Error('Translation service returned an invalid translation');
  }

  cache.set(cacheKey, translated);
  return translated;
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
