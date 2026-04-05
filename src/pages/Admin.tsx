import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useAnimals, Animal, ConservationStatus, MediaItem } from '../contexts/AnimalContext';
import { useSite, HeroData, HeroMediaItem, InfoData } from '../contexts/SiteContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ArrowLeft, Plus, Trash2, Save, X, Image as ImageIcon, Info, Upload, Edit } from 'lucide-react';
import { useNavigate } from 'react-router';
import { AnimalQrTools } from '../components/AnimalQrTools';

const IMAGE_PLACEHOLDER =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="320" height="200" viewBox="0 0 320 200">
      <rect width="320" height="200" fill="#e5e7eb" />
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#6b7280" font-family="Arial, sans-serif" font-size="18">
        Sin imagen
      </text>
    </svg>
  `);

const getDriveFileId = (url?: string) => {
  if (!url) {
    return '';
  }

  const match =
    url.match(/\/file\/d\/([^/]+)/) ??
    url.match(/[?&]id=([^&]+)/) ??
    url.match(/\/uc\?(?:export=[^&]+&)?id=([^&]+)/);

  return match?.[1] ?? '';
};

const isMegaUrl = (url?: string) => Boolean(url && /mega\.(nz|io)\//i.test(url));
const isDriveUrl = (url?: string) => Boolean(url && /drive\.google\.com/i.test(url));

const toMegaEmbedUrl = (url: string) => {
  return url.replace('/file/', '/embed/').replace('/folder/', '/embed/');
};

const getEmbeddedImageUrl = (url?: string) => {
  if (!url) {
    return '';
  }

  if (isMegaUrl(url)) {
    return toMegaEmbedUrl(url);
  }

  const fileId = getDriveFileId(url);
  return fileId ? `https://drive.google.com/file/d/${fileId}/preview` : '';
};

// const _getImagePreviewUrl = (url?: string) => {
//   if (!url) {
//     return '';
//   }
//
//   const trimmed = url.trim();
//
//   if (trimmed.startsWith('data:image/')) {
//     return trimmed;
//   }
//
//   if (/drive\.google\.com/i.test(trimmed)) {
//     const fileId = getDriveFileId(trimmed);
//     if (fileId) {
//       return `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`;
//     }
//   }
//
//   if (/dropbox\.com/i.test(trimmed)) {
//     return trimmed
//       .replace('www.dropbox.com', 'dl.dropboxusercontent.com')
//       .replace('?dl=0', '?raw=1')
//       .replace('&dl=0', '&raw=1')
//       .replace('?dl=1', '?raw=1');
//   }
//
//   return trimmed;
// };

// const _getImageFallbackUrl = (url?: string) => {
//   if (!url) {
//     return IMAGE_PLACEHOLDER;
//   }
//
//   if (/drive\.google\.com/i.test(url)) {
//     const fileId = getDriveFileId(url);
//     if (fileId) {
//       return `https://drive.usercontent.google.com/uc?id=${fileId}&export=view`;
//     }
//   }
//
//   return url;
// };

const getAudioPreviewUrl = (url?: string) => {
  if (!url) {
    return '';
  }

  const trimmed = url.trim();

  if (trimmed.startsWith('data:audio/')) {
    return trimmed;
  }

  if (isDriveUrl(trimmed)) {
    const fileId = getDriveFileId(trimmed);
    if (fileId) {
      return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }
  }

  if (/dropbox\.com/i.test(trimmed)) {
    return trimmed
      .replace('www.dropbox.com', 'dl.dropboxusercontent.com')
      .replace('?dl=0', '?raw=1')
      .replace('&dl=0', '&raw=1')
      .replace('?dl=1', '?raw=1');
  }

  return trimmed;
};

// const _getPrimaryVisualMedia = (animal: Partial<Animal>): MediaItem | null => {
//   if (animal.mediaUrls && animal.mediaUrls.length > 0) {
//     return animal.mediaUrls[0];
//   }
//
//   if (animal.imageUrl) {
//     return { url: animal.imageUrl, type: 'image' };
//   }
//
//   return null;
// };

const getVisualMediaByType = (animal: Partial<Animal>, type: MediaItem['type']): MediaItem | null => {
  const mediaFromList = animal.mediaUrls?.find((item) => item.type === type);
  if (mediaFromList) {
    return mediaFromList;
  }

  if (type === 'image' && animal.imageUrl) {
    return { url: animal.imageUrl, type: 'image' };
  }

  return null;
};

const upsertMediaByType = (mediaList: MediaItem[] | undefined, media: MediaItem): MediaItem[] => {
  const withoutType = (mediaList ?? []).filter((item) => item.type !== media.type);
  return [...withoutType, media];
};

export default function Admin() {
  const { animals, addAnimal, updateAnimal, deleteAnimal } = useAnimals();
  const { siteData, updateHero, updateInfo } = useSite();
  const navigate = useNavigate();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Animal>>({});
  const [isAdding, setIsAdding] = useState(false);

  // Site Configuration State
  const [heroForm, setHeroForm] = useState<HeroData>(siteData.hero);
  const [infoForm, setInfoForm] = useState<InfoData>(siteData.info);
  const [isSavingSite, setIsSavingSite] = useState(false);
  const [removeImageOnSave, setRemoveImageOnSave] = useState(false);
  const [removeVideoOnSave, setRemoveVideoOnSave] = useState(false);
  const [selectedHeroMediaToRemove, setSelectedHeroMediaToRemove] = useState<number[]>([]);




  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const heroMediaInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setHeroForm(siteData.hero);
    setInfoForm(siteData.info);
    setSelectedHeroMediaToRemove([]);
  }, [siteData]);

  const handleSaveSiteConfig = () => {
    const normalizedMedia = heroForm.backgroundMedia
      .filter((item) => item.url.trim() !== '')
      .map((item) => ({
        ...item,
        url: item.url.trim(),
      }));

    if (normalizedMedia.length === 0) {
      alert('Agrega al menos una imagen o video para el carrusel principal');
      return;
    }

    setIsSavingSite(true);
    updateHero({ ...heroForm, backgroundMedia: normalizedMedia });
    updateInfo(infoForm);
    setSelectedHeroMediaToRemove([]);
    setTimeout(() => {
      setIsSavingSite(false);
      alert('Configuración de inicio guardada correctamente');
    }, 500);
  };

  const handleRemoveSelectedHeroMedia = () => {
    if (selectedHeroMediaToRemove.length === 0) {
      return;
    }

    setHeroForm((prev) => ({
      ...prev,
      backgroundMedia: prev.backgroundMedia.filter((_, idx) => !selectedHeroMediaToRemove.includes(idx)),
    }));
    setSelectedHeroMediaToRemove([]);
  };

  const handleHeroMediaUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    const uploadedMedia = await Promise.all(
      files.map(
        (file) =>
          new Promise<HeroMediaItem>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = typeof reader.result === 'string' ? reader.result : '';
              resolve({
                url: result,
                type: file.type.startsWith('video/') ? 'video' : 'image',
              });
            };
            reader.onerror = () => reject(new Error('No se pudo leer el archivo')); 
            reader.readAsDataURL(file);
          })
      )
    );

    setHeroForm((prev) => ({
      ...prev,
      backgroundMedia: [...prev.backgroundMedia, ...uploadedMedia],
    }));

    e.target.value = '';
  };

  const scrollToAnimalForm = () => {
    requestAnimationFrame(() => {
      document.getElementById('animal-form')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  };

  const handleEdit = (animal: Animal) => {
    const imageMedia = getVisualMediaByType(animal, 'image');
    const videoMedia = getVisualMediaByType(animal, 'video');
    const mergedMedia = [imageMedia, videoMedia].filter((item): item is MediaItem => Boolean(item));

    setEditingId(animal.id);
    setFormData({
      ...animal,
      imageUrls: undefined,
      mediaUrls: mergedMedia,
      imageUrl: imageMedia?.url || '',
    });
    setIsAdding(false);
    setRemoveImageOnSave(false);
    setRemoveVideoOnSave(false);
    scrollToAnimalForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este animal?')) {
      deleteAnimal(id);
    }
  };

  const handleSave = () => {
    const imageMedia = getVisualMediaByType(formData, 'image');
    const videoMedia = getVisualMediaByType(formData, 'video');

    const normalizedVisualMedia = [
      removeImageOnSave ? null : imageMedia,
      removeVideoOnSave ? null : videoMedia,
    ].filter((item): item is MediaItem => Boolean(item));
    const hasVisualMedia = normalizedVisualMedia.length > 0;

    if (isAdding) {
      if (!formData.name || !formData.species || !hasVisualMedia || !formData.habitat || !formData.conservation) {
        alert('Por favor completa los campos obligatorios');
        return;
      }

      const normalizedAnimal = {
        ...formData,
        imageUrl: normalizedVisualMedia.find((item) => item.type === 'image')?.url || normalizedVisualMedia[0]?.url || '',
        imageUrls: undefined,
        mediaUrls: normalizedVisualMedia.length > 0 ? normalizedVisualMedia : undefined,
      } as Omit<Animal, 'id'>;

      addAnimal(normalizedAnimal);
      setIsAdding(false);
      setRemoveImageOnSave(false);
      setRemoveVideoOnSave(false);
    } else if (editingId) {
      const normalizedAnimal = {
        ...formData,
        imageUrl: normalizedVisualMedia.find((item) => item.type === 'image')?.url || normalizedVisualMedia[0]?.url || '',
        imageUrls: undefined,
        mediaUrls: normalizedVisualMedia.length > 0 ? normalizedVisualMedia : undefined,
      };

      updateAnimal(editingId, normalizedAnimal);
      setEditingId(null);
      setRemoveImageOnSave(false);
      setRemoveVideoOnSave(false);
    }
    setFormData({});
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setRemoveImageOnSave(false);
    setRemoveVideoOnSave(false);
    setFormData({});
  };

  const handleFileChange = (field: 'imageUrl' | 'audioUrl') => (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setFormData((prev) => ({ ...prev, [field]: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleVisualMediaUpload = (e: ChangeEvent<HTMLInputElement>, mediaType: MediaItem['type']) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (!result) {
        return;
      }

      setFormData((prev) => ({
        ...prev,
        imageUrl: mediaType === 'image' ? result : prev.imageUrl,
        imageUrls: undefined,
        mediaUrls: upsertMediaByType(prev.mediaUrls, { url: result, type: mediaType }),
      }));
      if (mediaType === 'image') {
        setRemoveImageOnSave(false);
      } else {
        setRemoveVideoOnSave(false);
      }
    };
    reader.readAsDataURL(file);

    e.target.value = '';
  };

  const handleAddNewAnimal = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({
      conservation: 'No Amenazado',
      activity: 'Diurno',
      threats: [],
      funFacts: [],
    });
    setRemoveImageOnSave(false);
    setRemoveVideoOnSave(false);
    scrollToAnimalForm();
  };

  const renderForm = () => (
    <div id="animal-form" className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h3 className="text-xl font-bold text-green-800 mb-4">
        {isAdding ? 'Añadir Nuevo Animal' : 'Editar Animal'}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <Input 
            value={formData.name || ''} 
            onChange={e => setFormData({...formData, name: e.target.value})}
            placeholder="Ej. León Africano"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Especie Científica</label>
          <Input 
            value={formData.species || ''} 
            onChange={e => setFormData({...formData, species: e.target.value})}
            placeholder="Ej. Panthera leo"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hábitat</label>
          <Input 
            value={formData.habitat || ''} 
            onChange={e => setFormData({...formData, habitat: e.target.value})}
            placeholder="Ej. Sabana Africana"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Archivo visual (1 imagen y 1 video máximo)</label>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleVisualMediaUpload(e, 'image')}
          />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => handleVisualMediaUpload(e, 'video')}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => imageInputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" /> Subir imagen
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => videoInputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" /> Subir video
            </Button>
          </div>
          {(getVisualMediaByType(formData, 'image') || getVisualMediaByType(formData, 'video')) && (
            <div className="mt-2 rounded-md border border-gray-200 bg-gray-50 p-2">
              <p className="text-xs font-medium text-gray-700 mb-1">Al guardar:</p>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {getVisualMediaByType(formData, 'image') && (
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={removeImageOnSave}
                      onChange={(e) => setRemoveImageOnSave(e.target.checked)}
                    />
                    Quitar imagen al guardar
                  </label>
                )}
                {getVisualMediaByType(formData, 'video') && (
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={removeVideoOnSave}
                      onChange={(e) => setRemoveVideoOnSave(e.target.checked)}
                    />
                    Quitar video al guardar
                  </label>
                )}
              </div>
            </div>
          )}
          <p className="mt-1 text-xs text-gray-500">Máximo: 1 imagen y 1 video por especie.</p>

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="overflow-hidden rounded-md border border-gray-200 bg-gray-50">
              <p className="border-b border-gray-200 px-2 py-1 text-xs font-medium text-gray-600">Imagen</p>
              <img
                src={getVisualMediaByType(formData, 'image')?.url || IMAGE_PLACEHOLDER}
                alt="Vista previa de imagen"
                className="h-40 w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = IMAGE_PLACEHOLDER;
                }}
              />
            </div>
            <div className="overflow-hidden rounded-md border border-gray-200 bg-gray-50">
              <p className="border-b border-gray-200 px-2 py-1 text-xs font-medium text-gray-600">Video</p>
              {getVisualMediaByType(formData, 'video')?.url ? (
                <video
                  src={getVisualMediaByType(formData, 'video')?.url}
                  className="h-40 w-full object-cover bg-black"
                  controls
                />
              ) : (
                <div className="flex h-40 items-center justify-center text-xs text-gray-500">Sin video</div>
              )}
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL de Audio</label>
          <Input 
            value={formData.audioUrl || ''} 
            onChange={e => setFormData({...formData, audioUrl: e.target.value})}
            placeholder="https://.../audio.mp3"
          />
          <input
            ref={audioInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={handleFileChange('audioUrl')}
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => audioInputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" /> Subir audio local
            </Button>
            {formData.audioUrl && (
              <Button
                type="button"
                variant="outline"
                className="border-rose-300 text-rose-700 hover:bg-rose-50"
                onClick={() => setFormData((prev) => ({ ...prev, audioUrl: '' }))}
              >
                Quitar audio
              </Button>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">Si usas Google Drive, comparte el audio como "Cualquiera con el enlace" antes de pegar la URL.</p>
          <div className="mt-3 rounded-md border border-gray-200 bg-gray-50 p-3">
            {formData.audioUrl ? (
              isMegaUrl(formData.audioUrl) || isDriveUrl(formData.audioUrl) ? (
                <iframe
                  src={isMegaUrl(formData.audioUrl) ? toMegaEmbedUrl(formData.audioUrl) : getEmbeddedImageUrl(formData.audioUrl)}
                  title="Vista previa de audio"
                  className="h-24 w-full rounded-md border-0"
                  allow="autoplay"
                />
              ) : (
                <audio controls preload="none" className="w-full">
                  <source src={getAudioPreviewUrl(formData.audioUrl)} />
                  Tu navegador no soporta audio HTML5.
                </audio>
              )
            ) : (
              <p className="text-sm text-gray-500">Sin audio cargado. En la ficha se usará una narración automática si no agregas un archivo.</p>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado de Conservación</label>
          <select 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={formData.conservation || 'No Amenazado'}
            onChange={e => setFormData({...formData, conservation: e.target.value as ConservationStatus})}
          >
            <option value="No Amenazado">No Amenazado</option>
            <option value="Vulnerable">Vulnerable</option>
            <option value="En Peligro">En Peligro</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Actividad</label>
          <select 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={formData.activity || 'Diurno'}
            onChange={e => setFormData({...formData, activity: e.target.value as 'Diurno' | 'Nocturno' | 'Crepuscular'})}
          >
            <option value="Diurno">Diurno</option>
            <option value="Nocturno">Nocturno</option>
            <option value="Crepuscular">Crepuscular</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dieta</label>
          <Input 
            value={formData.diet || ''} 
            onChange={e => setFormData({...formData, diet: e.target.value})}
            placeholder="Ej. Carnívoro - ñus"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Esperanza de Vida</label>
          <Input 
            value={formData.lifespan || ''} 
            onChange={e => setFormData({...formData, lifespan: e.target.value})}
            placeholder="Ej. 10 a 14 años"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tamaño</label>
          <Input 
            value={formData.size || ''} 
            onChange={e => setFormData({...formData, size: e.target.value})}
            placeholder="Ej. 1.5 a 2 metros de altura"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Peso</label>
          <Input 
            value={formData.weight || ''} 
            onChange={e => setFormData({...formData, weight: e.target.value})}
            placeholder="Ej. 150 a 250 kg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Distribución</label>
          <Input 
            value={formData.distribution || ''} 
            onChange={e => setFormData({...formData, distribution: e.target.value})}
            placeholder="Ej. Sabanas de África"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea 
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={formData.description || ''} 
            onChange={e => setFormData({...formData, description: e.target.value})}
            placeholder="Añade información interesante..."
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Importancia</label>
          <textarea 
            className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={formData.importance || ''} 
            onChange={e => setFormData({...formData, importance: e.target.value})}
            placeholder="Ej. Son clave para mantener el equilibrio ecológico de las sabanas."
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Amenazas (separadas por comas)</label>
          <Input 
            value={formData.threats?.join(', ') || ''} 
            onChange={e => setFormData({...formData, threats: e.target.value.split(',').map(t => t.trim()).filter(t => t !== '')})}
            placeholder="Ej. Caza ilegal, Pérdida de hábitat"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Datos Curiosos (separados por punto y coma ;)</label>
          <textarea 
            className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={formData.funFacts?.join('; ') || ''} 
            onChange={e => setFormData({...formData, funFacts: e.target.value.split(';').map(t => t.trim()).filter(t => t !== '')})}
            placeholder="Ej. Los leones son los únicos felinos sociales; Pueden correr a velocidades de hasta 80 km/h"
          />
        </div>

        <AnimalQrTools animal={formData} animalId={editingId} />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleCancel}>
          <X className="w-4 h-4 mr-2" /> Cancelar
        </Button>
        <Button className="bg-green-600 hover:bg-green-700" onClick={handleSave} type="button">
          <Save className="w-4 h-4 mr-2" /> {isAdding ? 'Agregar especie' : 'Guardar cambios'}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl font-bold text-green-800">Panel de Administración</h1>
          </div>
        </div>

        <Tabs defaultValue="inicio">
          <TabsList className="mb-8">
            <TabsTrigger value="inicio">Página de Inicio</TabsTrigger>
            <TabsTrigger value="animales">Animales</TabsTrigger>
          </TabsList>

          <TabsContent value="inicio">
            <div className="bg-white p-6 rounded-lg shadow-md mb-8 space-y-8">
              <div>
                <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center">
                  <ImageIcon className="w-5 h-5 mr-2" />
                  Sección Principal 
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                    <Input 
                      value={heroForm.title} 
                      onChange={e => setHeroForm({...heroForm, title: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
                    <textarea 
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={heroForm.subtitle} 
                      onChange={e => setHeroForm({...heroForm, subtitle: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Archivos del carrusel (imágenes y videos)</label>
                    <div className="space-y-3">
                      {heroForm.backgroundMedia.map((media, idx) => (
                        <div key={`hero-media-${idx}`} className="relative rounded-md border border-input bg-white p-2">
                          <div className="flex items-center justify-between gap-2">
                            <label className="inline-flex items-center gap-2 text-xs font-medium text-gray-700">
                              <input
                                type="checkbox"
                                checked={selectedHeroMediaToRemove.includes(idx)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedHeroMediaToRemove((prev) => [...prev, idx]);
                                  } else {
                                    setSelectedHeroMediaToRemove((prev) => prev.filter((item) => item !== idx));
                                  }
                                }}
                              />
                              Marcar para quitar ({media.type === 'video' ? 'Video' : 'Imagen'} #{idx + 1})
                            </label>
                          </div>

                          <div className="mt-2">
                            {media.type === 'video' ? (
                              <video
                                src={media.url}
                                className="h-28 w-full rounded-md border object-cover bg-black"
                                controls
                                muted
                                preload="metadata"
                              />
                            ) : (
                              <img
                                src={media.url}
                                alt={`Vista previa ${idx + 1}`}
                                className="h-28 w-full rounded-md border object-cover"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = IMAGE_PLACEHOLDER;
                                }}
                              />
                            )}
                          </div>
                        </div>
                      ))}

                      <input
                        ref={heroMediaInputRef}
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        className="hidden"
                        onChange={handleHeroMediaUpload}
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => heroMediaInputRef.current?.click()}
                        >
                          <Upload className="mr-2 h-4 w-4" /> Agregar archivos al carrusel
                        </Button>
                        {selectedHeroMediaToRemove.length > 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            className="border-rose-300 text-rose-700 hover:bg-rose-50"
                            onClick={handleRemoveSelectedHeroMedia}
                          >
                            Quitar seleccionados ({selectedHeroMediaToRemove.length})
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Solo archivos locales. Puedes subir imágenes y videos; se muestran en el carrusel en el orden cargado.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Texto del Botón 1</label>
                    <Input 
                      value={heroForm.button1Text} 
                      onChange={e => setHeroForm({...heroForm, button1Text: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Texto del Botón 2</label>
                    <Input 
                      value={heroForm.button2Text} 
                      onChange={e => setHeroForm({...heroForm, button2Text: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t">
                <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center">
                  <Info className="w-5 h-5 mr-2" />
                  Sección de Información
                </h3>
                
                {/* General Info */}
                <div className="bg-gray-50 p-4 rounded-md mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Información General</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título Principal</label>
                      <Input 
                        value={infoForm.title} 
                        onChange={e => setInfoForm({...infoForm, title: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                      <textarea 
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={infoForm.description} 
                        onChange={e => setInfoForm({...infoForm, description: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Hours */}
                <div className="bg-gray-50 p-4 rounded-md mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Horarios de Apertura</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título de Horarios</label>
                      <Input 
                        value={infoForm.hoursCardTitle} 
                        onChange={e => setInfoForm({...infoForm, hoursCardTitle: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Etiqueta Lunes-Viernes</label>
                      <Input 
                        value={infoForm.weekdayLabel} 
                        onChange={e => setInfoForm({...infoForm, weekdayLabel: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Horarios Lunes-Viernes</label>
                      <Input 
                        value={infoForm.weekdayHours} 
                        onChange={e => setInfoForm({...infoForm, weekdayHours: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Etiqueta Fin de Semana</label>
                      <Input 
                        value={infoForm.weekendLabel} 
                        onChange={e => setInfoForm({...infoForm, weekendLabel: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Horarios Fin de Semana</label>
                      <Input 
                        value={infoForm.weekendHours} 
                        onChange={e => setInfoForm({...infoForm, weekendHours: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Etiqueta Días Festivos</label>
                      <Input 
                        value={infoForm.holidayLabel} 
                        onChange={e => setInfoForm({...infoForm, holidayLabel: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Horarios Días Festivos</label>
                      <Input 
                        value={infoForm.holidayHours} 
                        onChange={e => setInfoForm({...infoForm, holidayHours: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nota de Última Entrada</label>
                      <Input 
                        value={infoForm.lastEntryNote} 
                        onChange={e => setInfoForm({...infoForm, lastEntryNote: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Prices */}
                <div className="bg-gray-50 p-4 rounded-md mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Precios de Entrada</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título Precios</label>
                      <Input 
                        value={infoForm.pricesCardTitle} 
                        onChange={e => setInfoForm({...infoForm, pricesCardTitle: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Etiqueta Adultos</label>
                      <Input 
                        value={infoForm.adultLabel} 
                        onChange={e => setInfoForm({...infoForm, adultLabel: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Detalle Adultos</label>
                      <Input 
                        value={infoForm.adultDetail} 
                        onChange={e => setInfoForm({...infoForm, adultDetail: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Precio Adultos</label>
                      <Input 
                        value={infoForm.adultPrice} 
                        onChange={e => setInfoForm({...infoForm, adultPrice: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Etiqueta Niños</label>
                      <Input 
                        value={infoForm.childLabel} 
                        onChange={e => setInfoForm({...infoForm, childLabel: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Detalle Niños</label>
                      <Input 
                        value={infoForm.childDetail} 
                        onChange={e => setInfoForm({...infoForm, childDetail: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Precio Niños</label>
                      <Input 
                        value={infoForm.childPrice} 
                        onChange={e => setInfoForm({...infoForm, childPrice: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Etiqueta Adultos Mayores</label>
                      <Input 
                        value={infoForm.seniorLabel} 
                        onChange={e => setInfoForm({...infoForm, seniorLabel: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Detalle Adultos Mayores</label>
                      <Input 
                        value={infoForm.seniorDetail} 
                        onChange={e => setInfoForm({...infoForm, seniorDetail: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Precio Adultos Mayores</label>
                      <Input 
                        value={infoForm.seniorPrice} 
                        onChange={e => setInfoForm({...infoForm, seniorPrice: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Etiqueta Menores de 3 años</label>
                      <Input 
                        value={infoForm.toddlerLabel} 
                        onChange={e => setInfoForm({...infoForm, toddlerLabel: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Precio Menores de 3 años</label>
                      <Input 
                        value={infoForm.toddlerPrice} 
                        onChange={e => setInfoForm({...infoForm, toddlerPrice: e.target.value})}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nota de Descuento en Grupos</label>
                      <Input 
                        value={infoForm.groupDiscountNote} 
                        onChange={e => setInfoForm({...infoForm, groupDiscountNote: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="bg-gray-50 p-4 rounded-md mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Ubicación y Contacto</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título Ubicación</label>
                      <Input 
                        value={infoForm.locationCardTitle} 
                        onChange={e => setInfoForm({...infoForm, locationCardTitle: e.target.value})}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                      <textarea 
                        className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={infoForm.address} 
                        onChange={e => setInfoForm({...infoForm, address: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Etiqueta Contacto</label>
                      <Input 
                        value={infoForm.contactLabel} 
                        onChange={e => setInfoForm({...infoForm, contactLabel: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                      <Input 
                        value={infoForm.phone} 
                        onChange={e => setInfoForm({...infoForm, phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <Input 
                        value={infoForm.email} 
                        onChange={e => setInfoForm({...infoForm, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Texto Mapa</label>
                      <Input 
                        value={infoForm.mapPlaceholderText} 
                        onChange={e => setInfoForm({...infoForm, mapPlaceholderText: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nota Estacionamiento</label>
                      <Input 
                        value={infoForm.parkingNote} 
                        onChange={e => setInfoForm({...infoForm, parkingNote: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button 
                  className="bg-green-600 hover:bg-green-700" 
                  onClick={handleSaveSiteConfig}
                  disabled={isSavingSite}
                >
                  <Save className="w-4 h-4 mr-2" /> 
                  {isSavingSite ? 'Guardando...' : 'Guardar Configuración de Inicio'}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="animales">
            <div className="flex justify-end mb-4">
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={handleAddNewAnimal}
                type="button"
              >
                <Plus className="w-4 h-4 mr-2" /> Nueva especie
              </Button>
            </div>

            {(isAdding || editingId) && renderForm()}

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-green-50 text-green-800 border-b">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Imagen</th>
                      <th className="px-6 py-4 font-semibold">Nombre</th>
                      <th className="px-6 py-4 font-semibold">Especie</th>
                      <th className="px-6 py-4 font-semibold">Hábitat</th>
                      <th className="px-6 py-4 font-semibold">Estado</th>
                      <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {animals.map(animal => (
                      <tr key={animal.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="h-12 w-12 overflow-hidden rounded-full bg-gray-100">
                            {(animal.mediaUrls?.[0]?.type || 'image') === 'video' ? (
                              <video
                                src={animal.mediaUrls?.[0]?.url || animal.imageUrl}
                                className="h-full w-full object-cover bg-black"
                                muted
                              />
                            ) : (
                              <img
                                src={animal.mediaUrls?.[0]?.url || animal.imageUrl || IMAGE_PLACEHOLDER}
                                alt={animal.name}
                                className="h-full w-full object-cover bg-white"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = IMAGE_PLACEHOLDER;
                                }}
                              />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">{animal.name}</td>
                        <td className="px-6 py-4 text-gray-600 italic">{animal.species}</td>
                        <td className="px-6 py-4 text-gray-600">{animal.habitat}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium text-white
                            ${animal.conservation === 'En Peligro' ? 'bg-red-500' : 
                              animal.conservation === 'Vulnerable' ? 'bg-orange-500' : 'bg-green-500'}`}>
                            {animal.conservation}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                              onClick={() => handleEdit(animal)}
                            >
                              <Edit className="w-4 h-4" /> Editar
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                              onClick={() => handleDelete(animal.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {animals.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          No hay animales registrados. Añade uno nuevo.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}