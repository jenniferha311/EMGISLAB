import React, { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen, Sparkles, HelpCircle } from 'lucide-react';
import { MathFormula } from './MathFormula';

interface FormulaAccordionProps {
  formula?: string;
  description?: string;
  principles?: string[];
  assumptions?: string[];
  variables?: Array<{
    symbol: string;
    name: string;
    unit: string;
    range?: string;
    description?: string;
  }>;
  title?: string;
  defaultOpen?: boolean;
}

export const FormulaAccordion: React.FC<FormulaAccordionProps> = ({
  formula,
  description,
  principles,
  assumptions,
  variables,
  title = 'Xem công thức & Toán học đằng sau',
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-2xl border border-[#E8E2D5] shadow-xs overflow-hidden transition-all">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full min-h-[48px] px-5 py-3.5 flex items-center justify-between text-left hover:bg-[#FAF7F0] transition-colors gap-3"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#EBF2EE] text-[#174C3C] flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="font-bold text-xs sm:text-sm text-[#174C3C]">
            {title}
          </span>
          <span className="text-[11px] font-semibold text-[#8A9E96] bg-[#FAF7F0] px-2 py-0.5 rounded-md border border-[#E8E2D5] hidden sm:inline">
            Mở rộng
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-[#556D65]">
          <span>{isOpen ? 'Thu gọn' : 'Xem chi tiết'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4 text-[#174C3C]" /> : <ChevronDown className="w-4 h-4 text-[#8A9E96]" />}
        </div>
      </button>

      {isOpen && (
        <div className="px-5 pb-5 pt-2 border-t border-[#E8E2D5] space-y-4 bg-[#FCFAF6]/60">
          {/* Main KaTeX Rendered Formula */}
          {formula && (
            <div className="p-4 bg-white rounded-xl border border-[#E8E2D5] shadow-2xs">
              <div className="text-[11px] font-bold text-[#8A9E96] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D6AA55]" />
                Công thức toán học & vật lý chuẩn
              </div>
              <div className="overflow-x-auto py-2 text-center text-sm sm:text-base">
                <MathFormula formula={formula} displayMode={true} />
              </div>
              {description && (
                <p className="text-xs text-[#556D65] mt-2 pt-2 border-t border-[#E8E2D5]/70 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          )}

          {/* Core Principles */}
          {principles && principles.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-[#20332D] uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-[#174C3C]" />
                Vì sao lại như vậy? (Nguyên lý cốt lõi)
              </h4>
              <ul className="space-y-1 text-xs text-[#556D65]">
                {principles.map((pr, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#D6AA55] font-bold">•</span>
                    <span>{pr}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Variables Table */}
          {variables && variables.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#20332D] uppercase tracking-wider">
                Ý nghĩa các đại lượng & đơn vị đo:
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-[#E8E2D5] rounded-lg overflow-hidden bg-white">
                  <thead className="bg-[#FAF7F0] text-[#174C3C] font-bold">
                    <tr>
                      <th className="p-2 border-b border-[#E8E2D5]">Ký hiệu</th>
                      <th className="p-2 border-b border-[#E8E2D5]">Tên biến</th>
                      <th className="p-2 border-b border-[#E8E2D5]">Đơn vị</th>
                      <th className="p-2 border-b border-[#E8E2D5]">Khoảng giá trị</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E2D5] text-[#556D65]">
                    {variables.map((v, i) => (
                      <tr key={i} className="hover:bg-[#FAF7F0]/50">
                        <td className="p-2 font-mono font-bold text-[#174C3C]">
                          <MathFormula formula={v.symbol} />
                        </td>
                        <td className="p-2 font-medium text-[#20332D]">{v.name}</td>
                        <td className="p-2 font-mono text-xs">{v.unit}</td>
                        <td className="p-2 text-xs">{v.range || 'Tự do'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Assumptions */}
          {assumptions && assumptions.length > 0 && (
            <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#E8E2D5] text-xs text-[#556D65] space-y-1">
              <div className="font-bold text-[#20332D]">Giả định của mô hình số:</div>
              <ul className="list-disc list-inside space-y-0.5">
                {assumptions.map((as, i) => (
                  <li key={i}>{as}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
