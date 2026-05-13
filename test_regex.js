const fs = require('fs');
const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><response><header><resultCode>00</resultCode><resultMsg>정상서비스.</resultMsg></header><body><items><item><balPayments>-479784142</balPayments><expDlr>447515</expDlr><expWgt>111885</expWgt><hsCd>-</hsCd><impDlr>480231657</impDlr><impWgt>64491992</impWgt><statCd>-</statCd><statCdCntnKor1>-</statCdCntnKor1><statKor>-</statKor><year>총계</year></item><item><balPayments>-893107</balPayments><expDlr>0</expDlr><expWgt>0</expWgt><hsCd>0306171090</hsCd><impDlr>893107</impDlr>`;

const match = xml.match(/<item>.*?<impDlr>(\d+)<\/impDlr>.*?<year>총계<\/year>.*?<\/item>/s) || xml.match(/<item>.*?<year>총계<\/year>.*?<impDlr>(\d+)<\/impDlr>.*?<\/item>/s);

console.log(match ? match[1] : null);
