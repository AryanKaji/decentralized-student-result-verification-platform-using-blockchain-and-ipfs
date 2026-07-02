# Decentralized Student Result Verification Platform

A secure, tamper-proof, and decentralized academic transcript management and verification portal. Built using Next.js, MongoDB, Ethereum (Sepolia Testnet), and IPFS (via Pinata).

This platform allows instructors to manage subject marks, enables administrators to compile transcripts into cryptographically signed PDFs, uploads them to IPFS, anchors their hash on the Ethereum blockchain, and allows anyone to verify the credentials' integrity without registration.

---

## 🏗️ Architecture & How It Works

The platform operates on a three-tier architecture combining a traditional database for dynamic records, decentralized storage for document distribution, and a public ledger for integrity verification:

```
  +------------------+         +------------------+         +----------------------+
  |  Teacher Portal  | ------> |  MongoDB Atlas   | <-----> |   Verifier Portal    |
  | (Input/Edit Marks)         |  (Student/Marks) |         | (Public Lookup Pages)|
  +------------------+         +------------------+         +----------------------+
                                        |                              ^
                                        v                              |
                               +------------------+                    |
                               |   Admin Portal   |                    |
                               | (Publish Result) |                    |
                               +------------------+                    |
                                        |                              |
                   +--------------------+--------------------+         |
                   |                                         |         |
                   v                                         v         |
         +-------------------+                     +-------------------+
         |    Pinata IPFS    |                     | Ethereum Sepolia  |
         | (PDF Transcripts) |                     |  (Anchor Hashes)  |
         +-------------------+                     +-------------------+
```

### 1. Grade Input (Teachers)
* Teachers log in and are presented with a grading assessment ledger for their assigned subject.
* They can save, update, or delete marks (0–100) for registered students.

### 2. PDF Generation & IPFS Upload (Administrators)
* Admins view the student assessment database. When they click **Publish to IPFS**:
  1. The server compiles a professional academic transcript PDF in memory using `pdf-lib`.
  2. The server calculates a cryptographic SHA-256 hash of the generated PDF buffer.
  3. The PDF is uploaded to IPFS decentralized storage using the Pinata SDK.
  4. The server initiates a transaction on the Ethereum blockchain to store `(studentId, ipfsCid, pdfHash)` on the deployed smart contract.
  5. After blockchain transaction receipt validation, the result metadata, PDF URL, IPFS CID, and transaction hash are stored in MongoDB as the latest versioned `Result`.

### 3. Public Verification (Anyone)
* Visitors search using a Student ID.
* The system fetches current grades, published results, and queries the Sepolia smart contract.
* **Tamper Detection Logic**:
  * **Database Changed**: Flagged if current database marks differ from the values compiled into the published result in MongoDB.
  * **Blockchain Changed**: Flagged if the on-chain IPFS CID or PDF Hash does not match the published values stored in the database.
  * **Verified**: Flagged only if the database records are in parity with the published result, and the published result's hashes match the immutable data on-chain.

---

## 🛠️ Technology Stack

* **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS, Lucide React icons.
* **Backend**: Next.js Route Handlers (API Routes), NextAuth.js (Credentials Authentication).
* **Database**: MongoDB & Mongoose ORM.
* **Blockchain**: Solidity (Smart Contract), Ethers.js v6 (Contract interaction), Sepolia Testnet.
* **Decentralized Storage**: Pinata IPFS.
* **Libraries**: `pdf-lib` (PDF generation), `crypto` (SHA-256 hashing), `bcryptjs` (password hashing), `zod` (validation).

---

## 📋 Smart Contract Details

The smart contract is written in Solidity (`^0.8.20`) and is deployed on the Sepolia network. It maps a unique `studentId` to an array of result records, allowing for full revision history tracking:

```solidity
struct Result {
    string studentId;
    string ipfsCid;
    string pdfHash;
    uint256 timestamp;
    address uploadedBy;
}

// Stores an array of results for each student to enable audit trails
mapping(string => Result[]) private results;
```

### Core Functions:
* `storeResult(string studentId, string ipfsCid, string pdfHash)`: Pushes a new result record onto the student's on-chain result history array.
* `getLatestResult(string studentId)`: Returns the most recent result details `(studentId, ipfsCid, pdfHash, timestamp, uploadedBy)`.
* `getResultByIndex(string studentId, uint256 index)`: Returns a specific result from the student's historical results by index.
* `getResultCount(string studentId)`: Returns the total number of result records stored on-chain for the student.

Contract File: [`contract/StudentResult.sol`](file:///d:/student-result-ipfs/contract/StudentResult.sol)  
ABI Registry: [`lib/abi.ts`](file:///d:/student-result-ipfs/lib/abi.ts)

---

## 🗄️ Database Schema & Integrity

The MongoDB database maintains the application state for users, student details, grade logs, and historical publications. 

### Result Schema [[Result.ts](file:///d:/student-result-ipfs/models/Result.ts)]
Each published transcript is stored in the `results` collection. To guarantee record uniqueness and version integrity:
* **Compound Unique Index**: A unique index is defined on `{ studentId: 1, version: 1 }` to prevent double-publishing or version collisions for any student.
* **Schema Fields**:
  * `studentId`: String (required, indexed) - Reference to the student's registration ID.
  * `version`: Number (required) - Auto-incrementing version number for the transcript.
  * `subjects`: Array of `{ subject, marks }` - Complete grade breakdown at the time of publication.
  * `total`: Number (required) - Sum of all marks.
  * `percentage`: Number (required) - Calculated grade percentage.
  * `grade`: String (required) - Calculated letter grade (A+, A, B, C, D, F).
  * `pdfUrl`: String - Pinata IPFS gateway URL for downloading the PDF.
  * `ipfsHash`: String - IPFS Content Identifier (CID).
  * `pdfHash`: String - SHA-256 cryptographic hash of the compiled PDF.
  * `txHash`: String - Sepolia Ethereum transaction hash.
  * `isLatest`: Boolean (default: `true`) - Flags the active published record.
  * `reason`: String (default: `"Initial Publication"`) - Explanation of why the result version was published (e.g. correction, re-check).

---

## ⚙️ Environment Variables Setup

Create a `.env.local` file in the root directory. Below is the required template (do not share actual credentials on public repos):

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=your_nextauth_jwt_secret_key

# MongoDB Connection
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<db-name>

# Pinata IPFS SDK Credentials
PINATA_JWT=your_pinata_jwt_token
PINATA_API_KEY=your_pinata_api_key
API_SECRET=your_pinata_api_secret

# Blockchain Web3 Credentials
CONTRACT_ADDRESS=your_deployed_smart_contract_address
RPC_URL=https://sepolia.infura.io/v3/your_infura_project_id
PRIVATE_KEY=your_system_wallet_private_key
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Seed Database
Seeding provides the basic teacher accounts, subjects, and mock students.
```bash
# Seed Teacher Accounts and Assign Subjects
node scripts/seed.js

# Seed Mock Student Profiles
node scripts/seedStud.js
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Login Accounts (Default Seed)
All accounts seeded by default share the password: `123456`

| Role | Email | Assigned Subject / Role |
| :--- | :--- | :--- |
| **Admin** | `admin@mail.com` | Publishes results to Blockchain & IPFS |
| **Teacher** | `rajesh.sharma@mail.com` | Object Oriented Programming and Methodology |
| **Teacher** | `krisha.kansara@mail.com` | Database Management System |
| **Teacher** | `amit.verma@mail.com` | Data Structures and Algorithms |
| **Teacher** | `prachi.champaneria@mail.com` | Computer Networks |
| **Teacher** | `vivek.surati@mail.com` | Operating Systems |
| **Teacher** | `kunal.joshi@mail.com` | Web Technology |
| **Teacher** | `arvind.nair@mail.com` | Artificial Intelligence |

---

## 📂 Project Directory Structure

```
student-result-ipfs/
├── app/                  # Next.js Pages & Routing
│   ├── admin/            # Admin Control Panel (Publish to IPFS)
│   ├── api/              # API Endpoints (Auth, Marks, PDF, Verify, Students)
│   │   ├── auth/         # NextAuth registration
│   │   ├── history/      # Fetch historical publication logs
│   │   ├── pdf/          # PDF generation, Pinata upload & blockchain write
│   │   └── verify/       # Hash comparisons & Web3 queries
│   ├── components/       # Shared React Components (Navbar, etc.)
│   ├── dashboard/        # Teacher Subject Grades Ledger
│   ├── login/            # Sign In page
│   ├── result/           # Public credentials verification portal
│   └── verify/[studentId]# Blockchain verification & revision timeline portal
├── contract/             # Smart Contract source files
├── lib/                  # DB, ABI, and Ethers.js connection handlers
├── models/               # MongoDB Mongoose schemas (User, Student, Mark, Result)
├── scripts/              # Database mock data seeding scripts
└── package.json          # Node dependencies and scripts
```
