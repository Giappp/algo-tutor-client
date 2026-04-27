// Maps iconKey strings (from API/DB) to actual Lucide icon components.
// Add entries here as new features/how-it-works items are added.
import {
  BookOpen,
  BrainCircuit,
  Braces,
  CheckCircle2,
  Code2,
  Cpu,
  GraduationCap,
  Layers,
  Lightbulb,
  ListOrdered,
  Map,
  MessageSquare,
  Network,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export const LUCIDE_ICON_MAP: Record<string, LucideIcon> = {
  BookOpen,
  BrainCircuit,
  Braces,
  CheckCircle2,
  Code2,
  Cpu,
  GraduationCap,
  Layers,
  Lightbulb,
  ListOrdered,
  Map,
  MessageSquare,
  Network,
  TrendingUp,
};

export function getIcon(key: string): LucideIcon {
  return LUCIDE_ICON_MAP[key] ?? Braces;
}

// Avatar gradient variants — cycles through these based on avatarColorIndex
export const AVATAR_GRADIENTS = [
  "from-primary to-[oklch(0.65_0.15_340)]",
  "from-[oklch(0.65_0.2_145)] to-primary",
  "from-[oklch(0.7_0.18_85)] to-[oklch(0.6_0.18_180)]",
  "from-[oklch(0.65_0.15_340)] to-[oklch(0.7_0.18_250)]",
];
