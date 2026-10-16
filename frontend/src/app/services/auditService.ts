import { AdminAuditLog, AuditActionType } from "../data/zooStore";

const STORAGE_KEY = "zoomat_admin_audit_logs_v1";
const API_BASE_URL = ((import.meta.env.VITE_API_BASE_URL as string | undefined) || "").replace(/\/$/, "");

export const SEED_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: "log-1",
    timestamp: "2026-10-15T22:30:00.000Z",
    userId: 3,
    userName: "Jesús dom5",
    userEmail: "Vader8983@gmail.com",
    userRole: "enclosure_admin",
    assignedEnclosures: ["Felinos", "Vivario"],
    actionType: "ACTUALIZAR",
    entityType: "especie",
    entityName: "Jaguar (Panthera onca)",
    enclosureName: "Felinos",
    details: "Actualizó ficha técnica, dieta enriquecida y nuevo enlace de audioguía para exhibidor.",
  },
  {
    id: "log-2",
    timestamp: "2026-10-15T21:15:00.000Z",
    userId: 1,
    userName: "sergiodominguezmijares27",
    userEmail: "sergiodominguezmijares27@gmail.com",
    userRole: "superadmin",
    assignedEnclosures: ["Todos los recintos"],
    actionType: "ASIGNAR_RECINTO",
    entityType: "administrador",
    entityName: "Jesús dom5",
    enclosureName: "Felinos y Vivario",
    details: "Asignó acceso administrativo múltiple a los recintos: Felinos y Vivario (2 de 3 permitidos).",
  },
  {
    id: "log-3",
    timestamp: "2026-10-15T19:40:00.000Z",
    userId: 3,
    userName: "Jesús dom5",
    userEmail: "Vader8983@gmail.com",
    userRole: "enclosure_admin",
    assignedEnclosures: ["Felinos"],
    actionType: "ACTUALIZAR",
    entityType: "especie",
    entityName: "Ocelote (Leopardus pardalis)",
    enclosureName: "Felinos",
    details: "Modificó estatus de conservación a 'Protegida Especial' y ajustó notas de actividad crepuscular.",
  },
  {
    id: "log-4",
    timestamp: "2026-10-15T18:05:00.000Z",
    userId: 2,
    userName: "emmaxing51@gmail.com",
    userEmail: "emmaxing51@gmail.com",
    userRole: "superadmin",
    assignedEnclosures: ["Todos los recintos"],
    actionType: "CREAR",
    entityType: "especie",
    entityName: "Quetzal (Pharomachrus mocinno)",
    enclosureName: "Aviario",
    details: "Registró nueva especie en el catálogo con imagen oficial, taxonomía completa y código QR de recorrido.",
  },
  {
    id: "log-5",
    timestamp: "2026-10-15T15:20:00.000Z",
    userId: 3,
    userName: "Jesús dom5",
    userEmail: "Vader8983@gmail.com",
    userRole: "enclosure_admin",
    assignedEnclosures: ["Felinos"],
    actionType: "ACTUALIZAR",
    entityType: "especie",
    entityName: "Puma (Puma concolor)",
    enclosureName: "Felinos",
    details: "Actualizó descripción pedagógica en español e inglés y comprobó reproducción de audio en sitio.",
  },
  {
    id: "log-6",
    timestamp: "2026-10-14T17:10:00.000Z",
    userId: 1,
    userName: "sergiodominguezmijares27",
    userEmail: "sergiodominguezmijares27@gmail.com",
    userRole: "superadmin",
    assignedEnclosures: ["Todos los recintos"],
    actionType: "ACTUALIZAR",
    entityType: "recinto",
    entityName: "Recinto Felinos",
    enclosureName: "Felinos",
    details: "Actualizó descripción general del sendero de felinos y verificó señalética interactiva.",
  },
];

export function getStoredAuditLogs(): AdminAuditLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_AUDIT_LOGS));
      return SEED_AUDIT_LOGS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error("Error reading audit logs from localStorage:", err);
  }
  return SEED_AUDIT_LOGS;
}

export function saveAuditLog(entry: Omit<AdminAuditLog, "id" | "timestamp"> & { timestamp?: string }): AdminAuditLog {
  const newLog: AdminAuditLog = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: entry.timestamp || new Date().toISOString(),
    ...entry,
  };

  try {
    const current = getStoredAuditLogs();
    const updated = [newLog, ...current];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Error saving audit log:", err);
  }

  // Also try sending to backend if token and endpoint exist
  if (API_BASE_URL) {
    const token = sessionStorage.getItem("pro-zoo-admin-token");
    if (token) {
      fetch(`${API_BASE_URL}/api/admin/audit-logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(newLog),
      }).catch(() => {
        // Ignored in offline/fallback mode
      });
    }
  }

  return newLog;
}

export function exportAuditLogsToCSV(logs: AdminAuditLog[], filename = "historial_actualizaciones_zoomat.csv") {
  const headers = [
    "ID",
    "Fecha y Hora",
    "Administrador",
    "Correo Electrónico",
    "Rol",
    "Recintos Asignados",
    "Acción Realizada",
    "Tipo de Entidad",
    "Elemento Afectado",
    "Recinto Asociado",
    "Detalle de la Actualización",
  ];

  const escapeCSV = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = logs.map((log) => {
    const formattedDate = new Date(log.timestamp).toLocaleString("es-MX", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const enclosuresStr = Array.isArray(log.assignedEnclosures)
      ? log.assignedEnclosures.join(" | ")
      : log.assignedEnclosures || "Sin recintos";

    return [
      escapeCSV(log.id),
      escapeCSV(formattedDate),
      escapeCSV(log.userName),
      escapeCSV(log.userEmail),
      escapeCSV(log.userRole === "superadmin" ? "Super Administrador" : "Administrador de Recinto"),
      escapeCSV(enclosuresStr),
      escapeCSV(log.actionType),
      escapeCSV(log.entityType),
      escapeCSV(log.entityName),
      escapeCSV(log.enclosureName || "General"),
      escapeCSV(log.details),
    ].join(",");
  });

  // UTF-8 BOM so Excel opens accented characters like ñ and tildes properly
  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printAuditReport(logs: AdminAuditLog[]) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Por favor permite las ventanas emergentes para generar el reporte imprimible.");
    return;
  }

  const currentDate = new Date().toLocaleString("es-MX", {
    dateStyle: "full",
    timeStyle: "medium",
  });

  const rowsHtml = logs
    .map(
      (log) => `
      <tr>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb; font-size: 11px; white-space: nowrap;">
          ${new Date(log.timestamp).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" })}
        </td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb; font-size: 11px;">
          <strong>${log.userName}</strong><br/>
          <span style="color: #6b7280; font-size: 10px;">${log.userEmail}</span>
        </td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb; font-size: 11px;">
          <span style="background: #ecfdf5; color: #065f46; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 10px;">
            ${(log.assignedEnclosures || []).join(", ") || "General"}
          </span>
        </td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb; font-size: 11px; text-align: center;">
          <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-weight: bold; font-size: 10px; ${
            log.actionType === "CREAR"
              ? "background: #dcfce7; color: #15803d;"
              : log.actionType === "ELIMINAR"
              ? "background: #fee2e2; color: #b91c1c;"
              : log.actionType === "ASIGNAR_RECINTO"
              ? "background: #f3e8ff; color: #7e22ce;"
              : "background: #e0f2fe; color: #0369a1;"
          }">
            ${log.actionType}
          </span>
        </td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb; font-size: 11px; font-weight: 600;">
          ${log.entityName}
        </td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb; font-size: 11px; color: #374151;">
          ${log.details}
        </td>
      </tr>
    `
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8"/>
      <title>Reporte Oficial de Auditoría e Historial - ZooMAT</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 30px; color: #111827; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #065f46; padding-bottom: 16px; margin-bottom: 20px; }
        .logo-title h1 { margin: 0; font-size: 22px; color: #065f46; }
        .logo-title p { margin: 3px 0 0; color: #6b7280; font-size: 12px; }
        .meta { text-align: right; font-size: 11px; color: #4b5563; }
        .kpi-row { display: flex; gap: 15px; margin-bottom: 20px; }
        .kpi-box { flex: 1; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 14px; }
        .kpi-box .val { font-size: 18px; font-weight: bold; color: #065f46; }
        .kpi-box .lbl { font-size: 10px; text-transform: uppercase; color: #6b7280; font-weight: 600; }
        table { width: 100%; border-collapse: collapse; text-align: left; margin-bottom: 30px; }
        th { background: #064e3b; color: white; padding: 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
        @media print {
          button { display: none; }
          body { margin: 10mm; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo-title">
          <h1>Zoológico Regional Miguel Álvarez del Toro (ZooMAT)</h1>
          <p>Auditoría Oficial y Registro de Actualizaciones de Administradores</p>
        </div>
        <div class="meta">
          <div><strong>Fecha de emisión:</strong> ${currentDate}</div>
          <div><strong>Total de registros:</strong> ${logs.length} movimientos</div>
        </div>
      </div>

      <div class="kpi-row">
        <div class="kpi-box">
          <div class="val">${logs.length}</div>
          <div class="lbl">Movimientos Registrados</div>
        </div>
        <div class="kpi-box">
          <div class="val">${logs.filter((l) => l.actionType === "CREAR").length}</div>
          <div class="lbl">Creaciones</div>
        </div>
        <div class="kpi-box">
          <div class="val">${logs.filter((l) => l.actionType === "ACTUALIZAR").length}</div>
          <div class="lbl">Modificaciones</div>
        </div>
        <div class="kpi-box">
          <div class="val">${logs.filter((l) => l.actionType === "ASIGNAR_RECINTO").length}</div>
          <div class="lbl">Asignaciones de Recintos</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Administrador</th>
            <th>Recintos</th>
            <th style="text-align: center;">Acción</th>
            <th>Elemento / Especie</th>
            <th>Detalle del Cambio</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div style="margin-top: 40px; border-top: 1px dashed #9ca3af; padding-top: 15px; font-size: 10px; color: #6b7280; display: flex; justify-content: space-between;">
        <div>Documento de supervisión generado por el Sistema de Administración Central ZooMAT.</div>
        <div>Página 1 de 1</div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() { window.print(); }, 400);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
