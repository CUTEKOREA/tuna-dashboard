import json

file_path = 'data/seasia_oem_vendors.json'
with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Information dictionary to update
info = {
    "tan-phat": {
        "employeeCount": "약 400명",
        "productionItems": "참치캔, 냉동 수산물, 냉동 과채류",
        "factoryLocation": "베트남",
        "ceo": ""
    },
    "highland-dragon": {
        "ceo": "Mr. Pham Thanh Nguyen",
        "employeeCount": "100명 이상",
        "factoryLocation": "Song Than 1 Industrial Park, Di An, Binh Duong",
        "productionItems": "참치캔, 냉동 자숙 참치 로인"
    },
    "ycc": {
        "employeeCount": "100~249명",
        "factoryLocation": "Long An, Vietnam",
        "productionItems": "참치캔 및 해산물 가공"
    },
    "foodtech": {
        "employeeCount": "약 1,200명",
        "factoryLocation": "베트남, 푸옌(Phu Yen) 지사",
        "productionItems": "캔/파우치 참치, 고등어, 자숙 참치 로인"
    },
    "hai-vuong": {
        "ceo": "Ms. Trịnh Thị Bích Hằng (Chairwoman)",
        "employeeCount": "약 3,000명",
        "factoryLocation": "Khanh Hoa, Vietnam",
        "productionItems": "참치 로인, 스테이크, 표층성 어류"
    },
    "thai-union": {
        "ceo": "Thiraphong Chansiri",
        "employeeCount": "44,000~49,000명 (글로벌)",
        "factoryLocation": "Samut Sakhon, Thailand",
        "productionItems": "참치캔, 파우치, 냉동 참치, 펫푸드 등"
    },
    "sea-value": {
        "ceo": "Mr. Poj Aramwattananont",
        "employeeCount": "약 18,000명",
        "factoryLocation": "Samut Sakhon 및 Nakhon Pathom, Thailand",
        "productionItems": "파우치 참치, 참치캔, 정어리, 고등어, 펫푸드"
    },
    "golden-prize": {
        "ceo": "Mr. Phaisal Wangthamrongvit",
        "employeeCount": "3,000~3,500명",
        "factoryLocation": "Samut Sakhon, Thailand",
        "productionItems": "캔/파우치 해산물, 참치, 정어리, 고등어"
    },
    "pataya-food": {
        "ceo": "Mr. Wichai Karanapakorn",
        "employeeCount": "4,000명 이상",
        "factoryLocation": "Samut Sakhon, Thailand (Mahachai)",
        "productionItems": "참치 파우치(1.2kg, 3kg), 참치캔, 펫푸드"
    },
    "ati": {
        "employeeCount": "약 2,975명",
        "factoryLocation": "East Java, Indonesia (Pasuruan)",
        "productionItems": "파우치 참치, 참치캔"
    }
}

for vendor in data:
    vid = vendor["id"]
    
    # Initialize basic fields
    vendor["ceo"] = ""
    vendor["factoryLocation"] = vendor.get("country", "") + (" - " + vendor.get("region", "") if vendor.get("region") else "")
    
    # Use capacityMT to set productionCapacity string
    cap = vendor.get("capacityMT", "")
    vendor["productionCapacity"] = f"일 {cap}MT" if cap else ""
    
    vendor["productionItems"] = ""
    vendor["pouchFacilities"] = "정보 없음"
    
    # Certifications from boolean flags
    certs = []
    if vendor.get("hasFDA"): certs.append("FDA")
    if vendor.get("hasEU"): certs.append("EU")
    if vendor.get("msc"): certs.append("MSC")
    vendor["certifications"] = ", ".join(certs) if certs else "정보 없음"
    
    vendor["employeeCount"] = ""

    # Update with specific fetched info
    if vid in info:
        vendor.update(info[vid])

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("JSON updated successfully.")
