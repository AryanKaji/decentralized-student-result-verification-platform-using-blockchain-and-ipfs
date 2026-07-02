# Product Requirement Document (PRD)
## Project: Decentralized Student Result Verification Platform

---

### 1. Document Control
* **Version**: 1.1 (Revision History & Audit Support)
* **Status**: Approved
* **Target Audience**: Development Team, Academic Administrators, Auditors

---

### 2. Product Vision & Value Proposition
Academic credential fraud and unauthorized database alterations pose high risks to the credibility of academic institutions. The **Decentralized Student Result Verification Platform** addresses this challenge by establishing a hybrid data verification framework. 

By integrating a local relational MongoDB database with decentralized IPFS storage and the immutable Ethereum blockchain (Sepolia Testnet), the system ensures that:
1. **No single point of failure** can compromise or lose student records.
2. **Any unauthorized database grade edits** are immediately detected and flagged.
3. **A complete, immutable audit trail** of all published grade revisions remains accessible on the blockchain history.

---

### 3. User Roles and Permission Matrix

| Role | Permissions | Dashboard Pages | Authentication |
| :--- | :--- | :--- | :--- |
| **Teacher** | Input, update, and delete grade records for their assigned subjects. | `/dashboard` | Credentials Login (JWT via NextAuth) |
| **Admin** | View class metrics, generate PDF transcripts, publish records to IPFS, and sign on-chain transactions. | `/admin` | Credentials Login (JWT via NextAuth) |
| **Public Verifier** | Search student records, download PDF credentials, and review verification/timeline audits. | `/result`, `/verify/[studentId]` | Anonymous Public Access (No Login Required) |

---

### 4. System Architecture & Core Workflows

The platform operates on a hybrid storage architecture:
1. **Dynamic Storage (MongoDB)**: Used for entering and editing student marks. This represents the "draft" state of grades.
2. **Decentralized Storage (IPFS via Pinata)**: Stores the generated cryptographically signed PDF transcript containing student grades and signature placeholders.
3. **Immutable Register (Ethereum Ledger)**: Stores a cryptographic hash (SHA-256) of the generated PDF buffer and the corresponding IPFS Content Identifier (CID). This forms the source of truth for verification.

```
                  +-----------------------------------+
                  |        TEACHER (Dashboard)        |
                  | Inputs subject marks to Database  |
                  +-----------------------------------+
                                    |
                                    v
                  +-----------------------------------+
                  |         DATABASE (MongoDB)        |
                  |  Saves marks. Subject to updates. |
                  +-----------------------------------+
                                    |
                                    v
                  +-----------------------------------+
                  |         ADMIN (Admin Panel)       |
                  |   Trigger Transcript Publication  |
                  +-----------------------------------+
                                    |
          +-------------------------+-------------------------+
          |                                                   |
          v                                                   v
+-----------------------------+                     +-----------------------------+
|    PDF ENGINE (pdf-lib)     |                     |    WEB3 ENGINE (Ethers.js)  |
| 1. Generates PDF            |                     | 1. Connects to Sepolia RPC  |
| 2. Computes SHA-256 Hash    |                     | 2. Invokes storeResult()    |
| 3. Uploads to Pinata IPFS   |                     | 3. Anchors Hash & IPFS CID  |
+-----------------------------+                     +-----------------------------+
          |                                                   |
          +-------------------------+-------------------------+
                                    |
                                    v
                  +-----------------------------------+
                  |    DATABASE UPDATE (MongoDB)      |
                  | Sets isLatest=false on old, and   |
                  | stores new Result with txHash,    |
                  | pdfHash, version, and reason.     |
                  +-----------------------------------+
```

---

### 5. Data Models (Schemas)

#### 5.1 User Schema ([`models/User.ts`](file:///d:/student-result-ipfs/models/User.ts))
Defines authentication entities (Admins and Teachers). Teachers have an assigned subject string.
```typescript
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "teacher"], required: true },
  subject: String, // Only populated for teachers
});
```

#### 5.2 Student Schema ([`models/Student.ts`](file:///d:/student-result-ipfs/models/Student.ts))
Defines student records.
```typescript
const StudentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  class: { type: String, required: true },
  roll: { type: Number, required: true },
});
```

#### 5.3 Mark Schema ([`models/Mark.ts`](file:///d:/student-result-ipfs/models/Mark.ts))
Stores subject marks assigned to students.
```typescript
const MarkSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  subject: { type: String, required: true },
  marks: { type: Number, required: true, min: 0, max: 100 },
});
```

#### 5.4 Result Schema ([`models/Result.ts`](file:///d:/student-result-ipfs/models/Result.ts))
Maintains the metadata of published transcripts, including their blockchain pointers and revision histories.
```typescript
const ResultSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, index: true },
    version: { type: Number, required: true },
    subjects: [
      {
        subject: String,
        marks: Number,
      },
    ],
    total: { type: Number, required: true },
    percentage: { type: Number, required: true },
    grade: { type: String, required: true },
    pdfUrl: String, // Pinata IPFS Gateway Link
    ipfsHash: String, // IPFS CID
    pdfHash: String, // Cryptographic SHA-256 PDF Hash
    txHash: String, // Ethereum Transaction Hash
    generatedBy: String, // Admin Email
    contractAddress: String, // Deployed Smart Contract Address
    isLatest: { type: Boolean, default: true },
    reason: { type: String, default: "Initial Publication" }, // Correction context
  },
  { timestamps: true }
);

// Compounded unique index ensures duplicate versioning is prevented
ResultSchema.index({ studentId: 1, version: 1 }, { unique: true });
```

---

### 6. Smart Contract Specification ([`contract/StudentResult.sol`](file:///d:/student-result-ipfs/contract/StudentResult.sol))

The Solidity contract stores audit trail records directly on-chain using an array of `Result` structures mapped to student IDs.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract StudentResult {
    struct Result {
        string studentId;
        string ipfsCid;
        string pdfHash;
        uint256 timestamp;
        address uploadedBy;
    }

    // Maps Student ID to an array of results to hold all historical revisions
    mapping(string => Result[]) private results;

    event ResultStored(
        string studentId,
        string ipfsCid,
        string pdfHash,
        uint256 timestamp,
        address uploadedBy
    );

    // Adds a new version to the student's result history array
    function storeResult(
        string memory studentId,
        string memory ipfsCid,
        string memory pdfHash
    ) public {
        results[studentId].push(
            Result({
                studentId: studentId,
                ipfsCid: ipfsCid,
                pdfHash: pdfHash,
                timestamp: block.timestamp,
                uploadedBy: msg.sender
            })
        );

        emit ResultStored(
            studentId,
            ipfsCid,
            pdfHash,
            block.timestamp,
            msg.sender
        );
    }

    // Fetches the latest element in the results array
    function getLatestResult(
        string memory studentId
    ) public view returns (
        string memory,
        string memory,
        string memory,
        uint256,
        address
    ) {
        require(results[studentId].length > 0, "Result not found");
        uint256 last = results[studentId].length - 1;
        Result memory r = results[studentId][last];
        return (r.studentId, r.ipfsCid, r.pdfHash, r.timestamp, r.uploadedBy);
    }

    // Fetches a specific historical index from the results array
    function getResultByIndex(
        string memory studentId,
        uint256 index
    ) public view returns(
        string memory,
        string memory,
        string memory,
        uint256,
        address
    ){
        require(index < results[studentId].length, "Invalid index");
        Result memory r = results[studentId][index];
        return (r.studentId, r.ipfsCid, r.pdfHash, r.timestamp, r.uploadedBy);
    }

    // Fetches the total number of publications/versions registered on-chain
    function getResultCount(
        string memory studentId
    ) public view returns (uint256) {
        return results[studentId].length;
    }
}
```

---

### 7. Key Backend API Specifications

#### 7.1 PDF Compile & Publish Route (`POST /api/pdf`)
* **Purpose**: Generates the PDF, uploads to IPFS, registers on the blockchain, and saves result data to MongoDB.
* **Code Implementation Outline** ([`app/api/pdf/route.ts`](file:///d:/student-result-ipfs/app/api/pdf/route.ts)):
```typescript
export async function POST(req: Request) {
  // 1. Authenticate and connect database
  await connectDB();
  const session = await getServerSession(authOptions);
  const { studentId, reason } = await req.json();

  // 2. Fetch marks and student info
  const student = await Student.findOne({ studentId });
  const marks = await Mark.find({ studentId });
  
  // 3. Compile PDF buffer using `pdf-lib`
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  // Drawing code...
  const bytes = await pdf.save();
  const buffer = Buffer.from(bytes);

  // 4. Compute SHA-256 hash of PDF
  const pdfHash = crypto.createHash("sha256").update(buffer).digest("hex");

  // 5. Upload PDF to Pinata IPFS
  const file = new File([buffer], `${studentId}.pdf`, { type: "application/pdf" });
  const uploaded = await pinata.upload.public.file(file);

  // 6. Anchor to Smart Contract
  const tx = await contract.storeResult(studentId, uploaded.cid, pdfHash);
  const receipt = await tx.wait();

  // 7. Update existing database pointer & save version record
  const latest = await Result.findOne({ studentId }).sort({ version: -1 });
  const version = latest ? latest.version + 1 : 1;
  await Result.updateMany({ studentId, isLatest: true }, { isLatest: false });

  const newResult = await Result.create({
    studentId,
    version,
    subjects: marks,
    total: totalMarks,
    percentage: calcPercentage,
    grade: finalGrade,
    pdfUrl: `https://gateway.pinata.cloud/ipfs/${uploaded.cid}`,
    ipfsHash: uploaded.cid,
    pdfHash,
    txHash: tx.hash,
    generatedBy: session?.user?.email,
    contractAddress: process.env.CONTRACT_ADDRESS,
    isLatest: true,
    reason: reason || "Initial Publication",
  });

  return NextResponse.json({ success: true, ...newResult });
}
```

#### 7.2 Verification Route (`GET /api/verify/[studentId]`)
* **Purpose**: Compiles a fresh verification check comparison between the current database, published MongoDB results, and the Sepolia ledger.
* **Code Implementation Outline** ([`app/api/verify/[studentId]/route.ts`](file:///d:/student-result-ipfs/app/api/verify/%5BstudentId%5D/route.ts)):
```typescript
export async function GET(req: Request, { params }: { params: Promise<{ studentId: string }> }) {
  await connectDB();
  const { studentId } = await params;

  const student = await Student.findOne({ studentId });
  const published = await Result.findOne({ studentId, isLatest: true });
  const currentMarks = await Mark.find({ studentId });

  // 1. Fetch blockchain state
  const blockchain = await contract.getLatestResult(studentId);
  const blockchainPdfHash = blockchain[2];
  const blockchainCid = blockchain[1];

  // 2. Compute Parity Checks
  const databaseChanged = 
    currentMarks.length !== published.subjects.length ||
    published.subjects.some(oldSub => {
      const latest = currentMarks.find(m => m.subject === oldSub.subject);
      return !latest || latest.marks !== oldSub.marks;
    });

  const blockchainChanged = 
    blockchainPdfHash.toLowerCase() !== published.pdfHash.toLowerCase() ||
    blockchainCid !== published.ipfsHash;

  const verified = !databaseChanged && !blockchainChanged;

  return NextResponse.json({
    verified,
    databaseChanged,
    blockchainChanged,
    publishedHash: published.pdfHash,
    blockchainHash: blockchainPdfHash,
    blockchainCid,
    published,
  });
}
```

#### 7.3 Version History Route (`GET /api/history/[studentId]`)
* **Purpose**: Returns all historical versions of a student's transcripts stored in MongoDB.
* **Code Implementation** ([`app/api/history/[studentId]/route.ts`](file:///d:/student-result-ipfs/app/api/history/%5BstudentId%5D/route.ts)):
```typescript
export async function GET(req: Request, { params }: { params: Promise<{ studentId: string }> }) {
    await connectDB();
    const { studentId } = await params;
    const history = await Result.find({ studentId }).sort({ version: -1 });
    return NextResponse.json(history);
}
```

---

### 8. UI/UX Verification Timeline Page ([`app/verify/[studentId]/page.tsx`](file:///d:/student-result-ipfs/app/verify/%5BstudentId%5D/page.tsx))

The timeline verification component provides an interactive interface displaying the audit timeline of results.

1. **Global Integrity Status Header**: Shows a large **`VERIFIED`** (green shield) or **`VERIFICATION FAILED`** (red warning shield) banner depending on the API parity check.
2. **Detailed Checks Breakdown**: Displays a comparison between current PDF hash and the registered blockchain hash.
3. **Audit Trail Timeline Card Layout**:
   * Uses a timeline vertical border structure.
   * Maps through all items returned by the `/api/history/[studentId]` API.
   * Highlights the current active version card in green (`bg-green-50 border-green-500`).
   * Displays historical versions, complete with:
     * Version ID, date/time, and editor administrator's email.
     * Calculated statistics (total, percentage, grade).
     * Clickable links: **Download PDF** (IPFS Link), **View Transaction** (Sepolia Etherscan), **View IPFS Metadata**.
   * Shows a **Revision Notice** for older cards, warning that while superseded, the block history remains immutable.

---

### 9. Example Production Scenarios

#### Scenario A: First-time Publication
1. Teacher Rajesh enters marks for Student Riya Jariwala (`ST002`) in *Object Oriented Programming*: `85`.
2. Admin publishes the result.
3. **Result**:
   * MongoDB stores version `1` of `Result` with `isLatest: true`.
   * Blockchain `results["ST002"]` array receives its first entry containing IPFS CID `QmXyZ...` and PDF SHA-256 Hash `c157a...`.
   * Verifying `ST002` queries `getLatestResult` (which points to index `0`), compares it to MongoDB, and displays `VERIFIED`.

#### Scenario B: Grade Correction (Revision)
1. Teacher Rajesh realizes Riya Jariwala's correct exam mark is `92` instead of `85`, updates the mark in `/dashboard`.
2. Verifier searches `ST002`. Since the database grade is now `92` but the published PDF version is built with `85`, the tamper check flags **`VERIFICATION FAILED: Database Changed`** (Alerts verifier that the draft marks mismatch the published transcript).
3. Admin clicks **Publish to IPFS** with revision reason: `"Re-evaluation adjustment"`.
4. **Result**:
   * MongoDB updates Version `1` `isLatest: false` and inserts Version `2` with `isLatest: true`, reason: `"Re-evaluation adjustment"`.
   * Solidity invokes `storeResult`, appending the new PDF hash `d289b...` and CID `QmYwZ...` to the mapping array.
   * The verifier clicks **Verify History**. The audit timeline displays **Version 2** as current and verified, and lists **Version 1** below it with a revision notice showing the historical score of `85`.

#### Scenario C: Direct MongoDB Tampering
1. An intruder gains unauthorized access to MongoDB and directly edits Riya's stored result PDF hash or CID in the `Result` collection.
2. Visitor queries `ST002`. The API calls the Sepolia contract's `getLatestResult("ST002")` on-chain.
3. **Result**: The contract returns the true PDF hash `d289b...` but the database contains the edited entry. The tamper engine detects the mismatch and flags **`VERIFICATION FAILED: Blockchain Mismatch`**, alerting the verifier that the database record has been compromised.
