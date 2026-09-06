export const STORAGE_KEY = 'ayush-connect-saved'

export function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const FOUNDATION_QUESTIONS = [
  {
    q: 'Which principle is most important when documenting a clinical observation?',
    options: ['Recall from memory later', 'Write it immediately and clearly', 'Share it only verbally', 'Wait until the internship ends'],
    answer: 1,
    skill: 'Documentation',
  },
  {
    q: 'Good laboratory practice starts with:',
    options: ['Skipping calibration to save time', 'Personal protective equipment and labelled samples', 'Using unmarked containers', 'Working without a supervisor present'],
    answer: 1,
    skill: 'Lab safety',
  },
  {
    q: 'When you do not know an answer in clinic, the safest action is to:',
    options: ['Guess confidently', 'Ask a supervisor and record the query', 'Search social media', 'Change the topic'],
    answer: 1,
    skill: 'Clinical ethics',
  },
]

export const SPECIALIZATIONS = [
  {
    id: 'qc',
    title: 'Pharmacognosy & Quality Control',
    shortTitle: 'Pharmacognosy & QC',
    icon: '🔬',
    description: 'Crude drug macroscopic & microscopic identification, purity assays, and ash/moisture testing.',
    skills: ['Pharmacognosy', 'QC testing', 'Lab safety'],
    questions: [
      {
        q: 'Pharmacognosy is primarily concerned with:',
        options: ['Hospital billing software', 'Medicinal plants and natural products', 'Civil construction materials', 'Network security'],
        answer: 1,
        skill: 'Pharmacognosy',
      },
      {
        q: 'A quality-control check for herbal raw material should include:',
        options: ['Identity, purity, and moisture', 'Only the selling price', 'Colour of the packaging alone', 'Social media reviews'],
        answer: 0,
        skill: 'QC testing',
      },
      {
        q: 'Macroscopic and microscopic evaluation of a crude drug primarily confirms:',
        options: ['Shipping container dimensions', 'Botanical identity and presence of adulterants', 'Annual sales projections', 'Warehouse rent terms'],
        answer: 1,
        skill: 'Pharmacognosy',
      },
    ],
  },
  {
    id: 'formulations',
    title: 'Ayurvedic Formulations & Pharmaceutics',
    shortTitle: 'Formulations & R&D',
    icon: '🧪',
    description: 'Classical & proprietary dosage forms, kwatha/churna processing, and in-process tablet QC.',
    skills: ['Formulations', 'GMP', 'Documentation'],
    questions: [
      {
        q: 'In classical Kwatha (decoction) preparation, the standard reduction of water is typically to:',
        options: ['1/4th of the initial water volume', 'Double the initial volume', '100% dry powder without liquid', 'Evaporated completely to smoke'],
        answer: 0,
        skill: 'Formulations',
      },
      {
        q: 'The primary pharmaceutical purpose of Bhavana (wet trituration with herbal extract) is:',
        options: ['Only changing the physical color', 'Potentiation, particle size reduction, and homogenous bio-availability', 'Delaying production time', 'Replacing cleaning SOPs'],
        answer: 1,
        skill: 'Formulations',
      },
      {
        q: 'Crucial in-process quality parameters for compressed herbal tablets include:',
        options: ['Only warehouse ambient lighting', 'Hardness, friability, and disintegration time', 'Staff attendance roster', 'Vehicle parking permits'],
        answer: 1,
        skill: 'GMP',
      },
    ],
  },
  {
    id: 'clinical',
    title: 'Clinical Diagnosis & Patient Care',
    shortTitle: 'Clinical & Patient Care',
    icon: '🩺',
    description: 'OPD history taking, Rogi-Roga Pariksha, Panchakarma protocols, and patient ethics.',
    skills: ['Patient care', 'Clinical ethics', 'Documentation'],
    questions: [
      {
        q: 'Ashtavidha Pariksha (eightfold clinical examination) in Ayurveda includes assessment of:',
        options: ['Only blood pressure monitor calibration', 'Nadi (pulse), Mutra (urine), Mala (stool), Jihva (tongue), etc.', 'Billing cycle and insurance limits', 'Hospital architecture and landscaping'],
        answer: 1,
        skill: 'Patient care',
      },
      {
        q: 'Before administering classical Panchakarma (Pradhanakarma), the mandatory preparatory step is:',
        options: ['Immediate surgical intervention', 'Poorvakarma (Deepana, Pachana, Snehana, and Swedana)', 'Discharging the patient with no instructions', 'Starting high-intensity strenuous exercise'],
        answer: 1,
        skill: 'Patient care',
      },
      {
        q: 'When a patient presents with sudden neurological deficit or acute chest pain in an AYUSH OPD, the ethical standard is:',
        options: ['Delay referral and attempt sole experimental therapy', 'Immediate stabilization and expedited emergency tertiary referral', 'Ignore the symptom if not in ancient textbooks', 'Tell the patient to return after one month'],
        answer: 1,
        skill: 'Clinical ethics',
      },
    ],
  },
  {
    id: 'regulatory',
    title: 'Herbal Standardization & Regulatory Affairs',
    shortTitle: 'Standardization & Regulations',
    icon: '📋',
    description: 'Schedule T GMP compliance, Pharmacopoeial standards (API), heavy metal limits, and BMR audits.',
    skills: ['GMP', 'Documentation', 'QC testing'],
    questions: [
      {
        q: 'Which schedule under the Indian Drugs and Cosmetics Act governs Good Manufacturing Practices (GMP) for ASU drugs?',
        options: ['Schedule H', 'Schedule T', 'Schedule X', 'Schedule Y'],
        answer: 1,
        skill: 'GMP',
      },
      {
        q: 'Heavy metal limits compliance in AYUSH formulations (Lead, Cadmium, Mercury, Arsenic) is governed by:',
        options: ['Ayurvedic Pharmacopoeia of India (API) & WHO safety limits', 'Voluntary social media polls', 'Packaging label aesthetics only', 'Courier delivery weight limits'],
        answer: 0,
        skill: 'QC testing',
      },
      {
        q: 'Why is a Batch Manufacturing Record (BMR) legally required in AYUSH manufacturing?',
        options: ['Traceability, process reproducibility, and regulatory compliance', 'It is optional marketing copy', 'To slow production intentionally', 'Only for export trade fair displays'],
        answer: 0,
        skill: 'Documentation',
      },
    ],
  },
]

export const ALL_SPECIALIZATION_QUESTIONS = SPECIALIZATIONS.flatMap((s) => s.questions)
export const SPECIALIZATION_QUESTIONS = SPECIALIZATIONS[0].questions

export const SKILL_ROADMAP = {
  Documentation: {
    why: 'Companies need same-day, traceable notes.',
    steps: [
      'Week 1: Practise SOAP notes after every mock case.',
      'Week 2: Fill a sample batch record with no blank fields.',
      'Week 3: Get a mentor to audit one full document set.',
    ],
  },
  'Lab safety': {
    why: 'QC labs will not take an intern who skips PPE or labels.',
    steps: [
      'Week 1: Memorise PPE and chemical labelling rules.',
      'Week 2: Walk a mock lab checklist before each practical.',
      'Week 3: Shadow a QC technician for one safety round.',
    ],
  },
  'Clinical ethics': {
    why: 'Clinics require consent, supervision, and honest limits.',
    steps: [
      'Week 1: Revise informed consent and intern scope.',
      'Week 2: Role-play “I don’t know — I will ask my supervisor”.',
      'Week 3: Observe OPD and write three supervised case notes.',
    ],
  },
  Pharmacognosy: {
    why: 'Raw-material identity is the first QC gate.',
    steps: [
      'Week 1: Revise macroscopic / microscopic identity of 10 drugs.',
      'Week 2: Practise voucher specimen and herbarium basics.',
      'Week 3: Identify 5 unknown samples with a teacher.',
    ],
  },
  'QC testing': {
    why: 'Jobs need identity, purity, ash, and moisture workflows.',
    steps: [
      'Week 1: Write the SOP for moisture and ash value.',
      'Week 2: Run one mock assay and record results.',
      'Week 3: Compare your sheet with a real COA.',
    ],
  },
  GMP: {
    why: 'Manufacturers treat batch records as legal documents.',
    steps: [
      'Week 1: Study a blank BMR and deviation form.',
      'Week 2: Fill a mock batch with timestamps and signatures.',
      'Week 3: List 5 typical deviations and how to report them.',
    ],
  },
  Formulations: {
    why: 'R&D internships need process steps, not only theory.',
    steps: [
      'Week 1: Map kwatha / churna / tablet steps to parameters.',
      'Week 2: Draft a bill of materials for one product.',
      'Week 3: Write in-process checks for a small batch.',
    ],
  },
  'Patient care': {
    why: 'Clinics expect safe observation and structured history.',
    steps: [
      'Week 1: Practise a full history template.',
      'Week 2: Learn red-flag symptoms and referral paths.',
      'Week 3: Sit in 4 supervised OPD sessions and write notes.',
    ],
  },
}

export const JOB_REQUIREMENTS = {
  'himalaya-qc': [
    { skill: 'Pharmacognosy', weight: 30 },
    { skill: 'QC testing', weight: 35 },
    { skill: 'GMP', weight: 20 },
    { skill: 'Documentation', weight: 15 },
  ],
  'patanjali-rd': [
    { skill: 'Formulations', weight: 40 },
    { skill: 'Documentation', weight: 25 },
    { skill: 'Lab safety', weight: 20 },
    { skill: 'GMP', weight: 15 },
  ],
  'kottakkal-clinic': [
    { skill: 'Patient care', weight: 40 },
    { skill: 'Clinical ethics', weight: 30 },
    { skill: 'Documentation', weight: 20 },
    { skill: 'Lab safety', weight: 10 },
  ],
  'company-qc': [
    { skill: 'QC testing', weight: 35 },
    { skill: 'Pharmacognosy', weight: 25 },
    { skill: 'GMP', weight: 25 },
    { skill: 'Documentation', weight: 15 },
  ],
  'company-clinic': [
    { skill: 'Patient care', weight: 35 },
    { skill: 'Clinical ethics', weight: 30 },
    { skill: 'Documentation', weight: 25 },
    { skill: 'Lab safety', weight: 10 },
  ],
}

export function requirementsFor(job) {
  if (JOB_REQUIREMENTS[job.id]) return JOB_REQUIREMENTS[job.id]
  const text = `${job.role || ''} ${job.title || ''} ${(job.tags || []).join(' ')}`.toLowerCase()
  if (text.includes('clinic') || text.includes('patient')) return JOB_REQUIREMENTS['kottakkal-clinic']
  if (text.includes('formulat') || text.includes('r&d')) return JOB_REQUIREMENTS['patanjali-rd']
  return JOB_REQUIREMENTS['himalaya-qc']
}

export function skillLevel(skill, foundation, specialization, practiced) {
  const allQs = [...FOUNDATION_QUESTIONS, ...ALL_SPECIALIZATION_QUESTIONS]
  const related = allQs.filter((q) => q.skill === skill)
  let score = 45
  if (related.length) {
    const isFoundation = FOUNDATION_QUESTIONS.some((q) => q.skill === skill)
    const answers = isFoundation ? foundation : specialization
    if (answers?.answers) {
      const qBank = answers.questions || (isFoundation ? FOUNDATION_QUESTIONS : ALL_SPECIALIZATION_QUESTIONS)
      const hits = related.filter((q) => {
        const idx = qBank.findIndex((item) => item.q === q.q)
        return idx !== -1 && answers.answers[idx] === q.answer
      }).length
      score = hits > 0 ? Math.round((hits / Math.max(1, related.length)) * 100) : (answers.percent || 45)
    } else if (isFoundation && foundation) {
      score = foundation.percent
    } else if (specialization) {
      score = specialization.percent
    }
  } else if (skill === 'Formulations' || skill === 'Patient care') {
    score = specialization?.percent ?? foundation?.percent ?? 45
  }
  if (practiced) score = Math.min(100, score + 30)
  return score
}

export function matchReport(job, foundation, specialization, practicedSkills = {}) {
  const requirements = requirementsFor(job)
  const rows = requirements.map((req) => {
    const you = skillLevel(req.skill, foundation, specialization, practicedSkills[req.skill])
    const gapShare = Math.round((req.weight * Math.max(0, 100 - you)) / 100)
    return {
      skill: req.skill,
      weight: req.weight,
      you,
      companyNeeds: 100,
      gapShare,
      matched: you >= 80,
      roadmap: SKILL_ROADMAP[req.skill],
    }
  })
  const unmatchedPercent = Math.min(100, rows.reduce((sum, row) => sum + row.gapShare, 0))
  const match = Math.max(0, 100 - unmatchedPercent)
  return { match, unmatchedPercent, rows, missing: rows.filter((row) => row.gapShare > 0) }
}

export const INDUSTRY_KEYWORDS = [
  'GMP & Schedule T Compliance',
  'Pharmacognosy & Raw Material Testing',
  'Formulation R&D & Pharmaceutics',
  'Clinical Diagnosis & Patient Care',
  'Quality Control (QC) & Assay Testing',
  'Herbal Standardization & API Standards',
  'Regulatory Affairs & Documentation (BMR/COA)',
  'Pharmacovigilance & Drug Safety',
  'Clinical Trials & Good Clinical Practice (GCP)',
  'Ayush Health Informatics & EMR',
]

export const INTERNSHIPS = [
  {
    id: 'himalaya-qc',
    company: 'Himalaya Wellness',
    role: 'Quality Control Intern',
    location: 'Bengaluru',
    match: 92,
    tags: ['Pharmacognosy', 'QC', 'Herbal'],
    keywords: [
      'Quality Control (QC) & Assay Testing',
      'Pharmacognosy & Raw Material Testing',
      'GMP & Schedule T Compliance',
    ],
  },
  {
    id: 'patanjali-rd',
    company: 'Patanjali Research',
    role: 'Formulation R&D Intern',
    location: 'Haridwar',
    match: 84,
    tags: ['Formulations', 'Lab', 'Documentation'],
    keywords: [
      'Formulation R&D & Pharmaceutics',
      'Herbal Standardization & API Standards',
      'GMP & Schedule T Compliance',
    ],
  },
  {
    id: 'kottakkal-clinic',
    company: 'Arya Vaidya Sala',
    role: 'Clinical Observation Intern',
    location: 'Kottakkal',
    match: 71,
    tags: ['Clinic', 'Patient care', 'Ayurveda'],
    keywords: [
      'Clinical Diagnosis & Patient Care',
      'Clinical Trials & Good Clinical Practice (GCP)',
      'Ayush Health Informatics & EMR',
    ],
  },
]

export function scoreAnswers(questions, answers) {
  const total = questions.length
  const correct = questions.filter((item, i) => answers[i] === item.answer).length
  return { correct, total, percent: Math.round((correct / total) * 100), answers, questions }
}

export const DEFAULT_STUDENT = {
  name: 'Student',
  email: '',
  contact: '',
  college: '',
  studyYear: '',
  keywords: [],
  interest: '',
  specialization: null,
  resumeName: '',
  resumeData: '',
}

export const DEFAULT_JOBS = [
  {
    id: 'company-qc',
    title: 'Quality Control Intern',
    role: 'Quality Control Intern',
    company: 'Himalaya Wellness',
    location: 'Bengaluru',
    openings: 4,
    applicants: 0,
    postedByCompany: true,
    tags: ['QC', 'Company posting'],
    keywords: [
      'Quality Control (QC) & Assay Testing',
      'Pharmacognosy & Raw Material Testing',
      'GMP & Schedule T Compliance',
    ],
  },
  {
    id: 'company-clinic',
    title: 'Clinical Observation Intern',
    role: 'Clinical Observation Intern',
    company: 'Himalaya Wellness',
    location: 'Bengaluru',
    openings: 2,
    applicants: 0,
    postedByCompany: true,
    tags: ['Clinic', 'Company posting'],
    keywords: [
      'Clinical Diagnosis & Patient Care',
      'Clinical Trials & Good Clinical Practice (GCP)',
      'Ayush Health Informatics & EMR',
    ],
  },
]

export const KEYWORD_GAP_INTERNSHIPS = [
  {
    id: 'gap-gmp-baidyanath',
    company: 'Baidyanath Pharmaceuticals',
    role: 'Schedule T GMP Compliance Trainee',
    keyword: 'GMP & Schedule T Compliance',
    location: 'Nagpur / Plant',
    stipend: '₹14,000 / month',
    duration: '3 Months',
    description: 'Hands-on training in ASU manufacturing facilities. Audit batch records, learn clean-room validation, and implement Schedule T compliance.',
    tags: ['GMP', 'Schedule T', 'Plant Audit'],
  },
  {
    id: 'gap-pharma-dabur',
    company: 'Dabur Research Foundation',
    role: 'Herbal Raw Material Identification Intern',
    keyword: 'Pharmacognosy & Raw Material Testing',
    location: 'Ghaziabad, NCR',
    stipend: '₹15,000 / month',
    duration: '3 Months',
    description: 'Crude botanical drug evaluation, macroscopic & microscopic characterization, herbarium voucher maintenance, and adulterant identification.',
    tags: ['Pharmacognosy', 'Raw Materials', 'Herbarium'],
  },
  {
    id: 'gap-form-emami',
    company: 'Emami AYUSH R&D Centre',
    role: 'Formulation & Dosage Development Intern',
    keyword: 'Formulation R&D & Pharmaceutics',
    location: 'Kolkata',
    stipend: '₹16,000 / month',
    duration: '4 Months',
    description: 'Formulate classical kwathas, solid dosage compression, wet trituration (Bhavana) optimization, and stability testing.',
    tags: ['Formulations', 'R&D', 'Pharmaceutics'],
  },
  {
    id: 'gap-clinic-kerala',
    company: 'Kerala Ayurveda Ltd',
    role: 'Clinical OPD & Panchakarma Observer',
    keyword: 'Clinical Diagnosis & Patient Care',
    location: 'Aluva, Kochi',
    stipend: '₹13,000 / month',
    duration: '3 Months',
    description: 'Shadow senior Vaidyas during Rogi-Roga Pariksha, monitor Poorvakarma/Pradhanakarma therapies, and practise clinical SOAP notes.',
    tags: ['OPD', 'Panchakarma', 'Patient Care'],
  },
  {
    id: 'gap-qc-charak',
    company: 'Charak Pharma Research Lab',
    role: 'Analytical QC & Heavy Metal Assay Trainee',
    keyword: 'Quality Control (QC) & Assay Testing',
    location: 'Mumbai / Silvassa',
    stipend: '₹15,000 / month',
    duration: '3 Months',
    description: 'Run atomic absorption spectroscopy, loss on drying, ash analysis, and heavy metal limits testing to issue Certificates of Analysis (COA).',
    tags: ['QC Lab', 'Assay Testing', 'Heavy Metals'],
  },
  {
    id: 'gap-std-aimil',
    company: 'Aimil Pharmaceuticals Quality Hub',
    role: 'Pharmacopoeial Standardization Intern',
    keyword: 'Herbal Standardization & API Standards',
    location: 'New Delhi',
    stipend: '₹14,000 / month',
    duration: '3 Months',
    description: 'Benchmark botanical extracts against Ayurvedic Pharmacopoeia of India (API) monographs and quantitative marker testing.',
    tags: ['API Standards', 'Standardization', 'Monographs'],
  },
  {
    id: 'gap-reg-zandu',
    company: 'Zandu Healthcare Regulatory Cell',
    role: 'ASU Regulatory Documentation Trainee',
    keyword: 'Regulatory Affairs & Documentation (BMR/COA)',
    location: 'Ahmedabad / Hybrid',
    stipend: '₹16,500 / month',
    duration: '3 Months',
    description: 'Prepare Batch Manufacturing Records (BMR), state licensing renewal filings, export dossiers, and statutory label reviews.',
    tags: ['Regulatory', 'BMR Documentation', 'Licensing'],
  },
  {
    id: 'gap-pv-dabur',
    company: 'Dabur Drug Safety & PV Unit',
    role: 'Pharmacovigilance Associate Trainee',
    keyword: 'Pharmacovigilance & Drug Safety',
    location: 'Ghaziabad / Hybrid',
    stipend: '₹15,000 / month',
    duration: '3 Months',
    description: 'Monitor adverse drug reactions (ADR) in herbal medications, log cases into National PV portals, and execute causality assessments.',
    tags: ['Drug Safety', 'ADR Monitoring', 'Pharmacovigilance'],
  },
  {
    id: 'gap-gcp-ccras',
    company: 'CCRAS Central Clinical Trial Unit',
    role: 'Clinical Trial Coordinator (GCP) Intern',
    keyword: 'Clinical Trials & Good Clinical Practice (GCP)',
    location: 'New Delhi',
    stipend: '₹18,000 / month',
    duration: '4 Months',
    description: 'Support multi-center randomized controlled trials (RCTs), CTRI registration compliance, patient informed consent, and GCP audits.',
    tags: ['Clinical Trials', 'GCP', 'CTRI'],
  },
  {
    id: 'gap-info-cdac',
    company: 'AyushGrid / C-DAC Digital Health',
    role: 'Health Informatics & EMR Systems Intern',
    keyword: 'Ayush Health Informatics & EMR',
    location: 'Pune / Hybrid',
    stipend: '₹18,000 / month',
    duration: '3 Months',
    description: 'Configure AYUSH Hospital Management Information Systems (A-HMIS), map NAMASTE portal terminology, and link ABDM digital health IDs.',
    tags: ['Health Informatics', 'EMR', 'AyushGrid'],
  },
]

export const KEYWORD_MENTORS = [
  {
    id: 'm-gmp',
    name: 'Dr. Rajesh Verma',
    title: 'VP of Quality Assurance & Schedule T Auditor',
    organization: 'Shree Baidyanath Ayurveda Bhawan',
    keyword: 'GMP & Schedule T Compliance',
    experience: '18+ Years Industry Experience',
    bio: 'Mentors students on Schedule T statutory requirements, clean-room ventilation validation, and building audit-ready batch records.',
    avatar: '👨‍💼',
    topics: ['Plant Layout Compliance', 'BMR Preparation SOPs', 'Cross-Contamination Prevention'],
  },
  {
    id: 'm-pharma',
    name: 'Prof. Anuradha Sen',
    title: 'Chief Pharmacognosist & Herbarium Curator',
    organization: 'National Medicinal Plants Board (NMPB)',
    keyword: 'Pharmacognosy & Raw Material Testing',
    experience: '15+ Years Botanical Research',
    bio: 'Specializes in macroscopic and microscopic raw drug authentication, herbal histology, and detecting commercial adulterants.',
    avatar: '👩‍🔬',
    topics: ['Microscopic Staining Techniques', 'Voucher Specimen Preparation', 'Adulterant Screening'],
  },
  {
    id: 'm-form',
    name: 'Dr. Alok Tripathi',
    title: 'Head of Formulation R&D',
    organization: 'Emami Healthcare & Research',
    keyword: 'Formulation R&D & Pharmaceutics',
    experience: '14+ Years Pharmaceutical R&D',
    bio: 'Guides young researchers on bridging classical Ayurvedic dosage methods with modern tablet compression and oral suspension science.',
    avatar: '👨‍🔬',
    topics: ['Kwatha Concentration Ratios', 'Bhavana Trituration Mechanics', 'Herbal Tablet QC'],
  },
  {
    id: 'm-clinic',
    name: 'Dr. S. K. Nambiar',
    title: 'Chief Medical Consultant & Vaidya',
    organization: 'Arya Vaidya Pharmacy (AVP) Coimbatore',
    keyword: 'Clinical Diagnosis & Patient Care',
    experience: '22+ Years Clinical Practice',
    bio: 'Provides clinical mentorship on Nadi Pariksha (pulse examination), emergency red-flag identification, and patient consultation ethics.',
    avatar: '🩺',
    topics: ['Ashtavidha Pariksha', 'Safe Panchakarma Sequencing', 'SOAP Note Documentation'],
  },
  {
    id: 'm-qc',
    name: 'Dr. Preeti Deshmukh',
    title: 'Director of Analytical Testing & QC',
    organization: 'Himalaya Global Research Centre',
    keyword: 'Quality Control (QC) & Assay Testing',
    experience: '16+ Years Analytical Chemistry',
    bio: 'Trains students on heavy metal limits, pesticide residues, microbial bio-burden assays, and issuing legal Certificates of Analysis.',
    avatar: '🔬',
    topics: ['Atomic Absorption Testing', 'Ash Value & Moisture SOPs', 'COA Sign-off Standards'],
  },
  {
    id: 'm-std',
    name: 'Dr. B. K. Raman',
    title: 'Senior Pharmacopoeial Monograph Auditor',
    organization: 'Pharmacopoeia Commission for Indian Medicine (PCIM&H)',
    keyword: 'Herbal Standardization & API Standards',
    experience: '20+ Years Standards Committee',
    bio: 'Expert in decoding Ayurvedic Pharmacopoeia of India (API) monographs, marker compound quantification, and TLC fingerprints.',
    avatar: '📋',
    topics: ['API Monograph Navigation', 'Quantitative Marker Profiling', 'Export Purity Standards'],
  },
  {
    id: 'm-reg',
    name: 'Adv. Rakesh Pillai',
    title: 'Senior ASU Regulatory Affairs Consultant',
    organization: 'National ASU Regulatory Advisory Council',
    keyword: 'Regulatory Affairs & Documentation (BMR/COA)',
    experience: '17+ Years Regulatory Law',
    bio: 'Advises interns on manufacturing license applications, Drugs & Cosmetics Act rules, Schedule T compliance, and regulatory dossier filings.',
    avatar: '⚖️',
    topics: ['ASU Licensing Requirements', 'BMR Traceability Rules', 'Dossier Submission for Exports'],
  },
  {
    id: 'm-pv',
    name: 'Dr. Meera Nair',
    title: 'National Pharmacovigilance Coordinator',
    organization: 'All India Institute of Ayurveda (AIIA) / WHO-CC',
    keyword: 'Pharmacovigilance & Drug Safety',
    experience: '12+ Years Drug Safety Research',
    bio: 'Leads national training on adverse drug reaction (ADR) detection, causality assessment algorithms, and safe herbal medicine pharmacovigilance.',
    avatar: '🛡️',
    topics: ['ADR Detection & Reporting', 'Causality Assessment (WHO-UMC)', 'Post-Marketing Surveillance'],
  },
  {
    id: 'm-gcp',
    name: 'Dr. Vikram Malhotra',
    title: 'Principal Clinical Trial Investigator',
    organization: 'Council for Central Research in Ayurvedic Sciences (CCRAS)',
    keyword: 'Clinical Trials & Good Clinical Practice (GCP)',
    experience: '15+ Years Clinical Trial Management',
    bio: 'Directs multi-center clinical trials, CTRI registration protocols, GCP investigator standards, and randomized clinical trial (RCT) ethics.',
    avatar: '📊',
    topics: ['GCP Protocol Adherence', 'Informed Consent Auditing', 'CTRI Database Registration'],
  },
  {
    id: 'm-info',
    name: 'Er. Ananya Sharma',
    title: 'Lead Health Informatics Architect',
    organization: 'National AYUSH Grid / C-DAC',
    keyword: 'Ayush Health Informatics & EMR',
    experience: '11+ Years Health-Tech',
    bio: 'Specializes in hospital EMR systems, standardized terminology (NAMASTE portal), telemedicine standards, and Ayushman Bharat Digital Mission (ABDM).',
    avatar: '💻',
    topics: ['A-HMIS Workflow Configuration', 'NAMASTE Standard Terminology', 'ABDM Integration Standards'],
  },
]

export const KEYWORD_COURSES = [
  {
    id: 'c-gmp',
    title: 'Schedule T & Industrial GMP Mastery for AYUSH',
    keyword: 'GMP & Schedule T Compliance',
    provider: 'Swayam · Ministry of AYUSH & NIPER',
    duration: '6 Weeks (Self-Paced)',
    level: 'Industry Certification',
    certification: 'Govt. Accredited Certificate',
    guideOverview: 'Comprehensive study of factory layout, air handling units, sterile vs non-sterile ASU preparation, and deviation reporting.',
    url: 'https://swayam.gov.in',
  },
  {
    id: 'c-pharma',
    title: 'Advanced Pharmacognosy & Botanical Microscopy',
    keyword: 'Pharmacognosy & Raw Material Testing',
    provider: 'NPTEL · IIT Madras & CCRAS',
    duration: '8 Weeks (Weekly Practical Demos)',
    level: 'Intermediate to Advanced',
    certification: 'Academic & Industry Verifiable',
    guideOverview: 'Cellular identification of plant powders, section cutting, double-staining techniques, and herbarium voucher curation.',
    url: 'https://nptel.ac.in',
  },
  {
    id: 'c-form',
    title: 'Ayurvedic Dosage Forms & Modern Pharmaceutics',
    keyword: 'Formulation R&D & Pharmaceutics',
    provider: 'CCRAS Academic Cell & Jamnagar Institute',
    duration: '5 Weeks',
    level: 'R&D Specialization',
    certification: 'CCRAS Certified Course',
    guideOverview: 'Practical dosage manufacturing: Kwatha decoction reductions, Churna sifting, Bhavana trituration, and tablet dissolution.',
    url: 'http://ccras.nic.in',
  },
  {
    id: 'c-clinic',
    title: 'Rogi-Roga Pariksha & Clinical Documentation (SOAP)',
    keyword: 'Clinical Diagnosis & Patient Care',
    provider: 'National Institute of Ayurveda (NIA) Jaipur',
    duration: '4 Weeks',
    level: 'Clinical Practice Track',
    certification: 'Clinical Continuing Education Credit',
    guideOverview: 'Structured history taking, Ashtavidha examination checklist, vital monitoring, and medical-legal clinical documentation.',
    url: 'https://nia.nic.in',
  },
  {
    id: 'c-qc',
    title: 'Physicochemical & Spectroscopic QC of Herbal Drugs',
    keyword: 'Quality Control (QC) & Assay Testing',
    provider: 'Swayam · Central Council for Research in Ayurvedic Sciences',
    duration: '6 Weeks',
    level: 'Lab Analyst Track',
    certification: 'Laboratory Competency Certificate',
    guideOverview: 'Loss on drying, total ash, acid-insoluble ash, alcohol-soluble extractives, and heavy metal testing via AAS.',
    url: 'https://swayam.gov.in',
  },
  {
    id: 'c-std',
    title: 'Decoding the Ayurvedic Pharmacopoeia of India (API)',
    keyword: 'Herbal Standardization & API Standards',
    provider: 'PCIM&H Digital Academy',
    duration: '4 Weeks',
    level: 'Standardization Track',
    certification: 'Official PCIM&H Certification',
    guideOverview: 'Master how to interpret single drug and formulation monographs, evaluate TLC marker profiles, and ensure compliance.',
    url: 'https://pcimh.gov.in',
  },
  {
    id: 'c-reg',
    title: 'Regulatory Affairs & Dossier Filing for ASU Drugs',
    keyword: 'Regulatory Affairs & Documentation (BMR/COA)',
    provider: 'NIPER & Ministry of AYUSH',
    duration: '6 Weeks',
    level: 'Compliance Track',
    certification: 'Regulatory Affairs Credential',
    guideOverview: 'Drugs & Cosmetics Act Schedule T, manufacturing license renewal forms, CTD dossier formats, and export COPP compliance.',
    url: 'https://ayush.gov.in',
  },
  {
    id: 'c-pv',
    title: 'Pharmacovigilance in AYUSH Systems & ADR Reporting',
    keyword: 'Pharmacovigilance & Drug Safety',
    provider: 'National Pharmacovigilance Coordination Centre (NPvCC)',
    duration: '4 Weeks',
    level: 'Safety Specialist',
    certification: 'National PV Practitioner Certificate',
    guideOverview: 'Adverse drug reaction triage, filing official suspected ADR reporting forms, signal evaluation, and WHO causality grading.',
    url: 'https://aiia.gov.in',
  },
  {
    id: 'c-gcp',
    title: 'Good Clinical Practice (GCP) for AYUSH Clinical Trials',
    keyword: 'Clinical Trials & Good Clinical Practice (GCP)',
    provider: 'ICMR & CDSCO Digital Academy',
    duration: '5 Weeks',
    level: 'Investigator Track',
    certification: 'ICMR GCP Certified',
    guideOverview: 'Clinical trial protocols, ethics committee approvals, investigator obligations, CRF design, and trial monitoring.',
    url: 'https://ctri.nic.in',
  },
  {
    id: 'c-info',
    title: 'AYUSH Health Informatics, A-HMIS & ABDM Standards',
    keyword: 'Ayush Health Informatics & EMR',
    provider: 'C-DAC & National Digital Health Mission',
    duration: '6 Weeks',
    level: 'Health-Tech Innovation',
    certification: 'Digital Health Practitioner Badge',
    guideOverview: 'A-HMIS hospital software workflow, NAMASTE standardized Ayurvedic diagnosis coding, tele-health regulations, and ABDM APIs.',
    url: 'https://ayushgrid.gov.in',
  },
]


