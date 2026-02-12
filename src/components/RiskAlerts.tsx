import { RiskAlert } from '@/lib/financial-engine';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

const iconMap = {
  critical: AlertTriangle,
  warning: AlertCircle,
  info: Info,
};

const styleMap = {
  critical: 'border-destructive/30 bg-destructive/10 text-destructive',
  warning: 'border-warning/30 bg-warning/10 text-warning',
  info: 'border-info/30 bg-info/10 text-info',
};

export default function RiskAlerts({ alerts }: { alerts: RiskAlert[] }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Risk Alerts</h3>
      {alerts.map((alert, i) => {
        const Icon = iconMap[alert.type];
        return (
          <div key={i} className={`flex items-start gap-3 rounded-xl border p-4 ${styleMap[alert.type]}`}>
            <Icon className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-sm">{alert.title}</p>
              <p className="text-xs opacity-80 mt-1">{alert.message}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
