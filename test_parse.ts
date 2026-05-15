function parseAnimatedValue(valStr: string) {
  if (!valStr || typeof valStr !== 'string') return null;
  const match = valStr.match(/^([^\d]*)?([\d,]+(?:\.\d+)?)(.*)?$/);
  if (!match) return null;
  const prefix = match[1] || '';
  const numStr = match[2].replace(/,/g, '');
  const suffix = match[3] || '';
  const decimals = numStr.includes('.') ? numStr.split('.')[1].length : 0;
  return { prefix, numberVal: parseFloat(numStr), suffix, decimals };
}
console.log(parseAnimatedValue("3,459,852"));
console.log(parseAnimatedValue("92.6% 이상"));
console.log(parseAnimatedValue("233% 폭발"));
console.log(parseAnimatedValue("94.8%"));
console.log(parseAnimatedValue("145%"));
console.log(parseAnimatedValue("9,538 톤"));
