const fs = require('fs');

let content = fs.readFileSync('components/TunaRanching.tsx', 'utf-8');

// Replace Insight 1
content = content.replace(
  /<div className=\{insightsStyles.analysisBlock\}>[\s\S]*?<\/div>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/,
  `</div>
          </div>
          <div style={{ padding: '0 2rem 2rem 2rem' }}>
            <TakeawayBox
              situation="지속가능성 요구와 지방률 통제 기술 발달로 인해, 양식(Ranching) 참치의 톤당 단가가 자연산 야생 어획을 추월한 크로스오버를 보여줍니다."
              actionPlan="2015년을 기점으로 참다랑어 양식업의 부가가치가 폭발적으로 전세 역전되었습니다. 일관된 품질을 갖춘 Ranching 비즈니스로의 자본 선회가 필수적입니다."
            />
          </div>
        </div>`
);

let parts = content.split('최고가 미식 소비 국가 맵 (Gastronomy Map)');
if (parts.length === 2) {
  let subParts = parts[1].split('</div>\n          </div>\n        </div>');
  if (subParts.length >= 2) {
     content = parts[0] + '최고가 미식 소비 국가 맵 (Gastronomy Map)' + subParts[0] + 
       `</div>
            </div>
          </div>
          <div style={{ padding: '0 2rem 2rem 2rem' }}>
            <TakeawayBox
              situation="kg당 수입단가가 30달러를 넘는 극프리미엄 지상주의 '소비 블랙홀' 흐름. 전통적 일본 수요보다 더 비싸게 사가는 신규 미식 타겟 국가 리스트입니다."
              actionPlan="일본 츠키지/토요스에 대한 공급 편중을 과감히 탈피해야 합니다. 두바이(UAE) 등 슈퍼 프리미엄 B2B 네크워크에 IKE-JIME 가공품을 항공 직납(Direct-to-Market)하는 밸류체인을 구축하십시오."
            />
          </div>
        </div>` + subParts.slice(1).join('</div>\n          </div>\n        </div>');
  }
}

// Write back
fs.writeFileSync('components/TunaRanching.tsx', content);
console.log("TunaRanching updated.");
