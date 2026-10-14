import React, { useMemo } from 'react';
import katex from 'katex';

interface MathFormulaProps {
  formula: string;
  displayMode?: boolean;
  className?: string;
}

export const MathFormula: React.FC<MathFormulaProps> = ({
  formula,
  displayMode = false,
  className = '',
}) => {
  const html = useMemo(() => {
    if (!formula) return '';
    try {
      // Clean up common string issues if any
      const cleaned = formula.trim();
      return katex.renderToString(cleaned, {
        displayMode,
        throwOnError: false,
        strict: false,
      });
    } catch {
      return formula;
    }
  }, [formula, displayMode]);

  return (
    <span
      className={`inline-block font-serif text-[#174C3C] ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
