import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EdgeTTS } from 'node-edge-tts';
import googleTts from 'google-tts-api';

const uploadsDirectory = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'uploads');
const ttsDirectory = path.join(uploadsDirectory, 'tts');
const MAX_TEXT_LENGTH = 5000;

export function cleanNarrationText(text) {
  return String(text || '')
    .replace(/[*"#]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/zoomat/gi, 'Zómat')
    .trim()
    .slice(0, MAX_TEXT_LENGTH);
}

function getCachePath(text, language) {
  const hash = crypto
    .createHash('sha256')
    .update(`${language}:${text}`)
    .digest('hex');
  return path.join(ttsDirectory, `${hash}.mp3`);
}

async function generateWithEdge(text, outputPath, language) {
  const voice = language === 'en' ? 'en-US-AriaNeural' : 'es-MX-JorgeNeural';
  const tts = new EdgeTTS({
    voice,
    lang: language === 'en' ? 'en-US' : 'es-MX',
    outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
    timeout: 15000,
  });
  await tts.ttsPromise(text, outputPath);
  return 'microsoft-edge';
}

async function generateWithGoogle(text, outputPath, language) {
  const chunks = await googleTts.getAllAudioBase64(text, {
    lang: language === 'en' ? 'en' : 'es',
    slow: false,
    host: language === 'en'
      ? 'https://translate.google.com'
      : 'https://translate.google.com.mx',
    timeout: 15000,
    splitPunct: '.,;:!?¿¡',
  });
  const audio = Buffer.concat(chunks.map(({ base64 }) => Buffer.from(base64, 'base64')));
  await fs.writeFile(outputPath, audio);
  return 'google';
}

export async function generateHybridNarration(text, language = 'es') {
  const normalizedLanguage = language === 'en' ? 'en' : 'es';
  const cleanText = cleanNarrationText(text);
  if (!cleanText) {
    throw new Error('El texto de narración es obligatorio.');
  }

  const outputPath = getCachePath(cleanText, normalizedLanguage);
  await fs.mkdir(ttsDirectory, { recursive: true });

  try {
    await fs.access(outputPath);
    return { outputPath, provider: 'cache' };
  } catch {
    // The file is generated below when it is not cached.
  }

  try {
    const provider = await generateWithEdge(cleanText, outputPath, normalizedLanguage);
    return { outputPath, provider };
  } catch (edgeError) {
    try {
      const provider = await generateWithGoogle(cleanText, outputPath, normalizedLanguage);
      return { outputPath, provider };
    } catch (googleError) {
      await fs.rm(outputPath, { force: true });
      const edgeMessage = edgeError instanceof Error ? edgeError.message : String(edgeError);
      const googleMessage = googleError instanceof Error ? googleError.message : String(googleError);
      throw new Error(`Fallaron Microsoft Edge TTS y Google TTS. Edge: ${edgeMessage}. Google: ${googleMessage}`);
    }
  }
}

