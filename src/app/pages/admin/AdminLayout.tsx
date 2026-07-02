import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router";
import { LayoutDashboard, Users, PawPrint, LogOut, Building2, ChevronDown, Home } from "lucide-react";
import { useZoo } from "../../context/ZooContext";

export function AdminLayout() {
  const location = useLocation();
  const { currentUser, setCurrentUser, users, enclosures } = useZoo();
  const [showUserPicker, setShowUserPicker] = useState(false);

  const isSuperAdmin = currentUser.role === "superadmin";
  const myEnclosure = enclosures.find((e) => e.id === currentUser.enclosureId);

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
      <aside className="w-full md:w-64 bg-emerald-950 text-white flex flex-col">
        {/* Brand */}
        <div className="p-6 border-b border-emerald-900">
          <h2 className="text-xl font-bold tracking-tight">ZooMAT</h2>
          <p className="text-emerald-400 text-xs mt-0.5 font-medium uppercase tracking-wider">Panel de Control</p>
        </div>

        {/* Enclosure badge (for enclosure admins) */}
        {!isSuperAdmin && myEnclosure && (
          <div className={`mx-4 mt-4 ${myEnclosure.color} rounded-xl p-3 flex items-center gap-2`}>
            <span className="text-2xl">{myEnclosure.icon}</span>
            <div>
              <p className="text-white font-bold text-sm leading-tight">{myEnclosure.name}</p>
              <p className="text-white/70 text-xs">Tu recinto</p>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = item.path === "/admin"
              ? location.pathname === "/admin"
              : location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors text-sm font-medium ${
                  isActive
                    ? "bg-emerald-700 text-white"
                    : "text-emerald-200 hover:bg-emerald-900 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User switcher (demo) */}
        <div className="p-4 border-t border-emerald-900 space-y-2">
          <div className="relative">
            <button
              onClick={() => setShowUserPicker((v) => !v)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-900 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{currentUser.name}</p>
                <p className="text-emerald-400 text-xs truncate">
                  {isSuperAdmin ? "Super Admin" : `Admin — ${myEnclosure?.name ?? "Sin recinto"}`}
                </p>
              </div>
              <ChevronDown size={16} className={`text-emerald-400 transition-transform flex-shrink-0 ${showUserPicker ? "rotate-180" : ""}`} />
            </button>

            {showUserPicker && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                <p className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  Cambiar usuario (demo)
                </p>
                {users.map((u) => {
                  const enc = enclosures.find((e) => e.id === u.enclosureId);
                  return (
                    <button
                      key={u.id}
                      onClick={() => { setCurrentUser(u); setShowUserPicker(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors ${
                        currentUser.id === u.id ? "bg-emerald-50" : ""
                      }`}
                    >
                      <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{u.name}</p>
                        <p className="text-xs text-gray-400 truncate">
                          {u.role === "superadmin" ? "Super Admin" : `${enc?.icon ?? ""} ${enc?.name ?? "Sin recinto"}`}
                        </p>
                      </div>
                      {currentUser.id === u.id && (
                        <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-emerald-200 hover:bg-emerald-900 hover:text-white transition-colors text-sm font-medium"
          >
            <LogOut size={18} />
            Volver al sitio
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
