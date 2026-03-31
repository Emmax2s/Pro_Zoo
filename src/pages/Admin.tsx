import { useState } from 'react';
import { useAnimals, Animal, ConservationStatus } from '../contexts/AnimalContext';
import { useSite, HeroData, InfoData } from '../contexts/SiteContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ArrowLeft, Plus, Edit, Trash2, Save, X, Image as ImageIcon, Type, Info } from 'lucide-react';
import { useNavigate } from 'react-router';

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

  const handleSaveSiteConfig = () => {
    setIsSavingSite(true);
    updateHero(heroForm);
    updateInfo(infoForm);
    setTimeout(() => {
      setIsSavingSite(false);
      alert('Configuración de inicio guardada correctamente');
    }, 500);
  };

  const handleEdit = (animal: Animal) => {
    setEditingId(animal.id);
    setFormData(animal);
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este animal?')) {
      deleteAnimal(id);
    }
  };

  const handleSave = () => {
    if (isAdding) {
      if (!formData.name || !formData.species || !formData.imageUrl || !formData.habitat || !formData.conservation) {
        alert('Por favor completa los campos obligatorios');
        return;
      }
      addAnimal(formData as Omit<Animal, 'id'>);
      setIsAdding(false);
    } else if (editingId) {
      updateAnimal(editingId, formData);
      setEditingId(null);
    }
    setFormData({});
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({});
  };

  const renderForm = () => (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
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
          <label className="block text-sm font-medium text-gray-700 mb-1">URL de Imagen</label>
          <Input 
            value={formData.imageUrl || ''} 
            onChange={e => setFormData({...formData, imageUrl: e.target.value})}
            placeholder="https://..."
          />
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
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleCancel}>
          <X className="w-4 h-4 mr-2" /> Cancelar
        </Button>
        <Button className="bg-green-600 hover:bg-green-700" onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" /> Guardar
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
                  Sección Principal (Hero)
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL de Imagen de Fondo</label>
                    <Input 
                      value={heroForm.backgroundImageUrl} 
                      onChange={e => setHeroForm({...heroForm, backgroundImageUrl: e.target.value})}
                    />
                    <p className="text-xs text-gray-500 mt-1">Copia la URL de una imagen o busca en Unsplash.</p>
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
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
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
                onClick={() => {
                  setIsAdding(true);
                  setEditingId(null);
                  setFormData({ conservation: 'No Amenazado' });
                }}
                disabled={isAdding || editingId !== null}
              >
                <Plus className="w-4 h-4 mr-2" /> Nuevo Animal
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
                          <div className="w-12 h-12 rounded-full overflow-hidden">
                            <img src={animal.imageUrl} alt={animal.name} className="w-full h-full object-cover" />
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
                              size="icon" 
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                              onClick={() => handleEdit(animal)}
                            >
                              <Edit className="w-4 h-4" />
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