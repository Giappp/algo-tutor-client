import { type Variants, type Transition } from "framer-motion";

// Spring presets matching "snappy" aesthetic
export const springs = {
  snappy: { type: "spring", stiffness: 500, damping: 30 } as Transition,
  gentle: { type: "spring", stiffness: 300, damping: 25 } as Transition,
  bounce: { type: "spring", stiffness: 400, damping: 15 } as Transition,
} as const;

// Slide variants for quiz question transitions
export const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
};

// Stagger container for test case results
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

// Scale pop for answer selection
export const scalePop: Variants = {
  idle: { scale: 1 },
  selected: { scale: [1, 1.03, 1], transition: { duration: 0.2 } },
};

// Fade for sidebar collapse
export const fadeVariants: Variants = {
  visible: { opacity: 1, transition: { duration: 0.15 } },
  hidden: { opacity: 0, transition: { duration: 0.1 } },
};
