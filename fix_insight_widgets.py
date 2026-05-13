import re
import glob

files = [
    '/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/SalmonInsightWidgets.tsx',
    '/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/ShrimpInsightWidgets.tsx',
    '/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/TunaInsightWidgets.tsx'
]

pattern = re.compile(
    r'\{\/\*\s*2-Step Information Architecture\s*\*\/\}\s*'
    r'<div[^>]*borderTop[^>]*>\s*'
    r'<div[^>]*>\s*'
    r'<div[^>]*>\s*'
    r'<span[^>]*>.*?</span>\s*현황 분석 \(SITUATION\)\s*'
    r'</div>\s*'
    r'<div[^>]*>\s*'
    r'\{situation\}\s*'
    r'</div>\s*'
    r'</div>\s*'
    r'<div[^>]*>\s*'
    r'<div[^>]*>\s*'
    r'<span[^>]*>.*?</span>\s*(?:실행 전략|EXECUTIVE).*?\(EXECUTIVE TAKEAWAY\)\s*'
    r'</div>\s*'
    r'<div[^>]*>\s*'
    r'\{takeaway\}\s*'
    r'</div>\s*'
    r'</div>\s*'
    r'</div>',
    re.DOTALL | re.IGNORECASE
)

import_re = re.compile(r'import\s+TakeawayBox\s+from\s+[\'"](?:\./)?TakeawayBox[\'"];?\n')

for file_path in files:
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original = content
        
        def repl(m):
            return '<div style={{ marginTop: \'20px\' }}>\n        <TakeawayBox\n          situation={situation}\n          actionPlan={takeaway}\n        />\n      </div>'

        content = pattern.sub(repl, content)

        if content != original:
            if not import_re.search(content):
                last_import = content.rfind('import ')
                if last_import != -1:
                    end_of_line = content.find('\n', last_import)
                    content = content[:end_of_line+1] + "import TakeawayBox from './TakeawayBox';\n" + content[end_of_line+1:]
                else:
                    content = "import TakeawayBox from './TakeawayBox';\n" + content
                    
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Refactored: {file_path}")
        else:
            print(f"No match in: {file_path}")
    except Exception as e:
        print(e)

