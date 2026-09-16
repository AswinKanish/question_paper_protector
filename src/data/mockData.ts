import {
  User,
  ExamBlueprint,
  QuestionItem,
  AuditLogEntry,
  AssembledPaper,
} from '../types';
import {
  encryptQuestionPayload,
  fallbackSHA256,
  serializePaperForHash,
  computeMerkleRoot,
} from '../crypto/cryptoUtils';

export const INITIAL_USERS: User[] = [
  {
    id: 'USR-SET-01',
    name: 'Dr. Aruna Rao',
    title: 'Senior Subject Expert (Quantitative)',
    role: 'setter_quant',
    department: 'Department of Mathematical Sciences',
    email: 'aruna.rao@gov-examinations.gov.in',
    assignedSectionId: 'SEC-QUANT',
    badgeLevel: 'SETTER-SHARD-A',
    clearanceLevel: 'RESTRICTED_SECTION',
    phoneLast4: '4821',
  },
  {
    id: 'USR-SET-02',
    name: 'Prof. Vikram Sen',
    title: 'Consultant (General Awareness & Polity)',
    role: 'setter_general',
    department: 'National Institute of Public Policy',
    email: 'vikram.sen@gov-examinations.gov.in',
    assignedSectionId: 'SEC-GENERAL',
    badgeLevel: 'SETTER-SHARD-B',
    clearanceLevel: 'RESTRICTED_SECTION',
    phoneLast4: '9133',
  },
  {
    id: 'USR-SET-03',
    name: 'Dr. Farooq Khan',
    title: 'Specialist (Reasoning & Ethics)',
    role: 'setter_reasoning',
    department: 'Bureau of Administrative Aptitude',
    email: 'farooq.khan@gov-examinations.gov.in',
    assignedSectionId: 'SEC-REASONING',
    badgeLevel: 'SETTER-SHARD-C',
    clearanceLevel: 'RESTRICTED_SECTION',
    phoneLast4: '7729',
  },
  {
    id: 'USR-CTRL-01',
    name: 'Rajeshwari Verma, IAS',
    title: 'Chief Controller of Examinations',
    role: 'controller',
    department: 'National Examination Commission (Secretariat)',
    email: 'r.verma.ias@gov-examinations.gov.in',
    badgeLevel: 'CHIEF-CUSTODIAN',
    clearanceLevel: 'TOP_SECRET',
    phoneLast4: '1008',
  },
  {
    id: 'USR-REV-01',
    name: 'Col. S. Sundaram (Retd.)',
    title: 'Joint Reviewing Officer (Quorum Co-Signer)',
    role: 'reviewing_officer',
    department: 'Independent Scrutiny & Verification Directorate',
    email: 's.sundaram@gov-examinations.gov.in',
    badgeLevel: 'QUORUM-SIGNER-2',
    clearanceLevel: 'TOP_SECRET',
    phoneLast4: '5561',
  },
  {
    id: 'USR-CENTRE-104',
    name: 'K. Murali',
    title: 'Centre Superintendent (Code: #104)',
    role: 'centre_superintendent',
    department: 'Delhi Metro Central Examination Centre',
    email: 'superintendent.104@gov-examinations.gov.in',
    badgeLevel: 'FIELD-DECRYPTOR',
    clearanceLevel: 'SECRET',
    phoneLast4: '3340',
  },
  {
    id: 'USR-AUDIT-01',
    name: 'Ananya Bose',
    title: 'Chief Vigilance & Security Auditor',
    role: 'security_auditor',
    department: 'Cyber Security & Forensic Audit Cell',
    email: 'vigilance.bose@gov-examinations.gov.in',
    badgeLevel: 'INDEPENDENT-AUDITOR',
    clearanceLevel: 'AUDIT_ONLY',
    phoneLast4: '8824',
  },
];

export const INITIAL_EXAM_BLUEPRINT: ExamBlueprint = {
  id: 'EXAM-2026-CS-PRELIM',
  title: 'Combined Civil Services & Administrative Prelims 2026',
  code: 'UPSC-CS-2026-P1',
  examDate: '2026-10-15',
  scheduledReleaseTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
  durationMinutes: 120,
  totalMarks: 200,
  sections: [
    {
      id: 'SEC-QUANT',
      name: 'Section I: Quantitative Aptitude & Data Interpretation',
      code: 'QA-01',
      requiredQuestions: 3,
      assignedSetterId: 'USR-SET-01',
      assignedSetterName: 'Dr. Aruna Rao',
      topicAreas: ['Combinatorics', 'Time & Work', 'Financial Mathematics', 'Statistical Inference'],
    },
    {
      id: 'SEC-GENERAL',
      name: 'Section II: Indian Polity, Governance & Global Affairs',
      code: 'GA-02',
      requiredQuestions: 3,
      assignedSetterId: 'USR-SET-02',
      assignedSetterName: 'Prof. Vikram Sen',
      topicAreas: ['Constitutional Articles', 'Federal Fiscal Relations', 'Climate Agreements', 'Administrative Law'],
    },
    {
      id: 'SEC-REASONING',
      name: 'Section III: Analytical Logic & Administrative Ethics',
      code: 'RE-03',
      requiredQuestions: 3,
      assignedSetterId: 'USR-SET-03',
      assignedSetterName: 'Dr. Farooq Khan',
      topicAreas: ['Decision Making', 'Civil Service Values', 'Deductive Syllogisms', 'Public Interest Conflict'],
    },
  ],
};

function createQuestion(
  id: string,
  sectionId: string,
  sectionName: string,
  setterId: string,
  setterName: string,
  text: string,
  options: { id: string; text: string }[],
  correctOptionId: string,
  difficulty: 'Easy' | 'Medium' | 'Hard',
  marks: number
): QuestionItem {
  const enc = encryptQuestionPayload(text + JSON.stringify(options));
  const sha256Hash = fallbackSHA256(text + JSON.stringify(options) + correctOptionId);
  return {
    id,
    sectionId,
    sectionName,
    setterId,
    setterName,
    text,
    options,
    correctOptionId,
    difficulty,
    marks,
    submittedAt: '2026-09-14T11:20:00.000Z',
    cipherPayload: enc.cipherPayload,
    iv: enc.iv,
    authTag: enc.authTag,
    keyId: enc.keyId,
    sha256Hash,
  };
}

export const INITIAL_QUESTION_VAULT: QuestionItem[] = [
  // SECTION I: Quantitative (Dr. Aruna Rao)
  createQuestion(
    'Q-QA-101',
    'SEC-QUANT',
    'Section I: Quantitative Aptitude & Data Interpretation',
    'USR-SET-01',
    'Dr. Aruna Rao',
    'A committee of 5 members is to be formed from 6 senior officers and 4 deputy directors. What is the probability that the committee contains at least 3 senior officers?',
    [
      { id: 'opt-a', text: '53 / 84' },
      { id: 'opt-b', text: '41 / 63' },
      { id: 'opt-c', text: '17 / 28' },
      { id: 'opt-d', text: '23 / 42' },
    ],
    'opt-a',
    'Hard',
    2.5
  ),
  createQuestion(
    'Q-QA-102',
    'SEC-QUANT',
    'Section I: Quantitative Aptitude & Data Interpretation',
    'USR-SET-01',
    'Dr. Aruna Rao',
    'Two project teams A and B working independently can complete a public infrastructure audit in 18 and 24 days respectively. If both work on alternate days starting with Team A, in how many days will the audit be completed?',
    [
      { id: 'opt-a', text: '20.25 days' },
      { id: 'opt-b', text: '20.5 days' },
      { id: 'opt-c', text: '21.0 days' },
      { id: 'opt-d', text: '19.75 days' },
    ],
    'opt-b',
    'Medium',
    2.5
  ),
  createQuestion(
    'Q-QA-103',
    'SEC-QUANT',
    'Section I: Quantitative Aptitude & Data Interpretation',
    'USR-SET-01',
    'Dr. Aruna Rao',
    'The compound interest on a public treasury bond for 2 years at 12.5% per annum is ₹1,020. What would be the simple interest on the same sum for 3 years at 10% per annum?',
    [
      { id: 'opt-a', text: '₹1,200' },
      { id: 'opt-b', text: '₹1,440' },
      { id: 'opt-c', text: '₹1,080' },
      { id: 'opt-d', text: '₹1,500' },
    ],
    'opt-a',
    'Medium',
    2.5
  ),
  createQuestion(
    'Q-QA-104',
    'SEC-QUANT',
    'Section I: Quantitative Aptitude & Data Interpretation',
    'USR-SET-01',
    'Dr. Aruna Rao',
    'In a district statistical sample of 400 households, the mean agricultural income was recorded as ₹45,000 with standard deviation ₹8,000. Under normal distribution assumptions, what percentage of households earn above ₹61,000?',
    [
      { id: 'opt-a', text: '2.28%' },
      { id: 'opt-b', text: '4.75%' },
      { id: 'opt-c', text: '0.85%' },
      { id: 'opt-d', text: '5.12%' },
    ],
    'opt-a',
    'Hard',
    2.5
  ),

  // SECTION II: General Awareness & Polity (Prof. Vikram Sen)
  createQuestion(
    'Q-GA-201',
    'SEC-GENERAL',
    'Section II: Indian Polity, Governance & Global Affairs',
    'USR-SET-02',
    'Prof. Vikram Sen',
    'Under Article 280 of the Constitution of India, the Finance Commission is primarily entrusted with which of the following recommendations?',
    [
      { id: 'opt-a', text: 'Distribution of the net proceeds of taxes between Union and States' },
      { id: 'opt-b', text: 'Sanctioning public borrowings of State Governments from foreign banks' },
      { id: 'opt-c', text: 'Formulation of national five-year infrastructure development budgets' },
      { id: 'opt-d', text: 'Determining the salaries of the Comptroller and Auditor General' },
    ],
    'opt-a',
    'Medium',
    2.5
  ),
  createQuestion(
    'Q-GA-202',
    'SEC-GENERAL',
    'Section II: Indian Polity, Governance & Global Affairs',
    'USR-SET-02',
    'Prof. Vikram Sen',
    'Which of the following constitutional provisions guarantees protection against retrospective criminal laws (Ex-post facto legislation)?',
    [
      { id: 'opt-a', text: 'Article 20(1)' },
      { id: 'opt-b', text: 'Article 21' },
      { id: 'opt-c', text: 'Article 22(2)' },
      { id: 'opt-d', text: 'Article 19(1)(a)' },
    ],
    'opt-a',
    'Easy',
    2.5
  ),
  createQuestion(
    'Q-GA-203',
    'SEC-GENERAL',
    'Section II: Indian Polity, Governance & Global Affairs',
    'USR-SET-02',
    'Prof. Vikram Sen',
    'In the context of international climate finance, the "Loss and Damage Fund" operationalized at COP28 aims specifically to:',
    [
      { id: 'opt-a', text: 'Assist vulnerable nations in recovering from irreversible climate disasters' },
      { id: 'opt-b', text: 'Provide subsidies for commercial electric vehicle manufacturers in G20 nations' },
      { id: 'opt-c', text: 'Fund nuclear fusion research projects across developing economies' },
      { id: 'opt-d', text: 'Finance private carbon credit trading platforms' },
    ],
    'opt-a',
    'Medium',
    2.5
  ),
  createQuestion(
    'Q-GA-204',
    'SEC-GENERAL',
    'Section II: Indian Polity, Governance & Global Affairs',
    'USR-SET-02',
    'Prof. Vikram Sen',
    'The principle of "Subsidiarity" in modern public administration dictates that:',
    [
      { id: 'opt-a', text: 'Functions that can be performed effectively at a lower administrative tier should not be assigned to a higher tier' },
      { id: 'opt-b', text: 'Central statutory bodies possess absolute supremacy over regional municipal bye-laws' },
      { id: 'opt-c', text: 'All procurement decisions must be audited by third-party private agencies' },
      { id: 'opt-d', text: 'Subsidies must be disbursed exclusively via direct cash transfers' },
    ],
    'opt-a',
    'Medium',
    2.5
  ),

  // SECTION III: Analytical Reasoning & Ethics (Dr. Farooq Khan)
  createQuestion(
    'Q-RE-301',
    'SEC-REASONING',
    'Section III: Analytical Logic & Administrative Ethics',
    'USR-SET-03',
    'Dr. Farooq Khan',
    'You are a District Magistrate. A chemical factory provides substantial local employment but violates effluent standards, polluting ground water. The local minister advises giving them 6 months lenient waiver. What is the most ethically sound immediate course of action?',
    [
      { id: 'opt-a', text: 'Order immediate inspection, enforce mandatory effluent compliance timeline, and issue interim safety measures for clean drinking water supply' },
      { id: 'opt-b', text: 'Immediately seal the factory without notice, disregarding the sudden unemployment of 2,000 workers' },
      { id: 'opt-c', text: 'Comply with the minister’s verbal instruction to protect local industrial growth' },
      { id: 'opt-d', text: 'Transfer the file to a subordinate officer to avoid personal political friction' },
    ],
    'opt-a',
    'Medium',
    2.5
  ),
  createQuestion(
    'Q-RE-302',
    'SEC-REASONING',
    'Section III: Analytical Logic & Administrative Ethics',
    'USR-SET-03',
    'Dr. Farooq Khan',
    'Statements: (I) All accountable civil servants practice transparency. (II) Some accountable civil servants handle sensitive intelligence files. Conclusion: Which deduction is logically valid?',
    [
      { id: 'opt-a', text: 'Some individuals handling sensitive intelligence files practice transparency' },
      { id: 'opt-b', text: 'All persons handling intelligence files are accountable civil servants' },
      { id: 'opt-c', text: 'No transparent civil servant handles sensitive intelligence files' },
      { id: 'opt-d', text: 'Transparency is incompatible with handling sensitive intelligence files' },
    ],
    'opt-a',
    'Hard',
    2.5
  ),
  createQuestion(
    'Q-RE-303',
    'SEC-REASONING',
    'Section III: Analytical Logic & Administrative Ethics',
    'USR-SET-03',
    'Dr. Farooq Khan',
    'Which administrative virtue is highlighted when a public officer rejects all corporate gifts and declares family assets voluntarily on public portal?',
    [
      { id: 'opt-a', text: 'Integrity and Probity in Governance' },
      { id: 'opt-b', text: 'Bureaucratic Discretion' },
      { id: 'opt-c', text: 'Administrative Secrecy' },
      { id: 'opt-d', text: 'Diplomatic Immunity' },
    ],
    'opt-a',
    'Easy',
    2.5
  ),
  createQuestion(
    'Q-RE-304',
    'SEC-REASONING',
    'Section III: Analytical Logic & Administrative Ethics',
    'USR-SET-03',
    'Dr. Farooq Khan',
    'Six civil services candidates P, Q, R, S, T, and U sit in an interview waiting room facing North. P sits third to the right of S. Only one person sits between Q and U. R is not adjacent to P. Who sits in the exact middle positions?',
    [
      { id: 'opt-a', text: 'Q and T' },
      { id: 'opt-b', text: 'P and R' },
      { id: 'opt-c', text: 'S and U' },
      { id: 'opt-d', text: 'T and R' },
    ],
    'opt-a',
    'Hard',
    2.5
  ),
];

// Helper to assemble initial paper with 9 questions (3 from each setter)
export function createInitialAssembledPaper(): AssembledPaper {
  // Take 3 from each
  const selectedQuestions = [
    INITIAL_QUESTION_VAULT[0],
    INITIAL_QUESTION_VAULT[1],
    INITIAL_QUESTION_VAULT[2],
    INITIAL_QUESTION_VAULT[4],
    INITIAL_QUESTION_VAULT[5],
    INITIAL_QUESTION_VAULT[6],
    INITIAL_QUESTION_VAULT[8],
    INITIAL_QUESTION_VAULT[9],
    INITIAL_QUESTION_VAULT[10],
  ];

  const serialized = serializePaperForHash(selectedQuestions);
  const canonicalHash = fallbackSHA256(serialized);
  const questionHashes = selectedQuestions.map(q => q.sha256Hash);
  const merkleRoot = computeMerkleRoot(questionHashes);

  return {
    id: 'PAPER-2026-FINAL-V1',
    examId: 'EXAM-2026-CS-PRELIM',
    examTitle: 'Combined Civil Services & Administrative Prelims 2026',
    assembledAt: '2026-09-15T14:30:00.000Z',
    generatedSeed: '0x9F4C2A1E8D37B092',
    status: 'PENDING_QUORUM',
    questions: selectedQuestions,
    canonicalHash,
    currentComputedHash: canonicalHash,
    merkleRoot,
    signatures: [
      {
        officerId: 'USR-CTRL-01',
        officerName: 'Rajeshwari Verma, IAS',
        role: 'Chief Controller of Examinations',
        signedAt: '2026-09-15T15:10:00.000Z',
        digitalCertFingerprint: 'SHA256:4a8b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b',
        otpTokenRef: 'OTP-TOKEN-AUTH-9481',
        cryptographicSignature: '0xSIGN_CTRL_RSA4096_7b82f1...99a0',
      },
    ],
    requiredSignatures: 2,
    timeLockExpiry: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
    isTampered: false,
  };
}

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'LOG-001',
    timestamp: '2026-09-15T09:00:12.000Z',
    actorId: 'USR-CTRL-01',
    actorName: 'Rajeshwari Verma, IAS',
    actorRole: 'controller',
    category: 'AUTH_2FA',
    action: '2FA Authentication Successful',
    severity: 'INFO',
    ipAddress: '10.14.88.2',
    clientDevice: 'Secured NIC Workstation (ID: NIC-SEC-WS-99)',
    details: 'Primary credentials verified via hardware security token + OTP verification.',
    cryptoProof: '0x9924...b41a',
  },
  {
    id: 'LOG-002',
    timestamp: '2026-09-15T10:15:30.000Z',
    actorId: 'USR-SET-01',
    actorName: 'Dr. Aruna Rao',
    actorRole: 'setter_quant',
    category: 'BLIND_QUESTION_SETTING',
    action: 'Blinded Shard Item Stored',
    severity: 'INFO',
    ipAddress: '10.14.88.45',
    clientDevice: 'Air-gapped Authoring Terminal QA-1',
    details: 'Submitted 4 questions to Section I (Quantitative). Client encrypted with AES-256-GCM before transmission.',
    cryptoProof: 'IV: iv_7a2f... Tag: tag_8b11',
  },
  {
    id: 'LOG-003',
    timestamp: '2026-09-15T11:45:10.000Z',
    actorId: 'USR-SET-02',
    actorName: 'Prof. Vikram Sen',
    actorRole: 'setter_general',
    category: 'BLIND_QUESTION_SETTING',
    action: 'Blinded Shard Item Stored',
    severity: 'INFO',
    ipAddress: '10.14.88.62',
    clientDevice: 'Air-gapped Authoring Terminal GA-2',
    details: 'Submitted 4 questions to Section II (General Awareness). Zero access granted to other sections.',
    cryptoProof: 'IV: iv_9c44... Tag: tag_2e17',
  },
  {
    id: 'LOG-004',
    timestamp: '2026-09-15T14:30:00.000Z',
    actorId: 'SYSTEM-DAEMON',
    actorName: 'Automated Paper Synthesizer',
    actorRole: 'controller',
    category: 'AUTOMATED_ASSEMBLY',
    action: 'Automated Paper Synthesis Completed',
    severity: 'NOTICE',
    ipAddress: '127.0.0.1 (KMS Enclave)',
    clientDevice: 'Hardware Security Module (HSM-KMS-2026)',
    details: 'Compiled 9 questions blindly from 3 setter pools. Computed Master Canonical SHA-256 Hash and Merkle Root.',
    cryptoProof: 'SHA256: e23d7a8f...904b',
  },
  {
    id: 'LOG-005',
    timestamp: '2026-09-15T15:10:00.000Z',
    actorId: 'USR-CTRL-01',
    actorName: 'Rajeshwari Verma, IAS',
    actorRole: 'controller',
    category: 'QUORUM_APPROVAL',
    action: 'Quorum Signature 1/2 Affixed',
    severity: 'NOTICE',
    ipAddress: '10.14.88.2',
    clientDevice: 'Secured NIC Workstation',
    details: 'Controller affixed Digital Certificate #4a8b... Quorum pending 1 additional officer approval.',
    cryptoProof: 'Sig: 0xSIGN_CTRL_RSA4096_7b82f1',
  },
];
