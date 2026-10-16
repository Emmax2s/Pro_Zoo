import { useEffect, useState } from "react";
import { Outlet, Link, useLocation } from "react-router";
import { Navigate } from "react-router";
import { LayoutDashboard, Users, PawPrint, LogOut, Building2, ChevronDown, Home } from "lucide-react";
import { useZoo } from "../../context/ZooContext";
import { useAuth } from "../../context/AuthContext";
import logoZoomat from "../../../assets/logo-zoomat.png";

export function AdminLayout() {
  const location = useLocation();
  const { user: authUser, loading: authLoading, logout } = useAuth();
  const { currentUser, setCurrentUser, users, enclosures } = useZoo();
  const [showUserPicker, setShowUserPicker] = useState(false);

  useEffect(() => {
    if (authUser) {
      const encIds = authUser.enclosureIds && authUser.enclosureIds.length > 0
        ? authUser.enclosureIds
        : authUser.enclosureId
        ? authUser.enclosureId.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

      setCurrentUser({
        id: authUser.id,
        name: authUser.name,
        email: authUser.email,
        role: authUser.role === "enclosure_admin" ? "enclosure_admin" : "superadmin",
        enclosureId: authUser.enclosureId,
        enclosureIds: encIds,
        status: authUser.isActive ? "Activo" : "Inactivo",
      });
    }
  }, [authUser, setCurrentUser]);

  if (authLoading) return <div className="min-h-screen grid place-items-center">Cargando sesión...</div>;
  if (!authUser) return <Navigate to="/login" state={{ from: location.pathname }} replace />;

  const isSuperAdmin = currentUser.role === "superadmin";

  const userEnclosureIds = currentUser.enclosureIds && currentUser.enclosureIds.length > 0
    ? currentUser.enclosureIds
    : currentUser.enclosureId
    ? currentUser.enclosureId.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
  const myEnclosures = enclosures.filter((e) => userEnclosureIds.includes(e.id));
  const myEnclosure = myEnclosures[0] || null;

  const superAdminMenu = [
    { path: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/inicio", icon: Home, label: "Inicio / Carrusel" },
    { path: "/admin/recintos", icon: Building2, label: "Recintos" },
    { path: "/admin/animales", icon: PawPrint, label: "Especies" },
    { path: "/admin/usuarios", icon: Users, label: "Administradores" },
  ];

  const enclosureAdminMenu = [
    { path: "/admin/animales", icon: PawPrint, label: "Mis Especies" },
  ];

  const menuItems = isSuperAdmin ? superAdminMenu : enclosureAdminMenu;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-emerald-950 text-white flex flex-col border-r-2 border-emerald-900 shadow-xl">
        {/* Brand */}
        <div className="p-6 border-b border-emerald-900 flex items-center gap-4">
          <img
            src={logoZoomat}
            alt="Logo Oficial ZooMAT"
            className="w-12 h-12 rounded-full object-contain bg-white p-1 shadow-md border-2 border-emerald-400"
          />
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white leading-tight">ZooMAT</h2>
            <p className="text-amber-400 text-xs font-black uppercase tracking-wider mt-0.5">Panel de Control</p>
          </div>
        </div>

        {/* Enclosure badges (for enclosure admins: 1 to 3 recintos) */}
        {!isSuperAdmin && myEnclosures.length > 0 && (
          <div className="mx-4 mt-4 space-y-2">
            <p className="text-[10px] text-amber-300 font-bold uppercase tracking-wider px-1">
              Recintos Asignados ({myEnclosures.length} de 3):
            </p>
            {myEnclosures.map((enc) => (
              <div
                key={enc.id}
                className={`${enc.color} rounded-2xl p-3 flex items-center gap-3 shadow-md border border-white/20`}
              >
                <span className="text-2xl">{enc.icon}</span>
                <div className="min-w-0">
                  <p className="text-white font-black text-sm leading-tight truncate">{enc.name}</p>
                  <p className="text-white/80 text-[10px] font-bold uppercase tracking-wider">Recinto asignado</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const isActive = item.path === "/admin"
              ? location.pathname === "/admin"
              : location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3.5 px-5 py-3.5 rounded-2xl transition-all text-base font-bold ${
                  isActive
                    ? "bg-emerald-700 text-white shadow-md border border-emerald-500"
                    : "text-emerald-100 hover:bg-emerald-900/80 hover:text-white"
                }`}
              >
                <Icon size={20} className={isActive ? "text-amber-300" : "text-emerald-300"} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User switcher */}
        <div className="p-4 border-t border-emerald-900 space-y-3">
          <div className="relative">
            <button
              onClick={() => setShowUserPicker((v) => !v)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-900/60 hover:bg-emerald-900 transition-all border border-emerald-800 text-left"
            >
              <div className="w-10 h-10 rounded-full bg-amber-400 text-emerald-950 flex items-center justify-center font-black text-base flex-shrink-0 shadow-sm">
                {currentUser.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-base font-bold truncate">{currentUser.name}</p>
                <p className="text-amber-300 text-xs font-semibold truncate">
                  {isSuperAdmin
                    ? "Super Administrador"
                    : myEnclosures.length > 0
                    ? `Admin — ${myEnclosures.map((e) => e.name).join(", ")}`
                    : `Admin — ${myEnclosure?.name ?? "Sin recinto"}`}
                </p>
              </div>
              <ChevronDown size={18} className={`text-amber-300 transition-transform flex-shrink-0 ${showUserPicker ? "rotate-180" : ""}`} />
            </button>

            {showUserPicker && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-2xl shadow-2xl border-2 border-emerald-200 overflow-hidden z-50">
                <p className="px-4 py-3 text-xs font-black text-emerald-900 uppercase tracking-wider bg-emerald-50 border-b border-emerald-100">
                  Seleccionar usuario
                </p>
                {users.map((u) => {
                  const uEncIds = u.enclosureIds && u.enclosureIds.length > 0
                    ? u.enclosureIds
                    : u.enclosureId
                    ? u.enclosureId.split(",").map((s) => s.trim()).filter(Boolean)
                    : [];
                  const uEncs = enclosures.filter((e) => uEncIds.includes(e.id));
                  return (
                    <button
                      key={u.id}
                      onClick={() => { setCurrentUser(u); setShowUserPicker(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-emerald-50 transition-colors border-b border-stone-100 ${
                        currentUser.id === u.id ? "bg-emerald-100/60 font-bold" : ""
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-black text-sm flex-shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold text-stone-900 truncate">{u.name}</p>
                        <p className="text-xs text-emerald-700 font-semibold truncate">
                          {u.role === "superadmin"
                            ? "Super Admin"
                            : uEncs.length > 0
                            ? uEncs.map((e) => `${e.icon || ""} ${e.name}`).join(", ")
                            : "Sin recinto"}
                        </p>
                      </div>
                      {currentUser.id === u.id && (
                        <span className="ml-auto w-2.5 h-2.5 rounded-full bg-emerald-600 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-emerald-100 hover:bg-emerald-900 hover:text-amber-300 transition-colors text-base font-bold"
          >
            <LogOut size={20} />
            Volver al Sitio Público
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-200 hover:bg-red-950 transition-colors text-base font-bold"
          >
            <LogOut size={20} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
