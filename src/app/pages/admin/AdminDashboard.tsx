import { useMemo, useState } from "react";
import { Download, Eye, PawPrint, Users, PieChart as PieIcon, BarChart2 } from "lucide-react";
import { Link } from "react-router";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useZoo } from "../../context/ZooContext";

type PeriodKey = "dia" | "semana" | "mes" | "anio";

const PERIODS: { key: PeriodKey; label: string; multiplier: number }[] = [
  { key: "dia", label: "Día", multiplier: 1 },
  { key: "semana", label: "Semana", multiplier: 7 },
  { key: "mes", label: "Mes", multiplier: 30 },
  { key: "anio", label: "Año", multiplier: 365 },
];

const COLORS_CATEGORY = ["#059669", "#0284c7", "#d97706", "#7c3aed", "#e11d48", "#475569"];
const COLORS_STATUS = ["#dc2626", "#f59e0b", "#10b981", "#6366f1"];
const COLORS_ENCLOSURE = ["#047857", "#0369a1", "#b45309", "#6d28d9", "#be123c", "#334155"];
const COLORS_VISITORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899"];

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

export function AdminDashboard() {
  const { animals, users, currentUser, enclosures } = useZoo();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>("mes");

  const scopedAnimals = useMemo(() => {
    if (currentUser.role === "superadmin") return animals;
    return animals.filter((a) => a.enclosureId === currentUser.enclosureId);
  }, [animals, currentUser.enclosureId, currentUser.role]);

  const periodMeta = PERIODS.find((p) => p.key === selectedPeriod) ?? PERIODS[2];

  const ranking = useMemo(() => {
    return scopedAnimals
      .map((a) => ({
        ...a,
        visitors: estimatedDailyVisits(a.id, a.category) * periodMeta.multiplier,
      }))
      .sort((a, b) => b.visitors - a.visitors);
  }, [periodMeta.multiplier, scopedAnimals]);

  const mostVisited = ranking.slice(0, 3);
  const leastVisited = [...ranking].reverse().slice(0, 3).reverse();

  const totalsByPeriod = useMemo(() => {
    const dailyTotal = scopedAnimals.reduce((sum, a) => sum + estimatedDailyVisits(a.id, a.category), 0);
    return PERIODS.map((p) => ({
      key: p.key,
      label: p.label,
      total: dailyTotal * p.multiplier,
    }));
  }, [scopedAnimals]);

  // Data for Pie Charts (Gráficas de Pastel)
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    scopedAnimals.forEach((a) => {
      counts[a.category] = (counts[a.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [scopedAnimals]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    scopedAnimals.forEach((a) => {
      counts[a.status] = (counts[a.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [scopedAnimals]);

  const enclosureData = useMemo(() => {
    const counts: Record<string, number> = {};
    scopedAnimals.forEach((a) => {
      const enc = enclosures.find((e) => e.id === a.enclosureId)?.name || "General";
      counts[enc] = (counts[enc] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [enclosures, scopedAnimals]);

  const visitorCategoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    scopedAnimals.forEach((a) => {
      const visits = estimatedDailyVisits(a.id, a.category) * periodMeta.multiplier;
      counts[a.category] = (counts[a.category] || 0) + visits;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [periodMeta.multiplier, scopedAnimals]);

  function downloadExcelReport() {
    if (currentUser.role !== "superadmin") return;
    const rows = animals.map((a) => {
      const enclosure = enclosures.find((e) => e.id === a.enclosureId);
      const daily = estimatedDailyVisits(a.id, a.category);
      const weekly = daily * 7;
      const monthly = daily * 30;
      const yearly = daily * 365;
      return [
        a.id,
        a.name,
        a.scientificName,
        a.category,
        enclosure?.name ?? "Sin recinto",
        daily,
        weekly,
        monthly,
        yearly,
      ];
    });

    const header = [
      "ID",
      "Animal",
      "Nombre Cientifico",
      "Categoria",
      "Recinto",
      "Visitantes por Dia",
      "Visitantes por Semana",
      "Visitantes por Mes",
      "Visitantes por Anio",
    ];

    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n");

    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte-visitas-animales-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  const enclosureAdmins = users.filter((u) => u.role === "enclosure_admin");

  return (
    <div className="space-y-8">
      {/* Header Dashboard */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Dashboard ZooMAT</h1>
          <p className="text-sm text-gray-600 font-medium mt-1">
            {currentUser.role === "superadmin"
              ? "Resumen de visitas y métricas estadísticas por especie y recinto"
              : "Resumen de visitas de tus especies en tu recinto"}
          </p>
        </div>
        {currentUser.role === "superadmin" && (
          <button
            onClick={downloadExcelReport}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-800 text-white text-sm font-bold hover:bg-emerald-900 transition-all shadow-md hover:scale-105"
          >
            <Download size={18} /> Descargar Reporte (.csv)
          </button>
        )}
      </div>

      {/* Period Selection */}
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-4 flex flex-wrap items-center gap-3">
        <span className="text-xs font-black uppercase text-emerald-800 tracking-wider mr-2">Filtrar periodo:</span>
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setSelectedPeriod(p.key)}
            className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all ${
              selectedPeriod === p.key ? "bg-emerald-800 text-white shadow-md" : "bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-emerald-100 flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center shrink-0">
            <PawPrint size={28} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Especies registradas</p>
            <p className="text-3xl font-black text-emerald-950 mt-0.5">{scopedAnimals.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-emerald-100 flex items-center gap-5">
          <div className="w-14 h-14 bg-sky-100 text-sky-800 rounded-2xl flex items-center justify-center shrink-0">
            <Users size={28} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Administradores</p>
            <p className="text-3xl font-black text-sky-950 mt-0.5">{currentUser.role === "superadmin" ? enclosureAdmins.length : 1}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-emerald-100 flex items-center gap-5">
          <div className="w-14 h-14 bg-purple-100 text-purple-800 rounded-2xl flex items-center justify-center shrink-0">
            <Eye size={28} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Visitantes ({periodMeta.label})</p>
            <p className="text-3xl font-black text-purple-950 mt-0.5">{totalsByPeriod.find((p) => p.key === selectedPeriod)?.total.toLocaleString("es-MX") ?? 0}</p>
          </div>
        </div>
      </div>

      {/* SECCIÓN DE GRÁFICAS DE PASTEL (PIE CHARTS) */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b-2 border-emerald-100 pb-3">
          <PieIcon className="w-7 h-7 text-emerald-700" />
          <h2 className="text-2xl font-black text-emerald-950">Gráficas de Pastel - Análisis de Especies y Visitas</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gráfica 1: Distribución de Especies por Categoría */}
          <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-emerald-100 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-black text-emerald-950 mb-1">Especies por Categoría</h3>
              <p className="text-xs text-gray-500 font-medium mb-4">Proporción de fauna por grupo taxonómico (Mamíferos, Aves, Reptiles, Anfibios)</p>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    innerRadius={45}
                    dataKey="value"
                    paddingAngle={3}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_CATEGORY[index % COLORS_CATEGORY.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number) => [`${val} especies`, "Cantidad"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfica 2: Distribución por Estado de Conservación */}
          <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-emerald-100 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-black text-emerald-950 mb-1">Estado de Conservación</h3>
              <p className="text-xs text-gray-500 font-medium mb-4">Distribución por estatus de riesgo y protección (NOM-059)</p>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    innerRadius={45}
                    dataKey="value"
                    paddingAngle={3}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_STATUS[index % COLORS_STATUS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number) => [`${val} especies`, "Especies"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfica 3: Distribución por Recintos */}
          <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-emerald-100 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-black text-emerald-950 mb-1">Especies por Recinto / Zona</h3>
              <p className="text-xs text-gray-500 font-medium mb-4">Proporción de animales albergados en cada recinto del parque</p>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={enclosureData}
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    innerRadius={40}
                    dataKey="value"
                    paddingAngle={3}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {enclosureData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_ENCLOSURE[index % COLORS_ENCLOSURE.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number) => [`${val} especies`, "Especies"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfica 4: Porcentaje de Visitantes por Categoría */}
          <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-emerald-100 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-black text-emerald-950 mb-1">Afluencia Estimada por Categoría ({periodMeta.label})</h3>
              <p className="text-xs text-gray-500 font-medium mb-4">Interés y volumen de interacción del público según tipo de fauna</p>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={visitorCategoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    innerRadius={45}
                    dataKey="value"
                    paddingAngle={3}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {visitorCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_VISITORS[index % COLORS_VISITORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number) => [`${val.toLocaleString("es-MX")} personas`, "Visitantes"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Rankings de Visitas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
          <h2 className="text-lg font-black text-emerald-950 mb-4 flex items-center gap-2">
            <span>🔥 Especies más visitadas</span> ({periodMeta.label})
          </h2>
          <div className="space-y-3">
            {mostVisited.length === 0 ? (
              <p className="text-sm text-gray-500">No hay animales para mostrar.</p>
            ) : (
              mostVisited.map((item, idx) => (
                <div key={item.id} className="flex items-center justify-between border border-emerald-100 rounded-xl px-4 py-3 bg-emerald-50/50">
                  <p className="text-sm font-bold text-gray-900">{idx + 1}. {item.name}</p>
                  <p className="text-sm font-black text-emerald-800">{item.visitors.toLocaleString("es-MX")} visitantes</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
          <h2 className="text-lg font-black text-emerald-950 mb-4 flex items-center gap-2">
            <span>📉 Especies menos visitadas</span> ({periodMeta.label})
          </h2>
          <div className="space-y-3">
            {leastVisited.length === 0 ? (
              <p className="text-sm text-gray-500">No hay animales para mostrar.</p>
            ) : (
              leastVisited.map((item, idx) => (
                <div key={item.id} className="flex items-center justify-between border border-rose-100 rounded-xl px-4 py-3 bg-rose-50/50">
                  <p className="text-sm font-bold text-gray-900">{idx + 1}. {item.name}</p>
                  <p className="text-sm font-black text-rose-700">{item.visitors.toLocaleString("es-MX")} visitantes</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
          <h2 className="text-lg font-black text-emerald-950 mb-4">Acciones Rápidas</h2>
          <div className="flex flex-col gap-3">
            <Link to="/admin/animales" className="w-full bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-xl flex items-center justify-between hover:bg-emerald-100 transition-colors font-bold">
              <span>Gestionar especies y códigos QR</span>
              <PawPrint size={20} />
            </Link>
            {currentUser.role === "superadmin" && (
              <Link to="/admin/usuarios" className="w-full bg-sky-50 border border-sky-200 text-sky-900 p-4 rounded-xl flex items-center justify-between hover:bg-sky-100 transition-colors font-bold">
                <span>Gestionar usuarios administradores</span>
                <Users size={20} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
