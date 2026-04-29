// NandaNic.ts - Specialized Hospital/RHU Diagnostic & Intervention Library
// Ref: NANDA-I 2021-2023, NIC 7th Edition, NOC 6th Edition

export interface ClinicalProfile {
  diagnosis: string;
  explanation: string;
  nic: string[];
  noc: string[];
  labOrders?: string[];
  education?: string[];
}

export const CLINICAL_MAP: Record<string, ClinicalProfile> = {
  hypertension: {
    diagnosis: "BA41.1 (Essential Hypertension) — NANDA-I 00204 (Ineffective Health Management)",
    explanation: "Based on BP > 140/90 or documented history. Risk for cardiovascular complications detected.",
    nic: [
      "NIC 4040 (Cardiac Care): Monitor Blood Pressure every 4 hours",
      "NIC 6610 (Risk Identification): Screen for hereditary cardiovascular risks",
      "NIC 5510 (Health Education): Teach low-sodium Diet (DASH)",
      "NIC 4044 (Cardiac Care: Rehabilitative): Establish exercise tolerance"
    ],
    noc: [
      "NOC 2300 (Blood Pressure Control): Target <130/80 mmHg",
      "NOC 1603 (Health-Seeking Behavior): Patient identifies DASH diet items"
    ],
    labOrders: ["Lipid Profile", "Serum Creatinine", "ECG (12-Lead)", "Chest X-ray"]
  },
  diabetes: {
    diagnosis: "5A11 (Type 2 Diabetes Mellitus) — NANDA-I 00179 (Risk for Unstable Blood Glucose Level)",
    explanation: "Based on abnormal CBG readings or glycemic history. Requires strict glucose monitoring and education.",
    nic: [
      "NIC 2120 (Hyperglycemia Management): Monitor CBG levels pre-/post-prandial",
      "NIC 5614 (Teaching: Prescribed Diet): Explain carbohydrate counting",
      "NIC 2130 (Hypoglycemia Management): Identify signs of 'cold and clammy'",
      "NIC 1100 (Nutrition Management): Consult with RHU Dietician/Nutritionist"
    ],
    noc: [
      "NOC 2300 (Blood Glucose Level): Maintain 70-130 mg/dL",
      "NOC 0204 (Self-Care: Management): Patient demonstrates correct lancet use"
    ],
    labOrders: ["HbA1c", "Chem 7", "Microalbuminuria (Urine)", "Foot Sensitivity Test"]
  },
  bronchitis: {
    diagnosis: "CA41 (Acute Bronchitis) — NANDA-I 00031 (Ineffective Airway Clearance)",
    explanation: "Observed respiratory distress or acute cough with secretions. Intervention focused on airway patency.",
    nic: [
      "NIC 3140 (Airway Management): Instruct in 'huff coughing' technique",
      "NIC 3350 (Respiratory Monitoring): Auscultate breath sounds for adventitious crackles",
      "NIC 3160 (Aspiration Precautions): Maintain upright position during intake",
      "NIC 3230 (Chest Physiotherapy): Perform percussion if secretions are viscous"
    ],
    noc: [
      "NOC 0410 (Respiratory Status: Airway Patency): Absence of rhonchi",
      "NOC 0802 (Vital Signs): Respiratory rate 12-20 bpm"
    ],
    labOrders: ["Sputum Culture", "Chest X-ray (PA)", "CBC with Differential"]
  },
  uti: {
    diagnosis: "GB51.0 (Acute Cystitis) — NANDA-I 00016 (Impaired Urinary Elimination)",
    explanation: "Reported dysuria or urinary frequency. Protocol targets infection clearance and hydration.",
    nic: [
      "NIC 0590 (Urinary Elimination Management): Increase fluid intake to 2.5L/day",
      "NIC 1876 (Self-Care: Toileting): Teach proper perineal hygiene (front-to-back)",
      "NIC 2300 (Medication Administration): Ensure full course of prescribed antibiotics",
      "NIC 1380 (Hyperthermia Treatment): Monitor core temperature strictly"
    ],
    noc: [
      "NOC 0503 (Urinary Elimination): Clear urine without dysuria",
      "NOC 0800 (Thermoregulation): Afebrile state"
    ],
    labOrders: ["Urinalysis", "Urine Culture", "KUB Ultrasound (if recurrent)"]
  },
  prenatal: {
    diagnosis: "QA00 (Maternal Care for Known or Suspected Malpresentation) — NANDA-I 00208 (Readiness for Enhanced Childbearing Process)",
    explanation: "Active pregnancy tracking. Goal is to optimize maternal-fetal outcome and screen for pre-eclampsia.",
    nic: [
      "NIC 6710 (Prenatal Care): Track Fundal Height and Fetal Heart Tone (FHT)",
      "NIC 5244 (Counselling: Nutrition during Pregnancy): Emphasize Iron and Folic Acid",
      "NIC 6700 (Health Screening): Check for signs of Pre-eclampsia (edema, proteinuria)",
      "NIC 6720 (Neonatal Care): Discuss breastfeeding preparation"
    ],
    noc: [
      "NOC 2509 (Maternal Status: Antepartum): Weight gain within range",
      "NOC 0111 (Fetal Status: Antepartum): FHT 120-160 bpm"
    ],
    labOrders: ["OGTT (75g)", "HBsAg", "CBC", "Urine Protein (Dipstick)"]
  },
  asthma: {
    diagnosis: "CA41.2 (Asthma) — NANDA-I 00004 (Impaired Gas Exchange)",
    explanation: "Chronic respiratory patterns with risk of exacerbation. Monitoring SpO2 and inhaler technique is critical.",
    nic: [
      "NIC 3320 (Oxygen Therapy): Maintain SpO2 > 94% during exacerbation",
      "NIC 3250 (Cough Enhancement): Assist with deep breathing exercises",
      "NIC 2311 (Medication Administration: Inhalation): Verify Spacer/MDI technique",
      "NIC 6610 (Risk Identification): Identify environmental triggers (smoke, dust)"
    ],
    noc: [
      "NOC 0402 (Respiratory Status: Gas Exchange): SpO2 within normal limits",
      "NOC 0410 (Respiratory Status: Airway Patency): Peak flow in 'green' zone"
    ],
    labOrders: ["Peak Flow Meter reading", "Chest X-ray", "Pulse Oximetry"]
  },
  dengue: {
    diagnosis: "1D2Z (Dengue, unspecified) — NANDA-I 00007 (Hyperthermia)",
    explanation: "Fever + endemic risk. Focus on fluid resuscitation and avoiding high-risk medications (NSAIDs).",
    nic: [
      "NIC 1380 (Hyperthermia Treatment): Administer tepid sponge bath (TSB)",
      "NIC 4120 (Fluid Management): Strict input/output oral fluid monitoring (ORS)",
      "NIC 6680 (Vital Signs Monitoring): Check for petechiae and bleeding signs",
      "NIC 2300 (Medication Administration): Avoid Aspirin/NSAIDS; use Paracetamol only"
    ],
    noc: [
      "NOC 0800 (Thermoregulation): Temperature within 36.5-37.5°C",
      "NOC 0409 (Coagulation Status): Platelet count stabilizing"
    ],
    labOrders: ["CBC (Platelet/Hct)", "Dengue NS1/IgG/IgM Rapid Test"]
  },
  tb: {
    diagnosis: "1B10.0 (Tuberculosis of lung) — NANDA-I 00004 (Impaired Gas Exchange)",
    explanation: "Persistent cough >2 weeks. Requires GeneXpert verification and strict DOTS adherence.",
    nic: [
      "NIC 3250 (Cough Enhancement): Sputum collection for GeneXpert",
      "NIC 2301 (Medication Administration: Enteral): DOTS (Directly Observed Treatment Short-course)",
      "NIC 6550 (Infection Protection): Instruct in respiratory etiquette (masking)",
      "NIC 1100 (Nutrition Management): High-protein, high-calorie diet for recovery"
    ],
    noc: [
      "NOC 0410 (Respiratory Status: Airway Patency): Sputum clearance",
      "NOC 1902 (Risk Control): Adherence to 6-month treatment regimen"
    ],
    labOrders: ["GeneXpert (Sputum)", "Chest X-ray (Apical View)", "Sputum Smear (AFB)"]
  },
  skin: {
    diagnosis: "EL3Z (Dermatitis, unspecified) — NANDA-I 00046 (Impaired Skin Integrity)",
    explanation: "Localized skin irritation or inflammation. Focused on infection prevention and symptomatic relief.",
    nic: [
      "NIC 3590 (Skin Care: Topical): Application of prescribed hydrocortisone/calamine",
      "NIC 3550 (Pruritus Management): Keep nails short to prevent excoriation",
      "NIC 5600 (Teaching: Individual): Identify environmental allergens or plants",
      "NIC 3520 (Pressure Ulcer Care): Keep area clean and dry"
    ],
    noc: [
      "NOC 1101 (Tissue Integrity: Skin): Absence of redness/itching",
      "NOC 1902 (Risk Control): Patient avoids scratching"
    ],
    labOrders: ["Skin Scraping (if fungal suspected)", "Wound Culture"]
  }
};

export function getNandaNic(concern: string, bp?: string, cbg?: string): ClinicalProfile {
  const normConcern = concern.toLowerCase();
  
  // Specific BP/CBG logic first (Quantitative)
  const bpSys = bp ? parseInt(bp.split('/')[0]) : 0;
  const cbgVal = cbg ? parseInt(cbg) : 0;

  if (bpSys >= 140) return CLINICAL_MAP.hypertension;
  if (cbgVal > 0 && (cbgVal < 70 || cbgVal > 180)) return CLINICAL_MAP.diabetes;

  // Keyword matching (Qualitative)
  if (normConcern.includes('bp') || normConcern.includes('tension')) return CLINICAL_MAP.hypertension;
  if (normConcern.includes('sugar') || normConcern.includes('diabetes')) return CLINICAL_MAP.diabetes;
  if (normConcern.includes('cough') || normConcern.includes('tb') || normConcern.includes('tuberculosis')) return CLINICAL_MAP.tb;
  if (normConcern.includes('dengue') || normConcern.includes('fever') || normConcern.includes('lagnat')) return CLINICAL_MAP.dengue;
  if (normConcern.includes('asthma') || normConcern.includes('wheezing')) return CLINICAL_MAP.asthma;
  if (normConcern.includes('itch') || normConcern.includes('rash') || normConcern.includes('skin')) return CLINICAL_MAP.skin;
  if (normConcern.includes('uti') || normConcern.includes('urine') || normConcern.includes('pee')) return CLINICAL_MAP.uti;
  if (normConcern.includes('buntis') || normConcern.includes('pregnant') || normConcern.includes('prenatal')) return CLINICAL_MAP.prenatal;
  if (normConcern.includes('bronchitis')) return CLINICAL_MAP.bronchitis;

  // Default fallback
  return {
    diagnosis: "Z00.0 (General Adult Medical Examination) — NANDA-I 00262 (Health Self-Management)",
    explanation: "General wellness check. Encouraging preventive monitoring and health-seeking behavior.",
    nic: [
      "NIC 5510 (Health Education): General wellness and preventive care",
      "NIC 6610 (Risk Identification): Update family medical history",
      "NIC 5440 (Support System Enhancement): Identify community health resources"
    ],
    noc: [
      "NOC 1606 (Health Compliance Behavior): Adhere to follow-up schedule",
      "NOC 1805 (Knowledge: Health Resources): Patient knows RHU schedule"
    ]
  };
}
