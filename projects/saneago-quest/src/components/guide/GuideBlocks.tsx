import { CheckCircle2, Sparkles, Table2, XCircle } from 'lucide-react';
import {
  GuideCheatSheetTable,
  GuideComparisonExample,
  GuideKeyRule,
} from '../../types/quiz';

interface KeyRulesListProps {
  rules: GuideKeyRule[];
  accentColor: string;
}

export function KeyRulesList({ rules, accentColor }: KeyRulesListProps) {
  return (
    <div className="space-y-3">
      {rules.map((rule, idx) => (
        <div
          key={`${rule.title}-${idx}`}
          className="rounded-2xl border border-[#28384A] bg-[#131C26] p-4 space-y-2"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="font-display text-sm sm:text-base font-extrabold text-[#E8F1F8]">
              {rule.title}
            </h4>
            <span
              className="inline-flex items-center gap-1 rounded-xl border px-2.5 py-0.5 text-[11px] font-display font-extrabold"
              style={{
                backgroundColor: `${accentColor}1A`,
                borderColor: `${accentColor}55`,
                color: accentColor,
              }}
            >
              <Sparkles className="h-3 w-3 shrink-0" />
              <span>{rule.mnemonic}</span>
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#C7D7E6] leading-relaxed">
            {rule.explanation}
          </p>

          {rule.formula && (
            <div className="pt-1">
              <code className="inline-block max-w-full overflow-x-auto rounded-xl border border-[#28384A] bg-[#0B1117] px-3 py-1.5 font-mono text-xs font-bold text-[#61D5FF] whitespace-nowrap sm:whitespace-normal">
                {rule.formula}
              </code>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

interface ExamplesComparisonListProps {
  examples: GuideComparisonExample[];
}

export function ExamplesComparisonList({ examples }: ExamplesComparisonListProps) {
  return (
    <div className="space-y-3">
      {examples.map((ex, idx) => (
        <div
          key={`ex-${idx}`}
          className="overflow-hidden rounded-2xl border border-[#28384A] bg-[#131C26]"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#28384A]">
            {/* Certo */}
            <div className="bg-[#0F2617]/75 p-3.5 space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-display font-extrabold text-[#86F23B]">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Certo</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-[#E8F1F8] leading-snug">
                {ex.correct}
              </p>
            </div>

            {/* Errado */}
            <div className="bg-[#2D1218]/75 p-3.5 space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-display font-extrabold text-[#FF8585]">
                <XCircle className="h-4 w-4 shrink-0" />
                <span>Errado</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-[#FFD5D5] leading-snug">
                {ex.wrong}
              </p>
            </div>
          </div>

          <div className="border-t border-[#28384A] bg-[#0B1117]/70 px-3.5 py-2 text-xs text-[#92A8BE] leading-snug">
            <span className="font-bold text-[#FFC800]">Por quê: </span>
            {ex.explanation}
          </div>
        </div>
      ))}
    </div>
  );
}

interface CheatSheetTableCardProps {
  table: GuideCheatSheetTable;
  accentColor: string;
}

export function CheatSheetTableCard({ table, accentColor }: CheatSheetTableCardProps) {
  const monoSet = new Set(table.monoColumns ?? []);

  return (
    <div className="overflow-hidden rounded-2xl border border-[#28384A] bg-[#131C26]">
      <div className="flex items-center gap-2 border-b border-[#28384A] bg-[#0B1117]/80 px-4 py-2.5">
        <Table2 className="h-4 w-4 shrink-0" style={{ color: accentColor }} />
        <h4 className="font-display text-xs sm:text-sm font-extrabold text-[#E8F1F8]">
          {table.title}
        </h4>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-[#28384A] bg-[#1D2A38]/55">
              {table.headers.map((header, idx) => (
                <th
                  key={`th-${idx}`}
                  className="px-3.5 py-2.5 font-display text-[11px] font-extrabold uppercase tracking-wider text-[#92A8BE]"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#28384A]/70">
            {table.rows.map((row, rIdx) => (
              <tr
                key={`row-${rIdx}`}
                className="hover:bg-[#1D2A38]/30 transition-colors"
              >
                {row.map((cell, cIdx) => (
                  <td
                    key={`cell-${rIdx}-${cIdx}`}
                    className={`px-3.5 py-2.5 align-top leading-snug ${
                      monoSet.has(cIdx)
                        ? 'font-mono text-xs font-bold text-[#61D5FF]'
                        : 'text-[#E8F1F8]'
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
