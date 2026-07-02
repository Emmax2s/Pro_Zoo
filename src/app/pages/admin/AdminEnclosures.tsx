import { useState } from "react";
import { Plus, Edit2, Trash2, X, AlertTriangle, PawPrint, Users } from "lucide-react";
import { useZoo } from "../../context/ZooContext";
import { Enclosure } from "../../data/zooStore";

const ENCLOSURE_COLORS = [
  { label: "Esmeralda", value: "bg-emerald-600" },
  { label: "Ámbar", value: "bg-amber-500" },
  { label: "Índigo", value: "bg-indigo-600" },
  { label: "Cielo", value: "bg-sky-500" },
  { label: "Rosa", value: "bg-rose-500" },
  { label: "Púrpura", value: "bg-purple-600" },
  { label: "Teal", value: "bg-teal-600" },
  { label: "Naranja", value: "bg-orange-500" },
];

const ENCLOSURE_ICONS = ["🦎", "🦇", "🌿", "🐍", "🦜", "🐢", "🦋", "🐠", "🦁", "🐘", "🦏", "🐊"];

const emptyForm: Omit<Enclosure, "id"> = {
  name: "",
  description: "",
  color: "bg-emerald-600",
  icon: "🌿",
};

function EnclosureModal({
  enclosure,
  onSave,
  onClose,
}: {
  enclosure: Enclosure | Omit<Enclosure, "id">;
  onSave: (data: Omit<Enclosure, "id">) => void;
  onClose: () => void;
}) {
  const isEditing = "id" in enclosure;
  const [form, setForm] = useState<Omit<Enclosure, "id">>({
    name: enclosure.name,
    description: enclosure.description,
    color: enclosure.color,
    icon: enclosure.icon,
  });

  function handle(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">{isEditing ? "Editar Recinto" : "Nuevo Recinto"}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Preview */}
          <div className={`${form.color} rounded-xl p-4 flex items-center gap-3 text-white`}>
            <span className="text-3xl">{form.icon}</span>
            <div>
              <p className="font-bold text-lg">{form.name || "Nombre del recinto"}</p>
              <p className="text-sm opacity-80">{form.description || "Descripción"}</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input name="name" value={form.name} onChange={handle} required
              placeholder="ej. Herpetario"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Descripción</label>
            <input name="description" value={form.description} onChange={handle}
              placeholder="ej. Reptiles y anfibios de la región"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Color</label>
              <select name="color" value={form.color} onChange={handle}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                {ENCLOSURE_COLORS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Ícono</label>
              <select name="icon" value={form.icon} onChange={handle}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                {ENCLOSURE_ICONS.map((ic) => (
                  <option key={ic} value={ic}>{ic}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              Cancelar
            </button>
            <button type="submit"
              className="px-5 py-2.5 text-sm font-bold bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 transition-colors">
              {isEditing ? "Guardar Cambios" : "Crear Recinto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteEnclosureDialog({ enclosure, animalCount, adminCount, onConfirm, onClose }: {
  enclosure: Enclosure;
  animalCount: number;
  adminCount: number;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Eliminar Recinto</h2>
            <p className="text-sm text-gray-500">
              ¿Seguro que quieres eliminar <span className="font-semibold text-gray-900">{enclosure.icon} {enclosure.name}</span>?
            </p>
          </div>
        </div>
        {(animalCount > 0 || adminCount > 0) && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 text-sm text-amber-800 space-y-1">
            {animalCount > 0 && <p>• <strong>{animalCount}</strong> animal{animalCount !== 1 ? "es" : ""} quedarán sin recinto asignado.</p>}
            {adminCount > 0 && <p>• <strong>{adminCount}</strong> administrador{adminCount !== 1 ? "es" : ""} perderán su acceso de recinto.</p>}
          </div>
        )}
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Cancelar</button>
          <button onClick={onConfirm} className="px-5 py-2.5 text-sm font-bold bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors">Eliminar</button>
        </div>
      </div>
    </div>
  );
}

export function AdminEnclosures() {
  const { enclosures, setEnclosures, animals, setAnimals, users, setUsers } = useZoo();
  const [modalState, setModalState] = useState<{ open: boolean; enclosure: Enclosure | null }>({ open: false, enclosure: null });
  const [deleteTarget, setDeleteTarget] = useState<Enclosure | null>(null);
  const [nextId, setNextId] = useState(10);

  function handleSave(data: Omit<Enclosure, "id">) {
    if (modalState.enclosure) {
      setEnclosures(enclosures.map((e) => (e.id === modalState.enclosure!.id ? { ...data, id: e.id } : e)));
    } else {
      const id = data.name.toLowerCase().replace(/\s+/g, "-") + "-" + nextId;
      setEnclosures([...enclosures, { ...data, id }]);
      setNextId((n) => n + 1);
    }
    setModalState({ open: false, enclosure: null });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setEnclosures(enclosures.filter((e) => e.id !== id));
    setAnimals(animals.map((a) => a.enclosureId === id ? { ...a, enclosureId: null } : a));
    setUsers(users.map((u) => u.enclosureId === id ? { ...u, enclosureId: null, role: "superadmin" } : u));
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recintos</h1>
          <p className="text-sm text-gray-500 mt-1">{enclosures.length} recintos registrados</p>
        </div>
        <button
          onClick={() => setModalState({ open: true, enclosure: null })}
          className="bg-emerald-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-emerald-800 transition-colors font-bold text-sm"
        >
          <Plus size={18} /> Nuevo Recinto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {enclosures.map((enc) => {
          const animalCount = animals.filter((a) => a.enclosureId === enc.id).length;
          const adminCount = users.filter((u) => u.enclosureId === enc.id).length;
          return (
            <div key={enc.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {/* Color header */}
              <div className={`${enc.color} p-5 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{enc.icon}</span>
                  <div>
                    <h3 className="font-bold text-white text-lg leading-tight">{enc.name}</h3>
                    <p className="text-white/75 text-sm">{enc.description}</p>
                  </div>
                </div>
              </div>
              {/* Stats */}
              <div className="p-5">
                <div className="flex gap-4 mb-5">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <PawPrint size={16} className="text-gray-400" />
                    <span><strong className="text-gray-900">{animalCount}</strong> animal{animalCount !== 1 ? "es" : ""}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users size={16} className="text-gray-400" />
                    <span><strong className="text-gray-900">{adminCount}</strong> admin{adminCount !== 1 ? "s" : ""}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setModalState({ open: true, enclosure: enc })}
                    className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
                  >
                    <Edit2 size={15} /> Editar
                  </button>
                  <button
                    onClick={() => setDeleteTarget(enc)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                  >
                    <Trash2 size={15} /> Eliminar
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add card */}
        <button
          onClick={() => setModalState({ open: true, enclosure: null })}
          className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 text-gray-400 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50/30 transition-all"
        >
          <Plus size={28} />
          <span className="text-sm font-semibold">Agregar Recinto</span>
        </button>
      </div>

      {modalState.open && (
        <EnclosureModal
          enclosure={modalState.enclosure ?? emptyForm}
          onSave={handleSave}
          onClose={() => setModalState({ open: false, enclosure: null })}
        />
      )}
      {deleteTarget && (
        <DeleteEnclosureDialog
          enclosure={deleteTarget}
          animalCount={animals.filter((a) => a.enclosureId === deleteTarget.id).length}
          adminCount={users.filter((u) => u.enclosureId === deleteTarget.id).length}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
