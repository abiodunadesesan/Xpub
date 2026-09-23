"use client";

import { motion } from "motion/react";
import { Children, type ReactNode } from "react";
import { useMounted } from "@/lib/use-mounted";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  x?: number;
  once?: boolean;
  amount?: number;
  as?: "div" | "section" | "article" | "li" | "span";
  "data-testid"?: string;
};

const ease = [0.22, 1, 0.36, 1] as const;

/** Scroll reveal — client-only animation to avoid SSR hydration mismatches. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 40,
  x = 0,
  once = true,
  amount = 0.15,
  as = "div",
  "data-testid": testId,
}: RevealProps) {
  const ready = useMounted();
  const Tag = motion[as];

  if (!ready) {
    return (
      <div className={className} data-testid={testId}>
        {children}
      </div>
    );
  }

  return (
    <Tag
      className={className}
      data-testid={testId}
      initial={{ opacity: 0, y, x, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, x: 0, filter: "blur(0px)" }}
      viewport={{ once, amount, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.75, delay, ease }}
    >
      {children}
    </Tag>
  );
}

type RevealGroupProps = {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  y?: number;
  once?: boolean;
};

export function RevealGroup({
  children,
  className,
  stagger = 0.08,
  delay = 0,
  y = 32,
  once = true,
}: RevealGroupProps) {
  const ready = useMounted();
  const items = Children.toArray(children);

  if (!ready) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount: 0.12, margin: "0px 0px -6% 0px" }}
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: stagger, delayChildren: delay },
        },
      }}
    >
      {items.map((child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, y, filter: "blur(4px)" },
            show: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: { duration: 0.65, ease },
            },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
