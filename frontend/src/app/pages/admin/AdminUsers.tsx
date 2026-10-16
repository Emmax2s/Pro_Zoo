import { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Trash2,
  Mail,
  ShieldCheck,
  Building2,
  X,
  AlertTriangle,
  History,
  Download,
  Printer,
  Search,
  CheckCircle2,
  RefreshCw,
  FileSpreadsheet,
} from "lucide-react";
import { useZoo } from "../../context/ZooContext";
import { ZooUser, AdminAuditLog } from "../../data/zooStore";
import { useAuth } from "../../context/AuthContext";
import {
  getStoredAuditLogs,
  saveAuditLog,
  exportAuditLogsToCSV,
  printAuditReport,
} from "../../services/auditService";

const API_BASE_URL = ((import.meta.env.VITE_API_BASE_URL as string | undefined) || "").replace(/\/$/, "");
type UserFormData = Omit<ZooUser, "id"> & { password?: string };

const emptyForm: Omit<ZooUser, "id"> = {
  name: "",
  email: "",
  role: "enclosure_admin",
  enclosureId: null,
  enclosureIds: [],
  status: "Activo",
};

function UserModal({
  user,
  onSave,
  onClose,
}: {
  user: ZooUser | Omit<ZooUser, "id">;
  onSave: (data: UserFormData) => void;
  onClose: () => void;
}) {
  const { enclosures } = useZoo();
  const isEditing = "id" in user;

  const initialEnclosures = (): string[] => {
    if (user.enclosureIds && user.enclosureIds.length > 0) return user.enclosureIds;
    if (user.enclosureId) return user.enclosureId.split(",").map((s) => s.trim()).filter(Boolean);
    return [];
  };

  const [selectedEnclosures, setSelectedEnclosures] = useState<string[]>(initialEnclosures());
  const [form, setForm] = useState<Omit<ZooUser, "id">>({
    name: user.name,
    email: user.email,
    role: user.role,
    enclosureId: user.enclosureId,
    enclosureIds: initialEnclosures(),
    status: user.status,
  });
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const toggleEnclosure = (encId: string) => {
    setErrorMessage("");
    if (selectedEnclosures.includes(encId)) {
      setSelectedEnclosures(selectedEnclosures.filter((id) => id !== encId));
    } else {
      if (selectedEnclosures.length >= 3) {
        setErrorMessage("Máximo 3 recintos permitidos por administrador.");
        return;
      }
      setSelectedEnclosures([...selectedEnclosures, encId]);
    }
  };

  function handle(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((p) => {
      const updated = { ...p, [name]: value === "" ? null : value };
      if (name === "role" && value === "superadmin") {
        updated.enclosureId = null;
        updated.enclosureIds = [];
        setSelectedEnclosures([]);
      }
      return updated;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;

    if (form.role === "enclosure_admin") {
      if (selectedEnclosures.length === 0) {
        setErrorMessage("Debes asignar al menos 1 recinto (máximo 3) para este administrador.");
        return;
      }
      if (selectedEnclosures.length > 3) {
        setErrorMessage("No puedes asignar más de 3 recintos a un administrador.");
        return;
      }
    }

    const primaryEnclosure = selectedEnclosures[0] || null;
    const joined = selectedEnclosures.length > 0 ? selectedEnclosures.join(",") : null;

    onSave({
      ...form,
      enclosureId: joined || primaryEnclosure,
      enclosureIds: selectedEnclosures,
      password: password || undefined,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isEditing ? "Editar Administrador" : "Invitar Administrador"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Configura permisos de acceso y recintos asignados (1 a 3)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle size={16} className="flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!isEditing && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Contraseña inicial <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                required
                placeholder="Mínimo 8 caracteres"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Nombre Completo <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handle}
              required
              placeholder="Nombre del administrador"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Correo Electrónico <span className="text-red-500">*</span>
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handle}
              required
              placeholder="correo@zoomat.mx"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Rol</label>
            <select
              name="role"
              value={form.role}
              onChange={handle}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="superadmin">Super Admin — acceso total al sistema</option>
              <option value="enclosure_admin">Admin de Recinto — asignación de 1 a 3 recintos</option>
            </select>
          </div>

          {form.role === "enclosure_admin" && (
            <div className="border border-emerald-100 bg-emerald-50/40 p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-extrabold text-emerald-950 uppercase tracking-wider">
                    Recintos Asignados (1 a 3) <span className="text-red-500">*</span>
                  </label>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    Como Superadministrador, selecciona de <strong>1 a 3 recintos</strong> para este administrador.
                  </p>
                </div>
                <span
                  className={`text-xs font-black px-2.5 py-1 rounded-full border ${
                    selectedEnclosures.length === 0
                      ? "bg-red-100 text-red-800 border-red-200"
                      : selectedEnclosures.length === 3
                      ? "bg-amber-100 text-amber-900 border-amber-300"
                      : "bg-emerald-100 text-emerald-900 border-emerald-300"
                  }`}
                >
                  {selectedEnclosures.length} / 3 asignados
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto p-1">
                {enclosures.map((enc) => {
                  const isSelected = selectedEnclosures.includes(enc.id);
                  const reachedMax = selectedEnclosures.length >= 3 && !isSelected;
                  return (
                    <button
                      key={enc.id}
                      type="button"
                      disabled={reachedMax}
                      onClick={() => toggleEnclosure(enc.id)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                          : reachedMax
                          ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
                          : "border-emerald-200 bg-white text-gray-800 hover:border-emerald-500 hover:bg-emerald-50"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center text-xs flex-shrink-0 transition-colors ${
                          isSelected
                            ? "bg-white text-emerald-700 font-black shadow-xs"
                            : "border border-gray-300 bg-gray-50"
                        }`}
                      >
                        {isSelected ? "✓" : ""}
                      </div>
                      <span className="text-lg leading-none">{enc.icon}</span>
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-bold truncate ${isSelected ? "text-white" : "text-gray-900"}`}>
                          {enc.name}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedEnclosures.length === 0 && (
                <p className="text-xs text-red-600 font-semibold flex items-center gap-1">
                  <AlertTriangle size={13} /> Selecciona al menos 1 recinto para continuar.
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-bold bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 transition-colors cursor-pointer shadow-md"
            >
              {isEditing ? "Guardar Cambios" : "Invitar Administrador"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteUserDialog({
  user,
  onConfirm,
  onClose,
}: {
  user: ZooUser;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Revocar Acceso</h2>
            <p className="text-sm text-gray-500">
              ¿Seguro que quieres eliminar a <span className="font-semibold text-gray-900">{user.name}</span>? Esta acción no se puede deshacer y quedará registrada en el historial.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 text-sm font-bold bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors cursor-pointer"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminUsers() {
  const { users, setUsers, enclosures, currentUser } = useZoo();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<"users" | "audit">("users");
  const [modalState, setModalState] = useState<{ open: boolean; user: ZooUser | null }>({ open: false, user: null });
  const [deleteTarget, setDeleteTarget] = useState<ZooUser | null>(null);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);

  // Audit filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [filterAdmin, setFilterAdmin] = useState<string>("all");

  const refreshLogs = () => {
    setAuditLogs(getStoredAuditLogs());
  };

  useEffect(() => {
    refreshLogs();
  }, []);

  useEffect(() => {
    if (!API_BASE_URL || !token) return;
    fetch(`${API_BASE_URL}/api/admin/list`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const data = await response.json().catch(() => []);
        if (!response.ok) throw new Error(data.message || "No se pudieron cargar los usuarios.");
        return data;
      })
      .then((data) => {
        setUsers(
          data.map((user: Record<string, unknown>) => {
            const rawEncId = user.enclosureId ? String(user.enclosureId) : null;
            const encIds = Array.isArray(user.enclosureIds) && user.enclosureIds.length > 0
              ? user.enclosureIds.map(String)
              : rawEncId
              ? rawEncId.split(",").map((s) => s.trim()).filter(Boolean)
              : [];

            return {
              id: Number(user.id),
              name: String(user.name || user.username || ""),
              email: String(user.email || ""),
              role: user.role === "enclosure_admin" ? "enclosure_admin" : "superadmin",
              enclosureId: rawEncId,
              enclosureIds: encIds,
              status: user.isActive ? "Activo" : "Inactivo",
            };
          })
        );
      })
      .catch((error) => console.warn(error instanceof Error ? error.message : "Error al sincronizar usuarios de API."));
  }, [setUsers, token]);

  const superAdmins = users.filter((u) => u.role === "superadmin");
  const enclosureAdmins = users.filter((u) => u.role === "enclosure_admin");

  // Filtered audit logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchSearch =
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase());

      const matchAction = filterAction === "all" || log.actionType === filterAction;
      const matchAdmin = filterAdmin === "all" || String(log.userId) === filterAdmin;

      return matchSearch && matchAction && matchAdmin;
    });
  }, [auditLogs, searchTerm, filterAction, filterAdmin]);

  async function handleSave(data: UserFormData) {
    const isEditing = Boolean(modalState.user);
    const encNames = (data.enclosureIds || []).map((id) => {
      const found = enclosures.find((e) => e.id === id);
      return found ? found.name : id;
    });

    const body = {
      username: data.email.split("@")[0],
      email: data.email,
      password: data.password,
      name: data.name,
      role: data.role,
      enclosureId: data.enclosureId,
      enclosureIds: data.enclosureIds,
      is_active: data.status === "Activo",
    };

    if (API_BASE_URL && token) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin${isEditing ? `/${modalState.user!.id}` : "/create"}`, {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.message || "No se pudo guardar el usuario en la API.");

        const saved: ZooUser = {
          id: Number(result.id),
          name: result.name || data.name,
          email: result.email || data.email,
          role: result.role === "enclosure_admin" ? "enclosure_admin" : "superadmin",
          enclosureId: result.enclosureId ?? data.enclosureId,
          enclosureIds: data.enclosureIds,
          status: result.isActive === false ? "Inactivo" : "Activo",
        };

        setUsers(isEditing ? users.map((u) => (u.id === saved.id ? saved : u)) : [...users, saved]);
      } catch (error) {
        console.warn("API save error, applying local update:", error);
        applyLocalSave(data, isEditing);
      }
    } else {
      applyLocalSave(data, isEditing);
    }

    // Save audit log
    saveAuditLog({
      userId: currentUser.id || 1,
      userName: currentUser.name || "Super Administrador",
      userEmail: currentUser.email || "admin@zoomat.mx",
      userRole: "superadmin",
      assignedEnclosures: ["Todos los recintos"],
      actionType: data.role === "enclosure_admin" ? "ASIGNAR_RECINTO" : isEditing ? "ACTUALIZAR" : "CREAR",
      entityType: "administrador",
      entityName: data.name,
      enclosureName: encNames.join(", ") || "General",
      details: isEditing
        ? `Superadmin actualizó permisos de ${data.name}. Recintos asignados (${data.enclosureIds?.length || 0} de 3): ${
            encNames.join(", ") || "Ninguno"
          }`
        : `Superadmin creó al administrador ${data.name} y le asignó los recintos (${data.enclosureIds?.length || 0} de 3): ${
            encNames.join(", ") || "Ninguno"
          }`,
    });

    refreshLogs();
    setModalState({ open: false, user: null });
  }

  function applyLocalSave(data: UserFormData, isEditing: boolean) {
    if (isEditing && modalState.user) {
      const updated: ZooUser = {
        ...modalState.user,
        ...data,
      };
      setUsers(users.map((u) => (u.id === updated.id ? updated : u)));
    } else {
      const newId = Math.max(...users.map((u) => u.id), 0) + 1;
      const created: ZooUser = {
        id: newId,
        ...data,
      };
      setUsers([...users, created]);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    if (API_BASE_URL && token) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/${deleteTarget.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.message || "No se pudo eliminar el usuario.");
      } catch (error) {
        console.warn("API delete error, deleting locally:", error);
      }
    }

    setUsers(users.filter((user) => user.id !== deleteTarget.id));

    // Audit log
    saveAuditLog({
      userId: currentUser.id || 1,
      userName: currentUser.name || "Super Administrador",
      userEmail: currentUser.email || "admin@zoomat.mx",
      userRole: "superadmin",
      assignedEnclosures: ["Todos los recintos"],
      actionType: "ELIMINAR",
      entityType: "administrador",
      entityName: deleteTarget.name,
      details: `Superadmin revocó acceso y eliminó la cuenta del administrador ${deleteTarget.name} (${deleteTarget.email}).`,
    });

    refreshLogs();
    setDeleteTarget(null);
  }

  function getUserEnclosureObjects(user: ZooUser) {
    const ids =
      user.enclosureIds && user.enclosureIds.length > 0
        ? user.enclosureIds
        : user.enclosureId
        ? user.enclosureId.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

    return ids.map((id) => {
      const found = enclosures.find((e) => e.id === id);
      return found || { id, name: id, icon: "🏷️", color: "bg-emerald-700", description: "" };
    });
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Administradores</h1>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
              {users.length} usuarios registrados
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Gestión centralizada de superadministradores, asignación de 1 a 3 recintos y auditoría de cambios.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setModalState({ open: true, user: null })}
            className="bg-emerald-700 text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 hover:bg-emerald-800 transition-all font-bold text-sm shadow-md cursor-pointer hover:scale-102"
          >
            <Plus size={18} /> Invitar Admin
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === "users"
              ? "bg-emerald-800 text-white shadow-md"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <Building2 size={18} />
          <span>Administradores y Recintos</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-black ${
              activeTab === "users" ? "bg-emerald-700 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            {users.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab("audit");
            refreshLogs();
          }}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === "audit"
              ? "bg-emerald-800 text-white shadow-md"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <History size={18} />
          <span>Historial de Actualizaciones</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-black ${
              activeTab === "audit" ? "bg-emerald-700 text-white" : "bg-emerald-100 text-emerald-800"
            }`}
          >
            {auditLogs.length}
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Registro activo" />
        </button>
      </div>

      {/* TAB 1: USERS & RECIENTOS */}
      {activeTab === "users" && (
        <div className="space-y-8">
          {/* Super Admins */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={18} className="text-purple-600" />
              <h2 className="font-bold text-gray-700 uppercase text-xs tracking-wider">Super Administradores</h2>
              <span className="ml-auto text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                {superAdmins.length}
              </span>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs">
              <table className="w-full text-left">
                <tbody>
                  {superAdmins.map((user) => (
                    <tr key={user.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-base flex-shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{user.name}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                              <Mail size={12} /> {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                          <ShieldCheck size={13} /> Super Admin
                        </span>
                      </td>
                      <td className="p-4 text-xs text-gray-500 hidden md:table-cell">
                        Acceso total a todos los recintos, usuarios y configuraciones
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => setModalState({ open: true, user })}
                            className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
                            title="Editar permisos"
                          >
                            ✏️
                          </button>
                          {superAdmins.length > 1 && (
                            <button
                              onClick={() => setDeleteTarget(user)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                              title="Revocar acceso"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Enclosure Admins */}
          <section>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Building2 size={18} className="text-emerald-600" />
                <h2 className="font-bold text-gray-700 uppercase text-xs tracking-wider">
                  Administradores de Recinto (Acceso a 1 o 3 Recintos)
                </h2>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {enclosureAdmins.length}
                </span>
              </div>
              <p className="text-xs text-gray-500 hidden sm:block">
                Los superadministradores pueden otorgar acceso a <strong>1, 2 o hasta 3 recintos</strong>.
              </p>
            </div>

            {enclosureAdmins.length === 0 ? (
              <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-10 text-center text-gray-400 text-sm">
                No hay administradores de recinto registrados. Haz clic en <strong>+ Invitar Admin</strong> para agregar uno.
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider">
                      <th className="p-4 font-bold border-b border-gray-100">Administrador</th>
                      <th className="p-4 font-bold border-b border-gray-100">Recintos Asignados (1 a 3)</th>
                      <th className="p-4 font-bold border-b border-gray-100 hidden md:table-cell">Más visitado (mes)</th>
                      <th className="p-4 font-bold border-b border-gray-100 hidden md:table-cell">Menos visitado (mes)</th>
                      <th className="p-4 font-bold border-b border-gray-100 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enclosureAdmins.map((user) => {
                      const assignedEncs = getUserEnclosureObjects(user);
                      return (
                        <tr key={user.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base flex-shrink-0">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 text-sm">{user.name}</p>
                                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                  <Mail size={12} /> {user.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            {assignedEncs.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5 items-center">
                                {assignedEncs.map((enc) => (
                                  <span
                                    key={enc.id}
                                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full text-white shadow-xs ${enc.color}`}
                                    title={`Recinto asignado: ${enc.name}`}
                                  >
                                    <span>{enc.icon}</span>
                                    <span>{enc.name}</span>
                                  </span>
                                ))}
                                <span className="text-[10px] text-gray-400 font-semibold ml-1">
                                  ({assignedEncs.length}/3)
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400 italic bg-gray-100 px-2.5 py-1 rounded-full">
                                Sin recintos asignados
                              </span>
                            )}
                          </td>
                          <td className="p-4 hidden md:table-cell">
                            <span className="text-xs text-gray-400 italic">Sin datos</span>
                          </td>
                          <td className="p-4 hidden md:table-cell">
                            <span className="text-xs text-gray-400 italic">Sin datos</span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => setModalState({ open: true, user })}
                                className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
                                title="Editar recintos y permisos"
                              >
                                <span className="text-sm">✏️</span>
                              </button>
                              <button
                                onClick={() => setDeleteTarget(user)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                                title="Eliminar administrador"
                              >
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
        </div>
      )}

      {/* TAB 2: AUDIT & UPDATES HISTORY */}
      {activeTab === "audit" && (
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-emerald-950 text-white p-6 rounded-3xl shadow-lg border-2 border-emerald-900">
            <div>
              <div className="flex items-center gap-2.5">
                <History className="w-6 h-6 text-amber-300" />
                <h2 className="text-xl font-black text-white tracking-tight">
                  Historial de Actualizaciones de Administradores
                </h2>
              </div>
              <p className="text-emerald-200 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                Supervisión centralizada para el Superadministrador: visualiza todos los cambios que realizan los administradores con acceso a 1 o 3 recintos y descarga el reporte oficial auditado.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => exportAuditLogsToCSV(filteredAuditLogs)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-2xl flex items-center gap-2 font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer hover:scale-102"
                title="Descargar historial completo en formato compatible con Excel (.csv UTF-8)"
              >
                <Download size={16} className="text-amber-300" />
                <span>Descargar Documento (CSV)</span>
              </button>

              <button
                onClick={() => printAuditReport(filteredAuditLogs)}
                className="bg-amber-500 hover:bg-amber-400 text-emerald-950 px-4 py-2.5 rounded-2xl flex items-center gap-2 font-black text-xs sm:text-sm transition-all shadow-md cursor-pointer hover:scale-102"
                title="Imprimir o guardar reporte oficial en PDF"
              >
                <Printer size={16} />
                <span>Reporte Imprimible / PDF</span>
              </button>

              <button
                onClick={refreshLogs}
                className="p-2.5 bg-emerald-900 hover:bg-emerald-800 text-emerald-200 rounded-2xl transition-colors cursor-pointer"
                title="Recargar historial"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total de Cambios</p>
              <p className="text-2xl font-black text-emerald-950 mt-1">{auditLogs.length}</p>
              <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">Registros auditados</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Creaciones</p>
              <p className="text-2xl font-black text-emerald-700 mt-1">
                {auditLogs.filter((l) => l.actionType === "CREAR").length}
              </p>
              <p className="text-[11px] text-gray-500 font-medium mt-0.5">Nuevos registros</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Modificaciones</p>
              <p className="text-2xl font-black text-blue-700 mt-1">
                {auditLogs.filter((l) => l.actionType === "ACTUALIZAR").length}
              </p>
              <p className="text-[11px] text-gray-500 font-medium mt-0.5">Especies y recintos</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Asignaciones de Recintos</p>
              <p className="text-2xl font-black text-purple-700 mt-1">
                {auditLogs.filter((l) => l.actionType === "ASIGNAR_RECINTO").length}
              </p>
              <p className="text-[11px] text-purple-700 font-semibold mt-0.5">1 a 3 recintos otorgados</p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por administrador, especie o detalle del cambio..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 placeholder-gray-400"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                <option value="all">Todas las Acciones</option>
                <option value="CREAR">Creación (+)</option>
                <option value="ACTUALIZAR">Actualización (✏️)</option>
                <option value="ELIMINAR">Eliminación (🗑️)</option>
                <option value="ASIGNAR_RECINTO">Asignación de Recintos (🏷️)</option>
              </select>

              <select
                value={filterAdmin}
                onChange={(e) => setFilterAdmin(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                <option value="all">Todos los Administradores</option>
                {users.map((u) => (
                  <option key={u.id} value={String(u.id)}>
                    {u.name} ({u.role === "superadmin" ? "Super Admin" : "Admin Recinto"})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs">
            {filteredAuditLogs.length === 0 ? (
              <div className="p-12 text-center text-gray-400 space-y-2">
                <FileSpreadsheet className="w-10 h-10 mx-auto text-gray-300" />
                <p className="text-sm font-semibold text-gray-600">No se encontraron movimientos con los filtros seleccionados.</p>
                <p className="text-xs text-gray-400">Prueba ajustando la búsqueda o seleccionando todas las acciones.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/90 text-gray-500 text-xs uppercase tracking-wider">
                      <th className="p-4 font-bold border-b border-gray-100 whitespace-nowrap">Fecha / Hora</th>
                      <th className="p-4 font-bold border-b border-gray-100">Administrador</th>
                      <th className="p-4 font-bold border-b border-gray-100">Recintos a Cargo</th>
                      <th className="p-4 font-bold border-b border-gray-100 text-center">Acción</th>
                      <th className="p-4 font-bold border-b border-gray-100">Elemento Modificado</th>
                      <th className="p-4 font-bold border-b border-gray-100">Detalle de la Actualización</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAuditLogs.map((log) => {
                      const dateObj = new Date(log.timestamp);
                      const formattedDate = dateObj.toLocaleDateString("es-MX", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      });
                      const formattedTime = dateObj.toLocaleTimeString("es-MX", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      const actionBadge = (() => {
                        switch (log.actionType) {
                          case "CREAR":
                            return "bg-emerald-100 text-emerald-800 border-emerald-300";
                          case "ELIMINAR":
                            return "bg-red-100 text-red-800 border-red-300";
                          case "ASIGNAR_RECINTO":
                            return "bg-purple-100 text-purple-800 border-purple-300";
                          case "ACTUALIZAR":
                          default:
                            return "bg-blue-100 text-blue-800 border-blue-300";
                        }
                      })();

                      return (
                        <tr key={log.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
                          <td className="p-4 whitespace-nowrap">
                            <p className="text-xs font-bold text-gray-900">{formattedDate}</p>
                            <p className="text-[11px] text-gray-400 font-mono">{formattedTime}</p>
                          </td>

                          <td className="p-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center flex-shrink-0">
                                {log.userName.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-gray-900 truncate">{log.userName}</p>
                                <p className="text-[10px] text-gray-400 truncate">{log.userEmail}</p>
                              </div>
                            </div>
                          </td>

                          <td className="p-4">
                            <div className="flex flex-wrap gap-1">
                              {(log.assignedEnclosures || []).map((encName, idx) => (
                                <span
                                  key={idx}
                                  className="inline-block px-2 py-0.5 text-[11px] font-bold rounded-md bg-stone-100 text-stone-700 border border-stone-200"
                                >
                                  {encName}
                                </span>
                              ))}
                            </div>
                          </td>

                          <td className="p-4 text-center whitespace-nowrap">
                            <span className={`inline-block px-2.5 py-1 text-[11px] font-black rounded-full border ${actionBadge}`}>
                              {log.actionType}
                            </span>
                          </td>

                          <td className="p-4">
                            <p className="text-xs font-bold text-gray-900">{log.entityName}</p>
                            {log.enclosureName && (
                              <p className="text-[10px] text-emerald-700 font-semibold">{log.enclosureName}</p>
                            )}
                          </td>

                          <td className="p-4">
                            <p className="text-xs text-gray-700 max-w-md leading-relaxed">{log.details}</p>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODALS */}
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
