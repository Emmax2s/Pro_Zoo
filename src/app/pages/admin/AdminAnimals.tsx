import { useState } from "react";
import { Plus, Edit2, Trash2, Search, X, AlertTriangle, MapPin } from "lucide-react";
import { useZoo } from "../../context/ZooContext";
import {
  Animal,
  ANIMAL_CATEGORIES,
  CONSERVATION_STATUSES,
  STATUS_COLORS,
  AnimalCategory,
  ConservationStatus,
} from "../../data/zooStore";

const emptyForm: Omit<Animal, "id"> = {
  name: "",
  scientificName: "",
  category: "Mamífero",
  status: "Amenazada",
  habitat: "",
  diet: "",
  funFact: "",
  image: "",
  enclosureId: null,
};

function AnimalModal({
  animal,
  onSave,
  onClose,
}: {
  animal: Omit<Animal, "id"> | Animal;
  onSave: (data: Omit<Animal, "id">) => void;
  onClose: () => void;
}) {
  const { enclosures, currentUser } = useZoo();
  const [form, setForm] = useState<Omit<Animal, "id">>({
    name: animal.name,
    scientificName: animal.scientificName,
    category: animal.category,
    status: animal.status,
    habitat: animal.habitat,
    diet: animal.diet,
    funFact: animal.funFact,
    image: animal.image,
    enclosureId: animal.enclosureId,
  });

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataURL = reader.result as string;
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, data: dataURL }),
        });
        const json = await res.json();
        setForm((p) => ({ ...p, image: json.url }));
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Upload failed', err);
      }
    };
    reader.readAsDataURL(file);
  }

  const isEditing = "id" in animal;

  function handle(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value === "" ? null : value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    // If enclosure_admin, lock to their enclosure
    const saved = currentUser.role === "enclosure_admin"
      ? { ...form, enclosureId: currentUser.enclosureId }
      : form;
    onSave(saved);
  }

  const availableEnclosures = currentUser.role === "enclosure_admin"
    ? enclosures.filter((e) => e.id === currentUser.enclosureId)
    : enclosures;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? "Editar Especie" : "Nueva Especie"}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Nombre Común <span className="text-red-500">*</span>
              </label>
              <input
                name="name" value={form.name} onChange={handle} required
                placeholder="ej. Jaguar"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Nombre Científico
              </label>
              <input
                name="scientificName" value={form.scientificName} onChange={handle}
                placeholder="ej. Panthera onca"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 italic"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Categoría</label>
              <select name="category" value={form.category} onChange={handle}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                {ANIMAL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Estado de Conservación</label>
              <select name="status" value={form.status} onChange={handle}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                {CONSERVATION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Enclosure */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              <MapPin className="inline w-3.5 h-3.5 mr-1" />
              Recinto
            </label>
            {currentUser.role === "enclosure_admin" ? (
              <div className="px-3.5 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 text-sm">
                {availableEnclosures[0]?.icon} {availableEnclosures[0]?.name} — asignado automáticamente
              </div>
            ) : (
              <select
                name="enclosureId"
                value={form.enclosureId ?? ""}
                onChange={handle}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="">Sin recinto asignado</option>
                {enclosures.map((enc) => (
                  <option key={enc.id} value={enc.id}>{enc.icon} {enc.name}</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Hábitat</label>
            <input name="habitat" value={form.habitat} onChange={handle}
              placeholder="ej. Selvas tropicales de Chiapas"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Dieta</label>
            <input name="diet" value={form.diet} onChange={handle}
              placeholder="ej. Carnívoro: pecaríes, venados..."
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Dato Curioso</label>
            <textarea name="funFact" value={form.funFact} onChange={handle} rows={3}
              placeholder="Un dato interesante sobre esta especie..."
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">URL de Imagen</label>
            <div className="flex gap-2">
              <input name="image" value={form.image} onChange={handle}
                placeholder="/assets/images/placeholder.svg"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <input type="file" accept="image/*" onChange={handleFileUpload} className="px-3 py-2 bg-white border border-gray-200 rounded-xl" />
            </div>
            {form.image && (
              <div className="mt-2 h-32 rounded-xl overflow-hidden bg-gray-100">
                <img src={form.image} alt="Vista previa" className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              Cancelar
            </button>
            <button type="submit"
              className="px-5 py-2.5 text-sm font-bold bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 transition-colors">
              {isEditing ? "Guardar Cambios" : "Crear Especie"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteDialog({ animal, onConfirm, onClose }: { animal: Animal; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Eliminar Especie</h2>
            <p className="text-sm text-gray-500">
              ¿Seguro que quieres eliminar <span className="font-semibold text-gray-900">{animal.name}</span>? Esta acción no se puede deshacer.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Cancelar</button>
          <button onClick={onConfirm} className="px-5 py-2.5 text-sm font-bold bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors">Eliminar</button>
        </div>
      </div>
    </div>
  );
}

export function AdminAnimals() {
  const { animals, setAnimals, enclosures, currentUser } = useZoo();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEnclosure, setFilterEnclosure] = useState<string>("all");
  const [modalState, setModalState] = useState<{ open: boolean; animal: Animal | null }>({ open: false, animal: null });
  const [deleteTarget, setDeleteTarget] = useState<Animal | null>(null);
  const [nextId, setNextId] = useState(100);

  // Enclosure admins only see their enclosure's animals
  const scopedAnimals = currentUser.role === "enclosure_admin"
    ? animals.filter((a) => a.enclosureId === currentUser.enclosureId)
    : animals;

  const filteredAnimals = scopedAnimals.filter((a) => {
    const matchSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.scientificName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEnclosure = filterEnclosure === "all" || a.enclosureId === filterEnclosure ||
      (filterEnclosure === "none" && !a.enclosureId);
    return matchSearch && matchEnclosure;
  });

  function handleSave(data: Omit<Animal, "id">) {
    if (modalState.animal) {
      setAnimals(animals.map((a) => (a.id === modalState.animal!.id ? { ...data, id: a.id } : a)));
    } else {
      setAnimals([...animals, { ...data, id: nextId }]);
      setNextId((n) => n + 1);
    }
    setModalState({ open: false, animal: null });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setAnimals(animals.filter((a) => a.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  const getEnclosure = (id: string | null) => enclosures.find((e) => e.id === id);

  const isSuperAdmin = currentUser.role === "superadmin";
  const myEnclosure = isSuperAdmin ? null : enclosures.find((e) => e.id === currentUser.enclosureId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isSuperAdmin ? "Gestión de Especies" : `Especies — ${myEnclosure?.icon} ${myEnclosure?.name}`}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{filteredAnimals.length} especie{filteredAnimals.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setModalState({ open: true, animal: null })}
          className="bg-emerald-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-emerald-800 transition-colors font-bold text-sm"
        >
          <Plus size={18} /> Nueva Especie
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text" placeholder="Buscar especie..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />
        </div>
        {isSuperAdmin && (
          <select
            value={filterEnclosure}
            onChange={(e) => setFilterEnclosure(e.target.value)}
            className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="all">Todos los recintos</option>
            <option value="none">Sin recinto</option>
            {enclosures.map((enc) => (
              <option key={enc.id} value={enc.id}>{enc.icon} {enc.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold border-b border-gray-100 w-12"></th>
                <th className="p-4 font-semibold border-b border-gray-100">Especie</th>
                <th className="p-4 font-semibold border-b border-gray-100">Categoría</th>
                <th className="p-4 font-semibold border-b border-gray-100">Recinto</th>
                <th className="p-4 font-semibold border-b border-gray-100">Conservación</th>
                <th className="p-4 font-semibold border-b border-gray-100 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAnimals.map((animal) => {
                const enc = getEnclosure(animal.enclosureId);
                return (
                  <tr key={animal.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0">
                    <td className="p-4">
                      {animal.image ? (
                        <img src={animal.image} alt={animal.name}
                          className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-400 text-sm font-bold">
                          {animal.name.charAt(0)}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-gray-900">{animal.name}</p>
                      <p className="text-xs text-gray-400 italic mt-0.5">{animal.scientificName}</p>
                    </td>
                    <td className="p-4 text-gray-600 text-sm">{animal.category}</td>
                    <td className="p-4">
                      {enc ? (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full text-white ${enc.color}`}>
                          {enc.icon} {enc.name}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Sin recinto</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[animal.status]}`}>
                        {animal.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1">
                      <button onClick={() => setModalState({ open: true, animal })}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Editar">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => setDeleteTarget(animal)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredAnimals.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-gray-400 text-sm">No se encontraron especies.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalState.open && (
        <AnimalModal
          animal={modalState.animal ?? { ...emptyForm, enclosureId: currentUser.role === "enclosure_admin" ? currentUser.enclosureId : null }}
          onSave={handleSave}
          onClose={() => setModalState({ open: false, animal: null })}
        />
      )}
      {deleteTarget && (
        <DeleteDialog animal={deleteTarget} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} />
      )}
    </div>
  );
}
