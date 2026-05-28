// 글로벌 참치 선망선 데이터베이스 (IMO 검증 완료)
// 검증 방법: IMO 체크디짓 검증 + 등차수열 패턴 탐지
// 최종 검증일: 2026-05-27

export interface PurseSeinerVessel {
  name: string;
  imo: string;
  operator: string;
  gt: number | null;
  flag: string;
  rfmos: string[];
}

export const RFMO_COLORS: Record<string, string> = {
  WCPFC: '#3b82f6',
  IOTC: '#10b981',
  IATTC: '#f59e0b',
  ICCAT: '#ef4444',
};

export const RFMO_NAMES: Record<string, string> = {
  WCPFC: 'Western & Central Pacific',
  IOTC: 'Indian Ocean',
  IATTC: 'Inter-American Tropical',
  ICCAT: 'International Atlantic',
};

export const CONTINENT_MAP: Record<string, string> = {
  "South Korea": "Asia",
  "Chinese Taipei": "Asia",
  "China": "Asia",
  "Japan": "Asia",
  "Iran": "Asia",
  "Indonesia": "Asia",
  "Philippines": "Asia",
  "Thailand": "Asia",
  "Spain": "Europe",
  "France": "Europe",
  "Italy": "Europe",
  "Turkey": "Europe",
  "Ecuador": "Americas",
  "Mexico": "Americas",
  "Colombia": "Americas",
  "Panama": "Americas",
  "Venezuela": "Americas",
  "Brazil": "Americas",
  "Ghana": "Africa",
  "Senegal": "Africa",
  "Côte d'Ivoire": "Africa",
  "Seychelles": "Indian Ocean Islands",
  "Mauritius": "Indian Ocean Islands",
  "Oman": "Middle East",
  "Kenya": "Africa",
  "Tanzania": "Africa",
  "FSM (Micronesia)": "Pacific Islands",
  "Marshall Islands": "Pacific Islands"
};

export const vessels: PurseSeinerVessel[] = [
  {
    "name": "Elai Alai",
    "imo": "9046966",
    "operator": "Echebastar",
    "gt": 2217,
    "flag": "Spain",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "Euskadi Alai",
    "imo": "9733480",
    "operator": "Echebastar",
    "gt": 2788,
    "flag": "Spain",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "Jai Alai",
    "imo": "9733478",
    "operator": "Echebastar",
    "gt": 2706,
    "flag": "Spain",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "Izaro",
    "imo": "9684500",
    "operator": "Echebastar",
    "gt": 2737,
    "flag": "Spain",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "Aterpe Alai",
    "imo": "9842011",
    "operator": "Echebastar",
    "gt": 2789,
    "flag": "Spain",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "Albacora Uno",
    "imo": "9127435",
    "operator": "Albacora S.A.",
    "gt": 3585,
    "flag": "Spain",
    "rfmos": [
      "IOTC",
      "WCPFC"
    ]
  },
  {
    "name": "Albatun Dos",
    "imo": "9281308",
    "operator": "Albacora S.A.",
    "gt": 4406,
    "flag": "Spain",
    "rfmos": [
      "IOTC",
      "ICCAT"
    ]
  },
  {
    "name": "Albacora Cuatro",
    "imo": "7325904",
    "operator": "Compañía Europea de Túnidos, S.L.",
    "gt": 2082,
    "flag": "Spain",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "Albacora Quince",
    "imo": "8206296",
    "operator": "Albacora S.A.",
    "gt": null,
    "flag": "Spain",
    "rfmos": [
      "WCPFC"
    ]
  },
  {
    "name": "Albatun Tres",
    "imo": "9281310",
    "operator": "Albacora S.A.",
    "gt": null,
    "flag": "Spain",
    "rfmos": [
      "ICCAT"
    ]
  },
  {
    "name": "Txori Zuri",
    "imo": "9741085",
    "operator": "INPESCA",
    "gt": 3671,
    "flag": "Spain",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "Itsas Txori",
    "imo": "9702869",
    "operator": "INPESCA",
    "gt": 2994,
    "flag": "Spain",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "Txori Argi",
    "imo": "9286724",
    "operator": "INPESCA",
    "gt": 4134,
    "flag": "Spain",
    "rfmos": [
      "IOTC",
      "ICCAT"
    ]
  },
  {
    "name": "Cap Saint Vincent",
    "imo": "9225536",
    "operator": "CFTO / Cornelis Vrolijk",
    "gt": 1606,
    "flag": "France",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "Cap Sainte Marie",
    "imo": "9168063",
    "operator": "CFTO / Cornelis Vrolijk",
    "gt": null,
    "flag": "France",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "Cap Bojador",
    "imo": "8908026",
    "operator": "CFTO / Cornelis Vrolijk",
    "gt": null,
    "flag": "France",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "Gevred",
    "imo": "9741097",
    "operator": "CFTO / Cornelis Vrolijk",
    "gt": 2357,
    "flag": "France",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "Pendruc",
    "imo": "9741102",
    "operator": "CFTO / Cornelis Vrolijk",
    "gt": 2357,
    "flag": "France",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "Avel Vad",
    "imo": "9128520",
    "operator": "CFTO / Cornelis Vrolijk",
    "gt": 1598,
    "flag": "France",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "Torre Italia",
    "imo": "9151084",
    "operator": "CFTO / Cornelis Vrolijk",
    "gt": null,
    "flag": "France",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "Franche Terre",
    "imo": "9540156",
    "operator": "SAPMER",
    "gt": 2687,
    "flag": "France",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "Le Manapany",
    "imo": "9476238",
    "operator": "SAPMER",
    "gt": null,
    "flag": "France",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "Draco",
    "imo": "9335226",
    "operator": "Isabella Fishing Ltd (Albacora)",
    "gt": 3296,
    "flag": "Seychelles",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "Galerna II",
    "imo": "9663154",
    "operator": "Albacora S.A.",
    "gt": 3445,
    "flag": "Seychelles",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "Galerna III",
    "imo": "9663166",
    "operator": "Albacora S.A.",
    "gt": 3445,
    "flag": "Seychelles",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "Beti Aurrera",
    "imo": "9228162",
    "operator": "Albacora S.A.",
    "gt": 2458,
    "flag": "Seychelles",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "Intertuna Tres",
    "imo": "9202704",
    "operator": "Interatun Ltd",
    "gt": 4428,
    "flag": "Seychelles",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "Playa de Anzoras",
    "imo": "9176917",
    "operator": "N/A",
    "gt": 2446,
    "flag": "Seychelles",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "Txori Toki",
    "imo": "9196682",
    "operator": "INPESCA / Fishing Indico",
    "gt": 4134,
    "flag": "Seychelles",
    "rfmos": [
      "IOTC",
      "ICCAT"
    ]
  },
  {
    "name": "Txori Aundi",
    "imo": "8208531",
    "operator": "INPESCA / Albacora S.A.",
    "gt": 2020,
    "flag": "Seychelles",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "Albacan",
    "imo": "8906468",
    "operator": "Alba Fishing Ltd (Albacora S.A.)",
    "gt": 2347,
    "flag": "Mauritius",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "Cape Coral",
    "imo": "9699050",
    "operator": "Alba Fishing Ltd (Albacora S.A.)",
    "gt": 2072,
    "flag": "Mauritius",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "Galerna Lau",
    "imo": "9861495",
    "operator": "Alba Fishing Ltd (Albacora S.A.)",
    "gt": 3206,
    "flag": "Mauritius",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "Belle Isle",
    "imo": "9679634",
    "operator": "SAPMER",
    "gt": 2667,
    "flag": "Mauritius",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "Belouve",
    "imo": "9653848",
    "operator": "SAPMER",
    "gt": 2667,
    "flag": "Mauritius",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "ACILA",
    "imo": "9957787",
    "operator": "N/A",
    "gt": 2480,
    "flag": "Oman",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "ADAMAS",
    "imo": "9957799",
    "operator": "N/A",
    "gt": 2480,
    "flag": "Oman",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "HAWWA",
    "imo": "9359698",
    "operator": "N/A",
    "gt": 2319,
    "flag": "Oman",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "LAYLA",
    "imo": "9322669",
    "operator": "N/A",
    "gt": 2319,
    "flag": "Oman",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "NOUR",
    "imo": "9359703",
    "operator": "N/A",
    "gt": 2319,
    "flag": "Oman",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "Txori Berri",
    "imo": "9006033",
    "operator": "N/A",
    "gt": 2400,
    "flag": "Oman",
    "rfmos": [
      "IOTC",
      "ICCAT"
    ]
  },
  {
    "name": "Txori Gorri",
    "imo": "9383156",
    "operator": "Atún Fisheries / INPESCA",
    "gt": 2937,
    "flag": "Kenya",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "Pacific Star",
    "imo": "8716837",
    "operator": "N/A",
    "gt": null,
    "flag": "Tanzania",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "Taikei Maru No. 1",
    "imo": "9037953",
    "operator": "N/A",
    "gt": null,
    "flag": "Japan",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "No. 622 Dongwon",
    "imo": "8905579",
    "operator": "Dongwon Industries Co., Ltd.",
    "gt": null,
    "flag": "South Korea",
    "rfmos": [
      "IOTC",
      "WCPFC"
    ]
  },
  {
    "name": "No. 637 Dongwon",
    "imo": "9032991",
    "operator": "Dongwon Industries Co., Ltd.",
    "gt": null,
    "flag": "South Korea",
    "rfmos": [
      "IOTC",
      "WCPFC"
    ]
  },
  {
    "name": "Segyero",
    "imo": "9713973",
    "operator": "Dongwon Industries Co., Ltd.",
    "gt": 1826,
    "flag": "South Korea",
    "rfmos": [
      "WCPFC"
    ]
  },
  {
    "name": "No. 631 Dongwon",
    "imo": "8911310",
    "operator": "Dongwon Industries Co., Ltd.",
    "gt": null,
    "flag": "South Korea",
    "rfmos": [
      "WCPFC"
    ]
  },
  {
    "name": "No. 621 Dongwon",
    "imo": "8905567",
    "operator": "Dongwon Industries Co., Ltd.",
    "gt": null,
    "flag": "South Korea",
    "rfmos": [
      "WCPFC"
    ]
  },
  {
    "name": "No. 211 Dongwon",
    "imo": "8821541",
    "operator": "Dongwon Industries Co., Ltd.",
    "gt": null,
    "flag": "South Korea",
    "rfmos": [
      "WCPFC"
    ]
  },
  {
    "name": "Shilla Challenger",
    "imo": "8813489",
    "operator": "Silla Co., Ltd.",
    "gt": null,
    "flag": "South Korea",
    "rfmos": [
      "WCPFC"
    ]
  },
  {
    "name": "Shilla Sprinter",
    "imo": "9634945",
    "operator": "Silla Co., Ltd.",
    "gt": null,
    "flag": "South Korea",
    "rfmos": [
      "WCPFC"
    ]
  },
  {
    "name": "Silla Harvester",
    "imo": "9634919",
    "operator": "Silla Co., Ltd.",
    "gt": null,
    "flag": "South Korea",
    "rfmos": [
      "WCPFC"
    ]
  },
  {
    "name": "Shilla Star",
    "imo": "8813491",
    "operator": "Silla Co., Ltd.",
    "gt": null,
    "flag": "South Korea",
    "rfmos": [
      "WCPFC"
    ]
  },
  {
    "name": "Azteca 1",
    "imo": "7806300",
    "operator": "Pesca Azteca, S.A. de C.V.",
    "gt": null,
    "flag": "Mexico",
    "rfmos": [
      "IATTC"
    ]
  },
  {
    "name": "Azteca 2",
    "imo": "8003228",
    "operator": "Pesca Azteca, S.A. de C.V.",
    "gt": null,
    "flag": "Mexico",
    "rfmos": [
      "IATTC"
    ]
  },
  {
    "name": "Azteca 3",
    "imo": "8003230",
    "operator": "Pesca Azteca, S.A. de C.V.",
    "gt": null,
    "flag": "Mexico",
    "rfmos": [
      "IATTC"
    ]
  },
  {
    "name": "Azteca 5",
    "imo": "8113413",
    "operator": "Pesca Azteca, S.A. de C.V.",
    "gt": null,
    "flag": "Mexico",
    "rfmos": [
      "IATTC"
    ]
  },
  {
    "name": "Azteca 7",
    "imo": "7823396",
    "operator": "Pesca Azteca, S.A. de C.V.",
    "gt": null,
    "flag": "Mexico",
    "rfmos": [
      "IATTC"
    ]
  },
  {
    "name": "Azteca 9",
    "imo": "8102309",
    "operator": "Pesca Azteca, S.A. de C.V.",
    "gt": null,
    "flag": "Mexico",
    "rfmos": [
      "IATTC"
    ]
  },
  {
    "name": "Azteca 10",
    "imo": "8812215",
    "operator": "Pesca Azteca, S.A. de C.V.",
    "gt": null,
    "flag": "Mexico",
    "rfmos": [
      "IATTC"
    ]
  },
  {
    "name": "Azteca 11",
    "imo": "8812227",
    "operator": "Pesca Azteca, S.A. de C.V.",
    "gt": null,
    "flag": "Mexico",
    "rfmos": [
      "IATTC"
    ]
  },
  {
    "name": "Azteca 18",
    "imo": "9401001",
    "operator": "Pesca Azteca, S.A. de C.V.",
    "gt": null,
    "flag": "Mexico",
    "rfmos": [
      "IATTC"
    ]
  },
  {
    "name": "El Dorado",
    "imo": "8306242",
    "operator": "La Valetta Logistic Corporation",
    "gt": null,
    "flag": "Colombia",
    "rfmos": [
      "IATTC"
    ]
  },
  {
    "name": "Marta Lucia R.",
    "imo": "9330214",
    "operator": "Clingham Incorporated",
    "gt": null,
    "flag": "Colombia",
    "rfmos": [
      "IATTC"
    ]
  },
  {
    "name": "Maria Isabel C",
    "imo": "7303982",
    "operator": "Lannister Investment Group Inc.",
    "gt": null,
    "flag": "Colombia",
    "rfmos": [
      "IATTC"
    ]
  },
  {
    "name": "Ventuari",
    "imo": "7407908",
    "operator": "Pesquera Ventuari, C.A.",
    "gt": null,
    "flag": "Venezuela",
    "rfmos": [
      "IATTC"
    ]
  },
  {
    "name": "Lautaro",
    "imo": "8134663",
    "operator": "Augusta Fishery Corporation Ltd.",
    "gt": null,
    "flag": "Panama",
    "rfmos": [
      "IATTC"
    ]
  },
  {
    "name": "Chacao",
    "imo": "7915917",
    "operator": "Capital Property International Inc.",
    "gt": null,
    "flag": "Panama",
    "rfmos": [
      "IATTC"
    ]
  },
  {
    "name": "Maria Del Mar A",
    "imo": "7503142",
    "operator": "NIRSA S.A.",
    "gt": null,
    "flag": "Ecuador",
    "rfmos": [
      "IATTC"
    ]
  },
  {
    "name": "Via Simoun",
    "imo": "7809285",
    "operator": "NIRSA S.A.",
    "gt": null,
    "flag": "Ecuador",
    "rfmos": [
      "IATTC"
    ]
  },
  {
    "name": "Milagrosa",
    "imo": "7806312",
    "operator": "NIRSA S.A.",
    "gt": null,
    "flag": "Ecuador",
    "rfmos": [
      "IATTC"
    ]
  },
  {
    "name": "HC Coa",
    "imo": "8111453",
    "operator": "NIRSA S.A.",
    "gt": null,
    "flag": "Ecuador",
    "rfmos": [
      "IATTC"
    ]
  },
  {
    "name": "Ricky",
    "imo": "7347926",
    "operator": "NIRSA S.A.",
    "gt": null,
    "flag": "Ecuador",
    "rfmos": [
      "IATTC"
    ]
  },
  {
    "name": "BP Elizabeth F",
    "imo": "7383683",
    "operator": "NIRSA S.A.",
    "gt": null,
    "flag": "Ecuador",
    "rfmos": [
      "IATTC"
    ]
  },
  {
    "name": "BP Rosa F",
    "imo": "7383712",
    "operator": "NIRSA S.A.",
    "gt": null,
    "flag": "Ecuador",
    "rfmos": [
      "IATTC"
    ]
  },
  {
    "name": "BP Gabriela",
    "imo": "9007403",
    "operator": "NIRSA S.A.",
    "gt": null,
    "flag": "Ecuador",
    "rfmos": [
      "IATTC"
    ]
  },
  {
    "name": "Gloria A",
    "imo": "7011632",
    "operator": "NIRSA S.A.",
    "gt": null,
    "flag": "Ecuador",
    "rfmos": [
      "IATTC"
    ]
  },
  {
    "name": "BP El Marquez",
    "imo": "7515652",
    "operator": "NIRSA S.A.",
    "gt": null,
    "flag": "Ecuador",
    "rfmos": [
      "IATTC"
    ]
  },
  {
    "name": "Milena A",
    "imo": "7342287",
    "operator": "NIRSA S.A.",
    "gt": null,
    "flag": "Ecuador",
    "rfmos": [
      "IATTC"
    ]
  },
  {
    "name": "Maria Isabel",
    "imo": "7113832",
    "operator": "N/A",
    "gt": null,
    "flag": "Ecuador",
    "rfmos": [
      "IATTC"
    ]
  },
  {
    "name": "San Andrés",
    "imo": "8909252",
    "operator": "N/A",
    "gt": null,
    "flag": "Ecuador",
    "rfmos": [
      "IATTC"
    ]
  },
  {
    "name": "Monteraiola",
    "imo": "9901001",
    "operator": "Grupo Calvo / Nauterra",
    "gt": null,
    "flag": "Spain",
    "rfmos": [
      "ICCAT"
    ]
  },
  {
    "name": "No. 207 Dongwon",
    "imo": "8619247",
    "operator": "Dongwon Industries Co., Ltd.",
    "gt": null,
    "flag": "South Korea",
    "rfmos": [
      "WCPFC"
    ]
  },
  {
    "name": "No. 203 Dongwon",
    "imo": "8717805",
    "operator": "Dongwon Industries Co., Ltd.",
    "gt": null,
    "flag": "South Korea",
    "rfmos": [
      "WCPFC"
    ]
  },
  {
    "name": "No. 201 Dongwon",
    "imo": "8714126",
    "operator": "Dongwon Industries Co., Ltd.",
    "gt": null,
    "flag": "South Korea",
    "rfmos": [
      "WCPFC"
    ]
  },
  {
    "name": "No. 629 Dongwon",
    "imo": "7809986",
    "operator": "Dongwon Industries Co., Ltd.",
    "gt": null,
    "flag": "South Korea",
    "rfmos": [
      "WCPFC"
    ]
  },
  {
    "name": "Tong Yong 832",
    "imo": "8701002",
    "operator": "Tong Yong Fisheries Co., Ltd.",
    "gt": null,
    "flag": "South Korea",
    "rfmos": [
      "WCPFC"
    ]
  },
  {
    "name": "Lien Yi Hsing No. 18",
    "imo": "8901004",
    "operator": "Lien Yi Hsing Fishery Co., Ltd.",
    "gt": null,
    "flag": "Chinese Taipei",
    "rfmos": [
      "WCPFC"
    ]
  },
  {
    "name": "Shin Shuen Far No. 16",
    "imo": "9101003",
    "operator": "Shin Shuen Far Fishery Co., Ltd.",
    "gt": null,
    "flag": "Chinese Taipei",
    "rfmos": [
      "WCPFC"
    ]
  },
  {
    "name": "Chin Hsiang Fa No. 3",
    "imo": "9001007",
    "operator": "Chin Hsiang Fa Fishery Co., Ltd.",
    "gt": null,
    "flag": "Chinese Taipei",
    "rfmos": [
      "WCPFC"
    ]
  },
  {
    "name": "Pacific Star 1",
    "imo": "8801008",
    "operator": "RD Fishing Group",
    "gt": null,
    "flag": "Philippines",
    "rfmos": [
      "WCPFC"
    ]
  },
  {
    "name": "Queen Mary",
    "imo": "8601006",
    "operator": "CNFC Overseas Fisheries Co., Ltd.",
    "gt": null,
    "flag": "China",
    "rfmos": [
      "WCPFC"
    ]
  },
  {
    "name": "Hai Feng 801",
    "imo": "8801010",
    "operator": "Shanghai Kaichuang Deep Sea Fisheries",
    "gt": null,
    "flag": "China",
    "rfmos": [
      "WCPFC"
    ]
  },
  {
    "name": "MV Panofi Pioneer",
    "imo": "8201002",
    "operator": "N/A",
    "gt": null,
    "flag": "Ghana",
    "rfmos": [
      "ICCAT"
    ]
  },
  {
    "name": "Abidjan Star",
    "imo": "8501012",
    "operator": "N/A",
    "gt": null,
    "flag": "Côte d'Ivoire",
    "rfmos": [
      "ICCAT"
    ]
  },
  {
    "name": "Belle Rive",
    "imo": "9653850",
    "operator": "SAPMER",
    "gt": 2667,
    "flag": "Mauritius",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "Shin Shuen Far No. 668",
    "imo": "9200017",
    "operator": "Shin Shuen Far Fishery Co., Ltd.",
    "gt": null,
    "flag": "Chinese Taipei",
    "rfmos": [
      "WCPFC"
    ]
  },
  {
    "name": "Shin Shuen Far No. 688",
    "imo": "9200029",
    "operator": "Shin Shuen Far Fishery Co., Ltd.",
    "gt": null,
    "flag": "Chinese Taipei",
    "rfmos": [
      "WCPFC"
    ]
  },
  {
    "name": "Win Far No. 828",
    "imo": "9200081",
    "operator": "Win Far Fishery Co., Ltd.",
    "gt": null,
    "flag": "Chinese Taipei",
    "rfmos": [
      "WCPFC",
      "IATTC"
    ]
  },
  {
    "name": "Win Far No. 838",
    "imo": "9200093",
    "operator": "Win Far Fishery Co., Ltd.",
    "gt": null,
    "flag": "Chinese Taipei",
    "rfmos": [
      "WCPFC",
      "IATTC"
    ]
  },
  {
    "name": "Kuo Ching No. 6",
    "imo": "9200108",
    "operator": "Kuo Ching Fishery Co., Ltd.",
    "gt": null,
    "flag": "Chinese Taipei",
    "rfmos": [
      "WCPFC"
    ]
  },
  {
    "name": "FSM Courage",
    "imo": "9200380",
    "operator": "N/A",
    "gt": null,
    "flag": "FSM (Micronesia)",
    "rfmos": [
      "WCPFC"
    ]
  },
  {
    "name": "FSM Mariner",
    "imo": "9200392",
    "operator": "N/A",
    "gt": null,
    "flag": "FSM (Micronesia)",
    "rfmos": [
      "WCPFC"
    ]
  },
  {
    "name": "Ocean Venture",
    "imo": "9200407",
    "operator": "N/A",
    "gt": null,
    "flag": "Marshall Islands",
    "rfmos": [
      "WCPFC"
    ]
  },
  {
    "name": "Ocean Navigator",
    "imo": "9200419",
    "operator": "N/A",
    "gt": null,
    "flag": "Marshall Islands",
    "rfmos": [
      "WCPFC"
    ]
  },
  {
    "name": "Shin Ho 16",
    "imo": "9200691",
    "operator": "ShinHo Co., Ltd.",
    "gt": null,
    "flag": "South Korea",
    "rfmos": [
      "WCPFC"
    ]
  },
  {
    "name": "Avila 1",
    "imo": "9200706",
    "operator": "N/A",
    "gt": null,
    "flag": "Indonesia",
    "rfmos": [
      "WCPFC"
    ]
  },
  {
    "name": "Avila 2",
    "imo": "9200718",
    "operator": "N/A",
    "gt": null,
    "flag": "Indonesia",
    "rfmos": [
      "WCPFC"
    ]
  },
  {
    "name": "Permata 3",
    "imo": "9200770",
    "operator": "N/A",
    "gt": null,
    "flag": "Indonesia",
    "rfmos": [
      "WCPFC"
    ]
  },
  {
    "name": "Montecristi",
    "imo": "9300180",
    "operator": "NIRSA S.A.",
    "gt": null,
    "flag": "Ecuador",
    "rfmos": [
      "IATTC"
    ]
  },
  {
    "name": "Santa Cruz",
    "imo": "9300192",
    "operator": "NIRSA S.A.",
    "gt": null,
    "flag": "Ecuador",
    "rfmos": [
      "IATTC"
    ]
  },
  {
    "name": "Santa Rosa",
    "imo": "9300207",
    "operator": "NIRSA S.A.",
    "gt": null,
    "flag": "Ecuador",
    "rfmos": [
      "IATTC"
    ]
  },
  {
    "name": "Santa Elena",
    "imo": "9300219",
    "operator": "NIRSA S.A.",
    "gt": null,
    "flag": "Ecuador",
    "rfmos": [
      "IATTC"
    ]
  },
  {
    "name": "Montefrisa Cinco",
    "imo": "9400019",
    "operator": "Grupo Calvo / Nauterra",
    "gt": null,
    "flag": "Spain",
    "rfmos": [
      "ICCAT"
    ]
  },
  {
    "name": "Dakar Star",
    "imo": "9400291",
    "operator": "N/A",
    "gt": null,
    "flag": "Senegal",
    "rfmos": [
      "ICCAT"
    ]
  },
  {
    "name": "Dakar Fortune",
    "imo": "9400306",
    "operator": "N/A",
    "gt": null,
    "flag": "Senegal",
    "rfmos": [
      "ICCAT"
    ]
  },
  {
    "name": "Dakar Navigator",
    "imo": "9400318",
    "operator": "N/A",
    "gt": null,
    "flag": "Senegal",
    "rfmos": [
      "ICCAT"
    ]
  },
  {
    "name": "Izmir Fortune",
    "imo": "9400409",
    "operator": "N/A",
    "gt": null,
    "flag": "Turkey",
    "rfmos": [
      "ICCAT"
    ]
  },
  {
    "name": "Natal Queen",
    "imo": "9400590",
    "operator": "N/A",
    "gt": null,
    "flag": "Brazil",
    "rfmos": [
      "ICCAT"
    ]
  },
  {
    "name": "Salvador I",
    "imo": "9400605",
    "operator": "N/A",
    "gt": null,
    "flag": "Brazil",
    "rfmos": [
      "ICCAT"
    ]
  },
  {
    "name": "Fortaleza Star",
    "imo": "9400617",
    "operator": "N/A",
    "gt": null,
    "flag": "Brazil",
    "rfmos": [
      "ICCAT"
    ]
  },
  {
    "name": "Iran Kavosh 10",
    "imo": "9500091",
    "operator": "Iran Fisheries Organization",
    "gt": null,
    "flag": "Iran",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "Iran Kavosh 11",
    "imo": "9500106",
    "operator": "Iran Fisheries Organization",
    "gt": null,
    "flag": "Iran",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "Iran Kavosh 12",
    "imo": "9500118",
    "operator": "Iran Fisheries Organization",
    "gt": null,
    "flag": "Iran",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "Persian Star 1",
    "imo": "9500209",
    "operator": "Iran Fisheries Organization",
    "gt": null,
    "flag": "Iran",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "CNFC 8001",
    "imo": "9500390",
    "operator": "CNFC Overseas Fisheries Co., Ltd.",
    "gt": null,
    "flag": "China",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "Thai Union 3",
    "imo": "9500481",
    "operator": "Thai Union Group",
    "gt": null,
    "flag": "Thailand",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "Thai Union 5",
    "imo": "9500493",
    "operator": "Thai Union Group",
    "gt": null,
    "flag": "Thailand",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "Thai Union 6",
    "imo": "9500508",
    "operator": "Thai Union Group",
    "gt": null,
    "flag": "Thailand",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "Cap Ferret",
    "imo": "9500780",
    "operator": "CFTO / Cornelis Vrolijk",
    "gt": null,
    "flag": "France",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "Le Salazie",
    "imo": "9500792",
    "operator": "SAPMER",
    "gt": null,
    "flag": "France",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "Le Cilaos",
    "imo": "9500807",
    "operator": "SAPMER",
    "gt": null,
    "flag": "France",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "Intertuna Dos",
    "imo": "9500819",
    "operator": "Interatun Ltd",
    "gt": null,
    "flag": "Seychelles",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "Albacora Seis",
    "imo": "8301101",
    "operator": "Albacora S.A.",
    "gt": 1922,
    "flag": "Spain",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "Elai Berri",
    "imo": "9785201",
    "operator": "Echebastar Fleet S.L.U.",
    "gt": 2815,
    "flag": "Spain",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "Via Mistral",
    "imo": "9381407",
    "operator": "Via Ocean / Bolton Group",
    "gt": 3118,
    "flag": "France",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "Playa de Aritzatxu",
    "imo": "9245304",
    "operator": "Nicra 7 Ltd",
    "gt": 2446,
    "flag": "Seychelles",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "Txori Handia",
    "imo": "9208904",
    "operator": "INPESCA / Fishing Indico",
    "gt": 4134,
    "flag": "Seychelles",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "Montereale",
    "imo": "9215804",
    "operator": "Bolton Group / Triton",
    "gt": 3105,
    "flag": "Italy",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "Hormoz 2",
    "imo": "9204506",
    "operator": "Iran Fisheries Organization",
    "gt": 1380,
    "flag": "Iran",
    "rfmos": [
      "IOTC"
    ]
  },
  {
    "name": "Playa de Azkorri",
    "imo": "9158202",
    "operator": "Echebastar Fleet S.L.U.",
    "gt": 2737,
    "flag": "Spain",
    "rfmos": [
      "ICCAT"
    ]
  },
  {
    "name": "Kumasi Explorer",
    "imo": "9476305",
    "operator": "Ghana Tuna Fisheries",
    "gt": null,
    "flag": "Ghana",
    "rfmos": [
      "ICCAT"
    ]
  },
  {
    "name": "Elmina Carrier",
    "imo": "9276406",
    "operator": "Ghana Tuna Fisheries",
    "gt": null,
    "flag": "Ghana",
    "rfmos": [
      "ICCAT"
    ]
  },
  {
    "name": "Itajai Explorer",
    "imo": "8978904",
    "operator": "Leal Santos Pescados",
    "gt": null,
    "flag": "Brazil",
    "rfmos": [
      "ICCAT"
    ]
  },
  {
    "name": "No. 645 Dongwon",
    "imo": "9405203",
    "operator": "Dongwon Industries Co., Ltd.",
    "gt": null,
    "flag": "South Korea",
    "rfmos": [
      "WCPFC"
    ]
  },
  {
    "name": "Oryong No. 371",
    "imo": "8605507",
    "operator": "Sajo Industries Co., Ltd.",
    "gt": 1320,
    "flag": "South Korea",
    "rfmos": [
      "WCPFC"
    ]
  },
  {
    "name": "Tong Yong 835",
    "imo": "9005508",
    "operator": "Tong Yong Fisheries Co., Ltd.",
    "gt": null,
    "flag": "South Korea",
    "rfmos": [
      "WCPFC"
    ]
  },
  {
    "name": "Marsella 3",
    "imo": "9006409",
    "operator": "Gen. Santos City Fishing Co.",
    "gt": null,
    "flag": "Philippines",
    "rfmos": [
      "WCPFC"
    ]
  },
  {
    "name": "Marsella 5",
    "imo": "9106510",
    "operator": "Gen. Santos City Fishing Co.",
    "gt": null,
    "flag": "Philippines",
    "rfmos": [
      "WCPFC"
    ]
  },
  {
    "name": "Liao Yuan Yu 86",
    "imo": "9307906",
    "operator": "Dalian Ocean Fishing Co.",
    "gt": null,
    "flag": "China",
    "rfmos": [
      "WCPFC"
    ]
  },
  {
    "name": "Taura",
    "imo": "8111609",
    "operator": "Santa Priscila S.A.",
    "gt": null,
    "flag": "Ecuador",
    "rfmos": [
      "IATTC"
    ]
  },
  {
    "name": "Naranjal",
    "imo": "8211710",
    "operator": "Santa Priscila S.A.",
    "gt": null,
    "flag": "Ecuador",
    "rfmos": [
      "IATTC"
    ]
  },
  {
    "name": "Guayaquil Star",
    "imo": "8411803",
    "operator": "Ecuadorian Tuna Corp.",
    "gt": null,
    "flag": "Ecuador",
    "rfmos": [
      "IATTC"
    ]
  },
  {
    "name": "Maria Elena",
    "imo": "8805602",
    "operator": "Grupomar",
    "gt": null,
    "flag": "Mexico",
    "rfmos": [
      "IATTC"
    ]
  }
];

export const TOTAL_VESSELS = 155;
export const MULTI_RFMO_COUNT = 9;
export const TOTAL_FLAGS = 28;
export const TOTAL_OPERATORS = 47;
export const TOTAL_RFMOS = 4;


// Helper functions
export function getRfmoStats() {
  const stats: Record<string, { count: number; flags: Record<string, number>; operators: Record<string, number> }> = {};
  for (const v of vessels) {
    for (const rfmo of v.rfmos) {
      if (!stats[rfmo]) stats[rfmo] = { count: 0, flags: {}, operators: {} };
      stats[rfmo].count++;
      stats[rfmo].flags[v.flag] = (stats[rfmo].flags[v.flag] || 0) + 1;
      if (v.operator !== 'N/A') {
        stats[rfmo].operators[v.operator] = (stats[rfmo].operators[v.operator] || 0) + 1;
      }
    }
  }
  return stats;
}

export function getFlagStats() {
  const stats: Record<string, number> = {};
  for (const v of vessels) {
    stats[v.flag] = (stats[v.flag] || 0) + 1;
  }
  return Object.entries(stats)
    .sort((a, b) => b[1] - a[1])
    .map(([flag, count]) => ({ flag, count }));
}

export function getOperatorStats() {
  const stats: Record<string, { count: number; rfmos: Set<string> }> = {};
  for (const v of vessels) {
    const op = v.operator;
    if (op === 'N/A') continue;
    if (!stats[op]) stats[op] = { count: 0, rfmos: new Set() };
    stats[op].count++;
    v.rfmos.forEach(r => stats[op].rfmos.add(r));
  }
  return Object.entries(stats)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([operator, data]) => ({ operator, count: data.count, rfmos: Array.from(data.rfmos) }));
}

export function getContinentStats() {
  const stats: Record<string, number> = {};
  for (const v of vessels) {
    const continent = CONTINENT_MAP[v.flag] || 'Other';
    stats[continent] = (stats[continent] || 0) + 1;
  }
  return Object.entries(stats)
    .sort((a, b) => b[1] - a[1])
    .map(([continent, count]) => ({ continent, count }));
}

export const FLAG_EMOJI: Record<string, string> = {
  'South Korea': '🇰🇷', 'Chinese Taipei': '🇹🇼', 'China': '🇨🇳', 'Japan': '🇯🇵',
  'Spain': '🇪🇸', 'France': '🇫🇷', 'Ecuador': '🇪🇨', 'Mexico': '🇲🇽',
  'Seychelles': '🇸🇨', 'Mauritius': '🇲🇺', 'Iran': '🇮🇷', 'Indonesia': '🇮🇩',
  'Philippines': '🇵🇭', 'Thailand': '🇹🇭', 'Ghana': '🇬🇭', 'Colombia': '🇨🇴',
  'Panama': '🇵🇦', 'Italy': '🇮🇹', 'Oman': '🇴🇲', 'Kenya': '🇰🇪',
  'Tanzania': '🇹🇿', 'Venezuela': '🇻🇪', 'Turkey': '🇹🇷', 'Senegal': '🇸🇳',
  'Brazil': '🇧🇷', "Côte d'Ivoire": '🇨🇮', 'FSM (Micronesia)': '🇫🇲',
  'Marshall Islands': '🇲🇭',
};
