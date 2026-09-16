# SecureExams Cloud 🛡️
### Secure Cloud-Based Question Paper Management & Zero-Leak Controlled Release System

---

## 1. Project Description

**SecureExams Cloud** is a specialized, zero-trust cloud management platform designed for competitive examination bodies (e.g., UPSC, SSC, State PSCs, Banking & Defense boards). 

In high-stakes competitive examinations, question papers can be compromised before the examination through unauthorized access by question setters or administrators, compromised systems, insecure storage, insider threats, and premature transmission across exam centres. 

SecureExams Cloud eliminates single-point compromise through defense-in-depth security:
- **Two-Factor Authentication (2FA)**: Mandatory alphanumeric credentials plus time-based one-time passwords (TOTP/OTP).
- **Least-Privilege Role Access Control (RBAC)**: Strict compartmentalization across Setters, Controllers, Reviewers, Superintendents, and Auditors.
- **Blinded Question Sharding**: Subject setters author questions only for their assigned section; no human views the complete examination paper ahead of time.
- **AES-256-GCM Cloud Vault Storage**: Client-side encrypted envelopes with unique Initialization Vectors (IV) and authentication tags ensure zero plaintext exposure at rest.
- **Automated Algorithmic Paper Assembly**: Papers are compiled automatically from sharded question pools via deterministic pseudo-random seeds without human selection bias.
- **Cryptographic SHA-256 & Merkle Tree Integrity**: Instant bit-level tamper detection that freezes the release pipeline if even one character is altered.
- **Multi-Officer Quorum Approval (M-of-N Dual Control)**: Requires cryptographic co-signatures from both the Chief Controller and Joint Reviewing Officer before release arming.
- **Stratum-1 Time-Locked Release**: Cloud KMS decryption keys remain withheld until the scheduled examination hour, decrypting into dynamically watermarked pages to prevent photography leaks.
- **Immutable Forensic Audit Trail**: Real-time logging of all 2FA events, submissions, assemblies, signatures, and tamper alarms with client IP, timestamp, and cryptographic proofs.

---

## 2. Technologies & Tools Used

- **Frontend & UI**: [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)
- **Icons & Visuals**: [Lucide React](https://lucide.dev/)
- **Build System**: [Vite](https://vitejs.dev/)
- **Cryptography Engine**: Web Crypto API & deterministic fallback implementing SHA-256 digests, Merkle Tree hashing, and AES-256-GCM simulation
- **Database & Cloud Storage**: [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security), with seamless offline in-memory fallback
- **Hosting Targets**: AWS Amplify, Cloud Run, Vercel, Netlify

---

## 3. Steps to Install Dependencies & Run Locally

### Prerequisites
- Node.js version 18 or higher (`node -v`)
- npm version 9 or higher (`npm -v`)

### Installation Steps

1. **Clone or Extract the Repository**:
   ```bash
   git clone <repository-url>
   cd secure-exams-cloud
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables (Optional)**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   If connecting to your Supabase PostgreSQL project:
   ```env
   VITE_SUPABASE_URL="https://your-project.supabase.co"
   VITE_SUPABASE_ANON_KEY="your-anon-public-key"
   ```
   *(If omitted, the app will run in local high-fidelity simulation mode automatically).*

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000`.

5. **Build for Production**:
   ```bash
   npm run build
   ```
   The compiled production output will be generated in the `/dist` directory.

6. **Validate Type Safety & Syntax**:
   ```bash
   npm run lint
   ```

---

## 4. Project Structure & Modules

```
├── index.html                           # Main HTML entry point with security metadata
├── metadata.json                        # Platform metadata and permissions
├── package.json                         # Dependencies and build scripts
├── supabase_schema.sql                  # PostgreSQL table schemas, RLS policies, and indices
├── .env.example                         # Environment configuration template
│
└── src/
    ├── main.tsx                         # React entry point
    ├── App.tsx                          # Root orchestrator managing roles, crypto state & modals
    ├── index.css                        # Tailwind styles, dark theme, and anti-leak watermark CSS
    ├── types.ts                         # System domain models (Users, Questions, Quorum, Logs)
    │
    ├── crypto/
    │   └── cryptoUtils.ts               # SHA-256, Merkle root calculation & AES-256-GCM functions
    │
    ├── data/
    │   └── mockData.ts                  # Seed users, blueprint, initial vault & audit log entries
    │
    ├── lib/
    │   └── supabase.ts                  # Supabase client connector, schema sync & fetch operations
    │
    └── components/
        ├── Navbar.tsx                   # Top navigation, live SHA-256 seal status, countdown & role switcher
        ├── AuthModal.tsx                # Password + 6-digit OTP two-factor authentication terminal
        ├── SetterDashboard.tsx          # Blinded question submission station & AES-256 Cloud Vault Inspector
        ├── ControllerDashboard.tsx      # Multi-shard pool health & automated paper synthesis engine
        ├── QuorumApprovalPanel.tsx      # Dual-officer digital certificate co-signing terminal
        ├── IntegrityVerificationModal.tsx# Real-time SHA-256 hash comparison & attack simulation
        ├── SuperintendentReleaseStation.tsx # Time-lock countdown, KMS key release & watermarked viewer
        ├── SecurityAuditViewer.tsx      # Immutable forensic activity log table with search & JSON export
        ├── SystemOverviewModal.tsx      # Comprehensive threat model and mitigation architecture specifications
        └── SupabaseSetupModal.tsx       # Interactive Supabase connection helper & 1-click SQL copy modal
```

### Module Responsibilities:
- **`src/types.ts`**: Defines strong typing for roles (`setter_quant`, `setter_general`, `setter_reasoning`, `controller`, `reviewing_officer`, `centre_superintendent`, `security_auditor`), question blueprints, cipher payloads, and audit events.
- **`src/crypto/cryptoUtils.ts`**: Computes deterministic SHA-256 cryptographic digests, binary Merkle roots over question nodes, and serializes paper structures.
- **`src/components/SetterDashboard.tsx`**: Enforces blinded access where subject specialists only see their assigned section. Includes the **Cloud Vault Inspector** demonstrating ciphertext envelopes at rest.
- **`src/components/ControllerDashboard.tsx`**: Allows the Chief Controller to synthesize an exam paper algorithmically without human selection of question sequences.
- **`src/components/QuorumApprovalPanel.tsx`**: Enforces M-of-N dual control; both Controller and Reviewing Officer must affix digital certificate signatures before the paper can be time-locked.
- **`src/components/IntegrityVerificationModal.tsx`**: Compares the live paper hash against the canonical sealed hash. Features **"Simulate Insider Tamper Attack"** (alters 1 character) to demonstrate instant tamper alarm and lockdown.
- **`src/components/SuperintendentReleaseStation.tsx`**: Interfaces with exam centres, unlocking question papers only when the countdown reaches 00:00:00 and applying dynamic security watermarks to each page.
- **`src/components/SecurityAuditViewer.tsx`**: Provides an immutable audit trail for vigilance teams with filterable logs and JSON export.

---

## 5. Sample Input and Output

### A. Sample Question Input (Authoring Stage)
```json
{
  "sectionId": "SEC-QUANT",
  "sectionName": "Quantitative Aptitude & Advanced Data Interpretation",
  "text": "In a competitive examination of 100 questions, 1 mark is awarded for correct answers and 0.25 marks deducted for wrong answers. A candidate scores 60 marks by attempting all questions. How many were answered correctly?",
  "options": [
    { "id": "A", "text": "68 questions" },
    { "id": "B", "text": "65 questions" },
    { "id": "C", "text": "60 questions" },
    { "id": "D", "text": "72 questions" }
  ],
  "correctOptionId": "A",
  "difficulty": "MEDIUM",
  "marks": 2.5
}
```

### B. Encrypted Cloud Storage Output (AES-256-GCM Envelope)
```json
{
  "id": "SEC-QUANT-004",
  "status": "ENCRYPTED_AT_REST",
  "cipherPayload": "8e3b1c9f42d7e01a89bf3e419c8d52fa0192e84c7bb2...[ENCRYPTED CIPHERTEXT]",
  "iv": "d4a810b2f901c3e4",
  "authTag": "5f1a9c3d4e8b0219",
  "keyId": "KMS-SEC-KEY-QUANT-2026-V1",
  "sha256Hash": "f8a7e4b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8"
}
```

### C. Automated Paper Synthesis & Canonical Seal Output
```json
{
  "paperId": "PAPER-2026-AUTOGEN-8812",
  "examId": "EXAM-CSE-2026",
  "examTitle": "Civil Services Preliminary Examination 2026 - General Studies Paper I",
  "generatedSeed": "0xA8F94D2C1B9E",
  "totalItems": 9,
  "canonicalHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "merkleRoot": "9f83f33b7e411b933860bbd8a8eb54316d29944a9544a0e30954b0365775465e",
  "status": "APPROVED_LOCKED",
  "requiredSignatures": 2,
  "timeLockExpiry": "2026-09-17T10:00:00.000Z"
}
```

### D. Multi-Officer Quorum Signature Output
```json
[
  {
    "officerId": "USR-CTRL-01",
    "officerName": "Rajeshwari Verma, IAS",
    "role": "Chief Controller of Examinations",
    "signedAt": "2026-09-16T09:40:00.000Z",
    "digitalCertFingerprint": "SHA256:4a8b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b",
    "cryptographicSignature": "0xSIGN_CTRL_RSA4096_4A8F9B"
  },
  {
    "officerId": "USR-REV-01",
    "officerName": "Col. S. Sundaram (Retd.)",
    "role": "Joint Reviewing Officer & Oversight Custodian",
    "signedAt": "2026-09-16T09:42:15.000Z",
    "digitalCertFingerprint": "SHA256:9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a",
    "cryptographicSignature": "0xSIGN_REV_RSA4096_7C12D0"
  }
]
```

### E. Tamper Alert Verification Output (Upon Unauthorized 1-Character Edit)
```
Status: TAMPER_DETECTED ❌
Canonical Hash: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
Computed Hash:  d9f1a23805c87a4bb7e29a8f309d431c19b6742510986e107ab23c914bf8201a
Integrity Match: 0.00% (Mismatch detected at Question #1)
System Action: Decryption pipeline locked down. Security alert transmitted to Vigilance Auditor.
```

### F. Forensic Audit Trail Log Output
```json
{
  "id": "LOG-014",
  "timestamp": "2026-09-16T10:00:02.140Z",
  "actorId": "USR-SUP-01",
  "actorName": "K. Murali, M.Sc.",
  "actorRole": "centre_superintendent",
  "category": "TIME_LOCK_RELEASE",
  "action": "Centre #104 Decrypted Question Paper",
  "severity": "NOTICE",
  "ipAddress": "10.14.88.74",
  "clientDevice": "Secured Terminal (CENTRE_TERMINAL_104)",
  "details": "Superintendent K. Murali authenticated KMS broadcast. Dynamic security watermarks applied to all rendered pages.",
  "cryptoProof": "0xKEY_RELEASE_1773824402140"
}
```

---

## 6. Security Standards Adherence
- **ISO/IEC 27001**: Information Security Management System controls for examination custody.
- **FIPS 140-3**: Cryptographic integrity and key isolation requirements.
- **CERT-In Guidelines**: Security best practices for online portals and competitive government testing infrastructure.
