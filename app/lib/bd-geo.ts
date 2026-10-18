export interface BDDivision {
  id: string;
  nameEn: string;
  nameBn: string;
}

export interface BDDistrict {
  id: string;
  divisionId: string;
  nameEn: string;
  nameBn: string;
  upazilas: { nameEn: string; nameBn: string }[];
}

export const BD_DIVISIONS: BDDivision[] = [
  { id: "dhaka", nameEn: "Dhaka", nameBn: "ঢাকা" },
  { id: "chattogram", nameEn: "Chattogram", nameBn: "চট্টগ্রাম" },
  { id: "rajshahi", nameEn: "Rajshahi", nameBn: "রাজশাহী" },
  { id: "khulna", nameEn: "Khulna", nameBn: "খুলনা" },
  { id: "barishal", nameEn: "Barishal", nameBn: "বরিশাল" },
  { id: "sylhet", nameEn: "Sylhet", nameBn: "সিলেট" },
  { id: "rangpur", nameEn: "Rangpur", nameBn: "রংপুর" },
  { id: "mymensingh", nameEn: "Mymensingh", nameBn: "ময়মনসিংহ" },
];

export const BD_DISTRICTS: BDDistrict[] = [
  // Dhaka Division
  {
    id: "dhaka_dist",
    divisionId: "dhaka",
    nameEn: "Dhaka",
    nameBn: "ঢাকা",
    upazilas: [
      { nameEn: "Dhanmondi", nameBn: "ধানমন্ডি" },
      { nameEn: "Gulshan", nameBn: "গুলশান" },
      { nameEn: "Banani", nameBn: "বনানী" },
      { nameEn: "Uttara", nameBn: "উত্তরা" },
      { nameEn: "Mirpur", nameBn: "মিরপুর" },
      { nameEn: "Mohammadpur", nameBn: "মোহাম্মদপুর" },
      { nameEn: "Motijheel", nameBn: "মতিঝিল" },
      { nameEn: "Badda", nameBn: "বাড্ডা" },
      { nameEn: "Khilgaon", nameBn: "খিলগাঁও" },
      { nameEn: "Old Dhaka", nameBn: "পুরান ঢাকা" },
      { nameEn: "Savar", nameBn: "সাভার" },
      { nameEn: "Keraniganj", nameBn: "কেরানীগঞ্জ" },
      { nameEn: "Dhamrai", nameBn: "ধামরাই" },
    ],
  },
  {
    id: "gazipur",
    divisionId: "dhaka",
    nameEn: "Gazipur",
    nameBn: "গাজীপুর",
    upazilas: [
      { nameEn: "Gazipur Sadar", nameBn: "গাজীপুর সদর" },
      { nameEn: "Tongi", nameBn: "টঙ্গী" },
      { nameEn: "Kaliakair", nameBn: "কালিয়াকৈর" },
      { nameEn: "Sreepur", nameBn: "শ্রীপুর" },
      { nameEn: "Kapasia", nameBn: "কাপাসিয়া" },
    ],
  },
  {
    id: "narayanganj",
    divisionId: "dhaka",
    nameEn: "Narayanganj",
    nameBn: "নারায়ণগঞ্জ",
    upazilas: [
      { nameEn: "Narayanganj Sadar", nameBn: "নারায়ণগঞ্জ সদর" },
      { nameEn: "Bandar", nameBn: "বন্দর" },
      { nameEn: "Sonargaon", nameBn: "সোনারগাঁও" },
      { nameEn: "Rupganj", nameBn: "রূপগঞ্জ" },
      { nameEn: "Araihazar", nameBn: "আড়াইহাজার" },
    ],
  },
  {
    id: "tangail",
    divisionId: "dhaka",
    nameEn: "Tangail",
    nameBn: "টাঙ্গাইল",
    upazilas: [
      { nameEn: "Tangail Sadar", nameBn: "টাঙ্গাইল সদর" },
      { nameEn: "Delduar", nameBn: "দেলদুয়ার" },
      { nameEn: "Ghatail", nameBn: "ঘাটাইল" },
      { nameEn: "Madhupur", nameBn: "মধুপুর" },
    ],
  },
  {
    id: "faridpur",
    divisionId: "dhaka",
    nameEn: "Faridpur",
    nameBn: "ফরিদপুর",
    upazilas: [
      { nameEn: "Faridpur Sadar", nameBn: "ফরিদপুর সদর" },
      { nameEn: "Boalmari", nameBn: "বোয়ালমারী" },
      { nameEn: "Bhanga", nameBn: "ভাঙ্গা" },
    ],
  },

  // Chattogram Division
  {
    id: "chattogram_dist",
    divisionId: "chattogram",
    nameEn: "Chattogram",
    nameBn: "চট্টগ্রাম",
    upazilas: [
      { nameEn: "Agrabad", nameBn: "আগ্রাবাদ" },
      { nameEn: "Kotwali", nameBn: "কোতোয়ালী" },
      { nameEn: "Panchlaish", nameBn: "পাঁচলাইশ" },
      { nameEn: "Pahartali", nameBn: "পাহাড়তলী" },
      { nameEn: "Halishahar", nameBn: "হালিশহর" },
      { nameEn: "Hathazari", nameBn: "হাটহাজারী" },
      { nameEn: "Sitakunda", nameBn: "সীতাকুণ্ড" },
      { nameEn: "Patiya", nameBn: "পটিয়া" },
    ],
  },
  {
    id: "coxs_bazar",
    divisionId: "chattogram",
    nameEn: "Cox's Bazar",
    nameBn: "কক্সবাজার",
    upazilas: [
      { nameEn: "Cox's Bazar Sadar", nameBn: "কক্সবাজার সদর" },
      { nameEn: "Chakaria", nameBn: "চকোরিয়া" },
      { nameEn: "Teknaf", nameBn: "টেকনাফ" },
      { nameEn: "Ramu", nameBn: "রামু" },
    ],
  },
  {
    id: "cumilla",
    divisionId: "chattogram",
    nameEn: "Cumilla",
    nameBn: "কুমিল্লা",
    upazilas: [
      { nameEn: "Cumilla Adarsha Sadar", nameBn: "কুমিল্লা আদর্শ সদর" },
      { nameEn: "Laksam", nameBn: "লাকসাম" },
      { nameEn: "Chandina", nameBn: "চান্দিনা" },
      { nameEn: "Daudkandi", nameBn: "দাউদকান্দি" },
    ],
  },
  {
    id: "feni",
    divisionId: "chattogram",
    nameEn: "Feni",
    nameBn: "ফেনী",
    upazilas: [
      { nameEn: "Feni Sadar", nameBn: "ফেনী সদর" },
      { nameEn: "Daganbhuiyan", nameBn: "দাগনভূঞা" },
      { nameEn: "Chhagalnaiya", nameBn: "ছাগলনাইয়া" },
    ],
  },
  {
    id: "brahmanbaria",
    divisionId: "chattogram",
    nameEn: "Brahmanbaria",
    nameBn: "ব্রাহ্মণবাড়িয়া",
    upazilas: [
      { nameEn: "Brahmanbaria Sadar", nameBn: "ব্রাহ্মণবাড়িয়া সদর" },
      { nameEn: "Ashuganj", nameBn: "আশুগঞ্জ" },
      { nameEn: "Sarail", nameBn: "সরাইল" },
    ],
  },

  // Sylhet Division
  {
    id: "sylhet_dist",
    divisionId: "sylhet",
    nameEn: "Sylhet",
    nameBn: "সিলেট",
    upazilas: [
      { nameEn: "Sylhet Sadar", nameBn: "সিলেট সদর" },
      { nameEn: "Beanibazar", nameBn: "বিয়ানীবাজার" },
      { nameEn: "Golapganj", nameBn: "গোলাপগঞ্জ" },
      { nameEn: "Gowainghat", nameBn: "গোয়াইনঘাট" },
    ],
  },
  {
    id: "moulvibazar",
    divisionId: "sylhet",
    nameEn: "Moulvibazar",
    nameBn: "মৌলভীবাজার",
    upazilas: [
      { nameEn: "Moulvibazar Sadar", nameBn: "মৌলভীবাজার সদর" },
      { nameEn: "Sreemangal", nameBn: "শ্রীমঙ্গল" },
      { nameEn: "Kulaura", nameBn: "কুলাউড়া" },
    ],
  },

  // Rajshahi Division
  {
    id: "rajshahi_dist",
    divisionId: "rajshahi",
    nameEn: "Rajshahi",
    nameBn: "রাজশাহী",
    upazilas: [
      { nameEn: "Boalia", nameBn: "বোয়ালিয়া" },
      { nameEn: "Motihar", nameBn: "মতিহার" },
      { nameEn: "Rajpara", nameBn: "রাজপাড়া" },
      { nameEn: "Paba", nameBn: "পবা" },
      { nameEn: "Godagari", nameBn: "গোদাগাড়ী" },
    ],
  },
  {
    id: "bogura",
    divisionId: "rajshahi",
    nameEn: "Bogura",
    nameBn: "বগুড়া",
    upazilas: [
      { nameEn: "Bogura Sadar", nameBn: "বগুড়া সদর" },
      { nameEn: "Sherpur", nameBn: "শেরপুর" },
      { nameEn: "Shibganj", nameBn: "শিবগঞ্জ" },
    ],
  },
  {
    id: "pabna",
    divisionId: "rajshahi",
    nameEn: "Pabna",
    nameBn: "পাবনা",
    upazilas: [
      { nameEn: "Pabna Sadar", nameBn: "পাবনা সদর" },
      { nameEn: "Ishwardi", nameBn: "ঈশ্বরদী" },
      { nameEn: "Santhia", nameBn: "সাঁথিয়া" },
    ],
  },

  // Khulna Division
  {
    id: "khulna_dist",
    divisionId: "khulna",
    nameEn: "Khulna",
    nameBn: "খুলনা",
    upazilas: [
      { nameEn: "Khulna Sadar", nameBn: "খুলনা সদর" },
      { nameEn: "Sonadanga", nameBn: "সোনাডাঙ্গা" },
      { nameEn: "Khalishpur", nameBn: "খালিশপুর" },
      { nameEn: "Dumuria", nameBn: "ডুমুরিয়া" },
    ],
  },
  {
    id: "jashore",
    divisionId: "khulna",
    nameEn: "Jashore",
    nameBn: "যশোর",
    upazilas: [
      { nameEn: "Jashore Sadar", nameBn: "যশোর সদর" },
      { nameEn: "Jhikargachha", nameBn: "ঝিকরগাছা" },
      { nameEn: "Benapole", nameBn: "বেনাপোল" },
    ],
  },
  {
    id: "kushtia",
    divisionId: "khulna",
    nameEn: "Kushtia",
    nameBn: "কুষ্টিয়া",
    upazilas: [
      { nameEn: "Kushtia Sadar", nameBn: "কুষ্টিয়া সদর" },
      { nameEn: "Kumarkhali", nameBn: "কুমারখালী" },
    ],
  },

  // Barishal Division
  {
    id: "barishal_dist",
    divisionId: "barishal",
    nameEn: "Barishal",
    nameBn: "বরিশাল",
    upazilas: [
      { nameEn: "Barishal Sadar", nameBn: "বরিশাল সদর" },
      { nameEn: "Babuganj", nameBn: "বাবুগঞ্জ" },
      { nameEn: "Bakerganj", nameBn: "বাকেরগঞ্জ" },
    ],
  },

  // Rangpur Division
  {
    id: "rangpur_dist",
    divisionId: "rangpur",
    nameEn: "Rangpur",
    nameBn: "রংপুর",
    upazilas: [
      { nameEn: "Rangpur Sadar", nameBn: "রংপুর সদর" },
      { nameEn: "Pirganj", nameBn: "পীরগঞ্জ" },
      { nameEn: "Badarganj", nameBn: "বদরগঞ্জ" },
    ],
  },
  {
    id: "dinajpur",
    divisionId: "rangpur",
    nameEn: "Dinajpur",
    nameBn: "দিনাজপুর",
    upazilas: [
      { nameEn: "Dinajpur Sadar", nameBn: "দিনাজপুর সদর" },
      { nameEn: "Birganj", nameBn: "বীরগঞ্জ" },
    ],
  },

  // Mymensingh Division
  {
    id: "mymensingh_dist",
    divisionId: "mymensingh",
    nameEn: "Mymensingh",
    nameBn: "ময়মনসিংহ",
    upazilas: [
      { nameEn: "Mymensingh Sadar", nameBn: "ময়মনসিংহ সদর" },
      { nameEn: "Muktagachha", nameBn: "মুক্তাগাছা" },
      { nameEn: "Trishal", nameBn: "ত্রিশাল" },
      { nameEn: "Bhaluka", nameBn: "ভালুকা" },
    ],
  },
];

export function getDistrictsByDivision(divisionId: string): BDDistrict[] {
  return BD_DISTRICTS.filter((d) => d.divisionId === divisionId);
}

export function getUpazilasByDistrict(districtId: string): { nameEn: string; nameBn: string }[] {
  const district = BD_DISTRICTS.find((d) => d.id === districtId || d.nameEn.toLowerCase() === districtId.toLowerCase());
  return district ? district.upazilas : [];
}
