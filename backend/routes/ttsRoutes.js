import { Router } from 'express';
import { generateHybridNarration } from '../services/hybridTtsService.js';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const { text, language } = req.body || {};
    const result = await generateHybridNarration(text, language);
    const filename = result.outputPath.split('/').pop();
    const origin = `${req.protocol}://${req.get('host')}`;
    res.json({
      provider: result.provider,
      url: `${origin}/uploads/tts/${encodeURIComponent(filename)}`,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

