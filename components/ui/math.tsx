"use client";

import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

interface MathProps {
  children: string;
  block?: boolean;
  className?: string;
}

export function Math({ children, block = false, className }: MathProps) {
  if (block) {
    return (
      <div className={className}>
        <BlockMath math={children} />
      </div>
    );
  }
  return <InlineMath math={children} />;
}

export function InlineFormula({ children }: { children: string }) {
  return <InlineMath math={children} />;
}

export function BlockFormula({
  children,
  className
}: {
  children: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <BlockMath math={children} />
    </div>
  );
}
