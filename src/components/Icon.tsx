import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Building2,
  CheckCircle2,
  Clock,
  Euro,
  Gauge,
  Globe,
  Layers,
  LineChart,
  type LucideIcon,
  Mail,
  MapPin,
  Megaphone,
  MonitorSmartphone,
  MousePointerClick,
  Phone,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

/**
 * Curated icon registry. Configs reference icons by string name so the data
 * stays serializable (safe to pass from server to client components).
 */
export const iconMap = {
  search: Search,
  target: Target,
  "trending-up": TrendingUp,
  rocket: Rocket,
  megaphone: Megaphone,
  click: MousePointerClick,
  "line-chart": LineChart,
  "bar-chart": BarChart3,
  gauge: Gauge,
  "shield-check": ShieldCheck,
  "badge-check": BadgeCheck,
  sparkles: Sparkles,
  zap: Zap,
  phone: Phone,
  mail: Mail,
  "map-pin": MapPin,
  users: Users,
  clock: Clock,
  check: CheckCircle2,
  "arrow-right": ArrowRight,
  globe: Globe,
  star: Star,
  building: Building2,
  store: Store,
  monitor: MonitorSmartphone,
  euro: Euro,
  trophy: Trophy,
  layers: Layers,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof iconMap;

export function Icon({
  name,
  className,
}: {
  name: IconName;
  className?: string;
}) {
  const Cmp = iconMap[name];
  return <Cmp className={className} aria-hidden="true" />;
}
