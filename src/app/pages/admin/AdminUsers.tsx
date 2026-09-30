import { useState } from "react";
import { Plus, Trash2, Mail, ShieldCheck, Building2, X, AlertTriangle } from "lucide-react";
import { useZoo } from "../../context/ZooContext";
import { ZooUser, UserRole } from "../../data/zooStore";

const emptyForm: Omit<ZooUser, "id"> = {
  name: "",
  email: "",
  role: "enclosure_admin",
  enclosureId: null,
  status: "Activo",
};

function UserModal({
  user,
  onSave,
  onClose,
}: {
  user: ZooUser | Omit<ZooUser, "id">;
  onSave: (data: Omit<ZooUser, "id">) => void;
  onClose: () => void;
}) {
  const { enclosures } = useZoo();
  const isEditing = "id" in user;
  const [form, setForm] = useState<Omit<ZooUser, "id">>({
    name: user.name,
    email: user.email,
    role: user.role,
    enclosureId: user.enclosureId,
    status: user.status,
  });

  function handle(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((p) => {
      const updated = { ...p, [name]: value === "" ? null : value };
      if (name === "role" && value === "superadmin") updated.enclosureId = null;
      return updated;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    if (form.role === "enclosure_admin" && !form.enclosureId) return;
    onSave(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">{isEditing ? "Editar Administrador" : "Invitar Administrador"}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Nombre Completo <span className="text-red-500">*</span>
            </label>
            <input name="name" value={form.name} onChange={handle} required placeholder="ej. María Ramos"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Correo Electrónico <span className="text-red-500">*</span>
            </label>
            <input name="email" type="email" value={form.email} onChange={handle} required placeholder="correo@zoomat.mx"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Rol</label>
            <select name="role" value={form.role} onChange={handle}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
              <option value="superadmin">Super Admin — acceso total</option>
              <option value="enclosure_admin">Admin de Recinto — acceso limitado a un recinto</option>
            </select>
          </div>

          {form.role === "enclosure_admin" && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Recinto Asignado <span className="text-red-500">*</span>
              </label>
              <select name="enclosureId" value={form.enclosureId ?? ""} onChange={handle} required
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                <option value="">Seleccionar recinto...</option>
                {enclosures.map((enc) => (
                  <option key={enc.id} value={enc.id}>{enc.icon} {enc.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1.5">Este administrador solo podrá ver y editar los animales de este recinto.</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              Cancelar
            </button>
            <button type="submit"
              className="px-5 py-2.5 text-sm font-bold bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 transition-colors">
              {isEditing ? "Guardar Cambios" : "Invitar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteUserDialog({ user, onConfirm, onClose }: { user: ZooUser; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Revocar Acceso</h2>
            <p className="text-sm text-gray-500">
              ¿Seguro que quieres eliminar a <span className="font-semibold text-gray-900">{user.name}</span>? Esta acción no se puede deshacer.
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

export function AdminUsers() {
  const { users, setUsers, enclosures, animals } = useZoo();
  const [modalState, setModalState] = useState<{ open: boolean; user: ZooUser | null }>({ open: false, user: null });
  const [deleteTarget, setDeleteTarget] = useState<ZooUser | null>(null);
  const [nextId, setNextId] = useState(100);

  function estimatedDailyVisits(animalId: number, category: string) {
    const categoryBoost: Record<string, number> = {
      "Mamífero": 70,
      "Ave": 55,
      "Reptil": 45,
      "Anfibio": 35,
      "Pez": 30,
      "Invertebrado": 25,
    };
    const base = 40 + (animalId % 5) * 9;
    return base + (categoryBoost[category] ?? 20);
  }

  function getEnclosureVisitStats(enclosureId: string | null) {
    const enclosureAnimals = animals.filter((a) => a.enclosureId === enclosureId);
    if (enclosureAnimals.length === 0) return null;

    const monthly = enclosureAnimals
      .map((a) => ({
        ...a,
        visitors: estimatedDailyVisits(a.id, a.category) * 30,
      }))
      .sort((a, b) => b.visitors - a.visitors);

    const top = monthly[0];
    const bottom = monthly[monthly.length - 1];
    return { top, bottom };
  }

  const superAdmins = users.filter((u) => u.role === "superadmin");
  const enclosureAdmins = users.filter((u) => u.role === "enclosure_admin");

  function handleSave(data: Omit<ZooUser, "id">) {
    if (modalState.user) {
      setUsers(users.map((u) => (u.id === modalState.user!.id ? { ...data, id: u.id } : u)));
    } else {
      setUsers([...users, { ...data, id: nextId }]);
      setNextId((n) => n + 1);
    }
    setModalState({ open: false, user: null });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setUsers(users.filter((u) => u.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  function getEnclosure(id: string | null) {
    return enclosures.find((e) => e.id === id);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Administradores</h1>
          <p className="text-sm text-gray-500 mt-1">{users.length} usuarios registrados</p>
        </div>
        <button
          onClick={() => setModalState({ open: true, user: null })}
          className="bg-emerald-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-emerald-800 transition-colors font-bold text-sm"
        >
          <Plus size={18} /> Invitar Admin
        </button>
      </div>

      {/* Super Admins */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck size={18} className="text-purple-600" />
          <h2 className="font-bold text-gray-700 uppercase text-xs tracking-wider">Super Administradores</h2>
          <span className="ml-auto text-xs text-gray-400">{superAdmins.length}</span>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <tbody>
              {superAdmins.map((user) => (
                <tr key={user.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1"><Mail size={11} /> {user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                      Super Admin
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {superAdmins.length > 1 && (
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setModalState({ open: true, user })}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                          ✏️
                        </button>
                        <button onClick={() => setDeleteTarget(user)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Enclosure Admins */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Building2 size={18} className="text-emerald-600" />
          <h2 className="font-bold text-gray-700 uppercase text-xs tracking-wider">Administradores de Recinto</h2>
          <span className="ml-auto text-xs text-gray-400">{enclosureAdmins.length}</span>
        </div>

        {enclosureAdmins.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-10 text-center text-gray-400 text-sm">
            No hay administradores de recinto aún.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold border-b border-gray-100">Administrador</th>
                  <th className="p-4 font-semibold border-b border-gray-100">Recinto Asignado</th>
                  <th className="p-4 font-semibold border-b border-gray-100">Más visitado (mes)</th>
                  <th className="p-4 font-semibold border-b border-gray-100">Menos visitado (mes)</th>
                  <th className="p-4 font-semibold border-b border-gray-100 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {enclosureAdmins.map((user) => {
                  const enc = getEnclosure(user.enclosureId);
                  const stats = getEnclosureVisitStats(user.enclosureId);
                  return (
                    <tr key={user.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1"><Mail size={11} /> {user.email}</p>
                          </div>
                        </div>
                      </td>
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
                        {stats ? (
                          <div className="text-xs">
                            <p className="font-semibold text-emerald-700">{stats.top.name}</p>
                            <p className="text-gray-500">{stats.top.visitors.toLocaleString("es-MX")} visitantes</p>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Sin datos</span>
                        )}
                      </td>
                      <td className="p-4">
                        {stats ? (
                          <div className="text-xs">
                            <p className="font-semibold text-rose-700">{stats.bottom.name}</p>
                            <p className="text-gray-500">{stats.bottom.visitors.toLocaleString("es-MX")} visitantes</p>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Sin datos</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => setModalState({ open: true, user })}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                            <span className="text-sm">✏️</span>
                          </button>
                          <button onClick={() => setDeleteTarget(user)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modalState.open && (
        <UserModal
          user={modalState.user ?? emptyForm}
          onSave={handleSave}
          onClose={() => setModalState({ open: false, user: null })}
        />
      )}
      {deleteTarget && (
        <DeleteUserDialog user={deleteTarget} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} />
      )}
    </div>
  );
}
