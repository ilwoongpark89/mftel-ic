declare module "react-katex" {
  import { FC, ReactNode } from "react";

  interface MathComponentProps {
    math: string;
    block?: boolean;
    errorColor?: string;
    renderError?: (error: Error | TypeError) => ReactNode;
  }

  export const InlineMath: FC<MathComponentProps>;
  export const BlockMath: FC<MathComponentProps>;
}
