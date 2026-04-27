import {
  BookOpen,
  BrainCircuit,
  Braces,
  Cpu,
  GraduationCap,
  Layers,
  Lightbulb,
  ListOrdered,
  Map,
  MessageSquare,
  Network,
  Star,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * LucideIcons — maps iconKey strings (stored in DB / API) to actual
 * Lucide React components. Keeping this in one place makes it easy to
 * add or change icons without touching component code.
 *
 * BACKEND NOTE: The iconKey field in the Feature DB row must match a
 * key in this map. If a key is missing, the component falls back to Braces.
 */
export const LucideIcons: Record<string, LucideIcon> = {
  BookOpen,
  BrainCircuit,
  Braces,
  Code2: Braces, // alias for display purposes
  Cpu,
  GraduationCap,
  Layers,
  Lightbulb,
  ListOrdered,
  Map,
  MessageSquare,
  Network,
  Star,
  TrendingUp,
};

/** Safe lookup — always returns a valid LucideIcon */
export function getIcon(key: string): LucideIcon {
  return LucideIcons[key] ?? Braces;
}
