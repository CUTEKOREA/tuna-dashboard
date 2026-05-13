const xlsx = require('xlsx');

const data = [
  { month: '2027 Jan', import: 20000, export: 15000, priceHist: 1100 },
  { month: '2027 Feb', import: 25000, export: 18000, priceHist: 1250 },
  { month: '2027 Mar', import: 30000, export: 25000, priceHist: 1500 },
  { month: '2027 Apr (Est)', importEst: 35000, exportEst: 30000, priceEst: 1800 },
];

const ws = xlsx.utils.json_to_sheet(data);
const wb = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(wb, ws, "MOC_Data");

xlsx.writeFile(wb, "test_moc_data.xlsx");
console.log("Created test_moc_data.xlsx successfully.");
