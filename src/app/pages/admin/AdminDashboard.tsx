import { useMemo, useState } from "react";
import { Download, Eye, PawPrint, Users } from "lucide-react";
import { Link } from "react-router";
import { useZoo } from "../../context/ZooContext";

type PeriodKey = "dia" | "semana" | "mes" | "anio";

const PERIODS: { key: PeriodKey; label: string; multiplier: number }[] = [
  { key: "dia", label: "Día", multiplier: 1 },
  { key: "semana", label: "Semana", multiplier: 7 },
  { key: "mes", label: "Mes", multiplier: 30 },
  { key: "anio", label: "Año", multiplier: 365 },
];

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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            {currentUser.role === "superadmin"
              ? "Resumen de visitas por especie"
              : "Resumen de visitas de tus especies en tu recinto"}
          </p>
        </div>
        {currentUser.role === "superadmin" && (
          <button
            onClick={downloadExcelReport}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 text-white text-sm font-bold hover:bg-emerald-800 transition-colors"
          >
            <Download size={16} /> Descargar Excel (.csv)
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-2">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setSelectedPeriod(p.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              selectedPeriod === p.key ? "bg-emerald-700 text-white" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 text-green-700 rounded-lg flex items-center justify-center">
            <PawPrint size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Especies en alcance</p>
            <p className="text-2xl font-bold text-gray-900">{scopedAnimals.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Administradores</p>
            <p className="text-2xl font-bold text-gray-900">{currentUser.role === "superadmin" ? enclosureAdmins.length : 1}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center">
            <Eye size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Visitantes ({periodMeta.label})</p>
            <p className="text-2xl font-bold text-gray-900">{totalsByPeriod.find((p) => p.key === selectedPeriod)?.total.toLocaleString("es-MX") ?? 0}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Más visitados ({periodMeta.label})</h2>
          <div className="space-y-3">
            {mostVisited.length === 0 ? (
              <p className="text-sm text-gray-500">No hay animales para mostrar.</p>
            ) : (
              mostVisited.map((item, idx) => (
                <div key={item.id} className="flex items-center justify-between border border-gray-100 rounded-lg px-3 py-2.5">
                  <p className="text-sm font-medium text-gray-800">{idx + 1}. {item.name}</p>
                  <p className="text-sm font-bold text-emerald-700">{item.visitors.toLocaleString("es-MX")} visitantes</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Menos visitados ({periodMeta.label})</h2>
          <div className="space-y-3">
            {leastVisited.length === 0 ? (
              <p className="text-sm text-gray-500">No hay animales para mostrar.</p>
            ) : (
              leastVisited.map((item, idx) => (
                <div key={item.id} className="flex items-center justify-between border border-gray-100 rounded-lg px-3 py-2.5">
                  <p className="text-sm font-medium text-gray-800">{idx + 1}. {item.name}</p>
                  <p className="text-sm font-bold text-rose-700">{item.visitors.toLocaleString("es-MX")} visitantes</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {currentUser.role === "superadmin" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Visitantes totales por periodo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {totalsByPeriod.map((p) => (
              <div key={p.key} className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                <p className="text-xs uppercase text-gray-500 font-semibold">{p.label}</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{p.total.toLocaleString("es-MX")}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="flex flex-col gap-3">
            <Link to="/admin/animales" className="w-full bg-green-50 text-green-700 p-4 rounded-lg flex items-center justify-between hover:bg-green-100 transition-colors">
              <span className="font-medium">Gestionar especies</span>
              <PawPrint size={20} />
            </Link>
            {currentUser.role === "superadmin" && (
              <Link to="/admin/usuarios" className="w-full bg-blue-50 text-blue-700 p-4 rounded-lg flex items-center justify-between hover:bg-blue-100 transition-colors">
                <span className="font-medium">Gestionar administradores</span>
                <Users size={20} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
