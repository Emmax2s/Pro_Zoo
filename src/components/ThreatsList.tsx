import React from 'react';
import { AlertTriangle, AlertCircle, Zap } from 'lucide-react';

interface Threat {
  threat: string;
  severity: 'baja' | 'media' | 'alta' | 'crítica';
}

const SEVERITY_CONFIG = {
  baja: {
    label: 'Baja',
    icon: AlertCircle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-300',
    textColor: 'text-yellow-700',
    badgeColor: 'bg-yellow-100 text-yellow-800',
  },
  media: {
    label: 'Media',
    icon: AlertTriangle,
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-300',
    textColor: 'text-orange-700',
    badgeColor: 'bg-orange-100 text-orange-800',
  },
  alta: {
    label: 'Alta',
    icon: AlertTriangle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300',
    textColor: 'text-red-700',
    badgeColor: 'bg-red-100 text-red-800',
  },
  crítica: {
    label: 'Crítica',
    icon: Zap,
    bgColor: 'bg-red-100',
    borderColor: 'border-red-500',
    textColor: 'text-red-800',
    badgeColor: 'bg-red-600 text-white',
  },
};

interface ThreatsListProps {
  threats?: Threat[];
  className?: string;
}

export const ThreatsList: React.FC<ThreatsListProps> = ({ threats = [], className = '' }) => {
  if (!threats || threats.length === 0) {
    return null;
  }

  // Sort threats by severity
  const sortedThreats = [...threats].sort((a, b) => {
    const severityOrder = { crítica: 0, alta: 1, media: 2, baja: 3 };
    return severityOrder[a.severity as keyof typeof severityOrder] -
           severityOrder[b.severity as keyof typeof severityOrder];
  });

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800">Amenazas Principales</h3>

      <div className="grid gap-3 sm:grid-cols-2">
        {sortedThreats.map((threat, index) => {
          const config = SEVERITY_CONFIG[threat.severity];
          const IconComponent = config.icon;

          return (
            <div
              key={index}
              className={`${config.bgColor} border-l-4 ${config.borderColor} rounded-lg p-4`}
            >
              <div className="flex items-start gap-3">
                <IconComponent className={`w-5 h-5 ${config.textColor} flex-shrink-0 mt-0.5`} />
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${config.textColor} break-words`}>
                    {threat.threat}
                  </p>
                  <span className={`inline-block mt-2 text-xs font-semibold px-2 py-1 rounded ${config.badgeColor}`}>
                    Severidad: {config.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Severity Legend */}
      <div className="bg-gray-100 rounded-lg p-4 mt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Niveles de Severidad</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {Object.entries(SEVERITY_CONFIG).map(([key, config]) => (
            <div key={key} className={`${config.badgeColor} rounded px-2 py-1 text-center font-semibold`}>
              {config.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
