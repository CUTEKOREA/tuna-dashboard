'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';

export default function SasBluefinRanchingEconomics() {
  return (
    <WidgetCard
      id="W-SAS06"
      title="EU 참다랑어 축양 마진 구조 (Ranching Economics)"
      description="저가 매입 후 고부가 수출로 이어지는 확실한 마진 창출"
      pillar="S5"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      cardDesc="사시미/스테이크 시장 동향"
      takeaway={{ situation: "EU 축양업은 저가 활어 매입 후 고부가 수출로 이어지는 확실한 마진 구조(차익 거래)를 갖고 있습니다.", actionPlan: "시장 변화에 따른 전략적 대응", source: "Sashimi Market Report 2025" }}
      customBody={
        <div className="flex flex-col h-full w-full justify-center space-y-6 pt-4 pb-2">
          <div className="flex items-center justify-between w-full relative">
            {/* Background Line */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 dark:bg-slate-700 -z-0 -translate-y-1/2"></div>
            
            {/* Step 1 */}
            <div className="flex flex-col items-center bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 w-1/3 mx-2 z-10">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold">1</span>
              </div>
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 text-center">활어 매입 (Live Input)</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">지중해 조업</p>
              <div className="mt-2 text-lg font-bold text-blue-600 dark:text-blue-400">€6.7 / kg</div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 w-1/3 mx-2 z-10">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mb-2">
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">2</span>
              </div>
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 text-center">축양 (Fattening)</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">6~8개월 사육</p>
              <div className="mt-2 text-sm font-medium text-indigo-600 dark:text-indigo-400">가치 증대</div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 w-1/3 mx-2 z-10">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mb-2">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">3</span>
              </div>
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 text-center">일본 수출 (-60°C)</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">초저온 냉동</p>
              <div className="mt-2 text-lg font-bold text-emerald-600 dark:text-emerald-400">€13.3 / kg</div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              <strong>인사이트:</strong> EU 축양업은 저가 활어 매입 후 고부가 수출로 이어지는 확실한 마진 구조(차익 거래)를 갖고 있습니다.
            </p>
          </div>
        </div>
      }
    />
  );
}
