# CivicConnect AI - Testing & Verification Checklist

## 1. Automated Test Suite Summary

Run the automated backend test suite using Maven:
```powershell
# From the backend directory:
& "C:\Users\Shalini\.m2\apache-maven-3.9.6\bin\mvn.cmd" clean test
```

### Verified Test Results:
* **Total Tests Run:** 12
* **Failures:** 0
* **Errors:** 0
* **Skipped:** 0
* **Build Status:** `BUILD SUCCESS`

| Test Suite | Test Case | Expected Result | Status |
|---|---|---|---|
| `AuthControllerTest` | `testCitizenRegisterAndLogin` | Registers citizen, checks duplicate rejection, logs in and receives JWT | PASSED |
| `AuthControllerTest` | `testValidationFailure` | Rejects missing/blank required fields with HTTP 400 | PASSED |
| `AuthorityServiceTest` | `testValidLifecycleTransitions` | Progresses `SUBMITTED` &rarr; `UNDER_REVIEW` &rarr; `IN_PROGRESS` &rarr; `RESOLVED` | PASSED |
| `AuthorityServiceTest` | `testInvalidTransitionThrowsException` | Blocks skipping states (e.g. `SUBMITTED` directly to `RESOLVED`) | PASSED |
| `AuthorityServiceTest` | `testRejectionRequiresExplanation` | Throws `BadRequestException` if `REJECTED` without remark | PASSED |
| `AuthorityServiceTest` | `testDepartmentAssignmentAndClassification` | Updates department, officer, and adjusted category/priority | PASSED |
| `ComplaintAnalysisServiceTest` | `testRoadClassificationHighPriority` | Classifies pothole crater as `ROADS` + `HIGH` | PASSED |
| `ComplaintAnalysisServiceTest` | `testWaterSupplyClassification` | Classifies drinking water pipe burst as `WATER_SUPPLY` | PASSED |
| `ComplaintAnalysisServiceTest` | `testElectricityHazard` | Classifies sparking live wire as `ELECTRICITY` + `HIGH` | PASSED |
| `ComplaintAnalysisServiceTest` | `testSanitationClassification` | Classifies garbage dump overflow as `SANITATION` + `MEDIUM` | PASSED |
| `ComplaintAnalysisServiceTest` | `testDrainageClassification` | Classifies sewage and rainwater overflow as `DRAINAGE` | PASSED |
| `ComplaintAnalysisServiceTest` | `testFallbackClassification` | Classifies non-matching text as `OTHER` with 0.50 confidence | PASSED |

---

## 2. Manual Testing Checklist

| Test ID | Test Scenario | Steps | Expected Result | Actual Result |
|---|---|---|---|---|
| **TC-01** | Public Landing Page Navigation | Open `http://localhost:5173` | Landing page renders with CivicConnect branding, hero statistics, how-it-works cards, and quick demo credentials | Pass |
| **TC-02** | Citizen Registration | Click Register, fill name, email, password & submit | Account created, redirected to Login with success prompt | Pass |
| **TC-03** | Prevent Public Authority Registration | Attempt register as authority | Public registration form only creates `CITIZEN` accounts | Pass |
| **TC-04** | Citizen Login | Sign in with `citizen@example.com` / `Citizen@123` | Redirects to Citizen Dashboard with KPI stat cards & recent items | Pass |
| **TC-05** | Live AI Complaint Analysis Preview | Navigate to File Complaint, enter *"Dangerous live wire sparking on road"* & click "Analyze Text with AI" | AI detects `ELECTRICITY` category, `HIGH` priority, high confidence & explanation | Pass |
| **TC-06** | Complaint Submission with Photo | Attach JPEG/PNG photo, fill location, submit complaint | New complaint created, unique `CC-2026-XXXX` reference issued, initial `SUBMITTED` history logged | Pass |
| **TC-07** | Search & Filter My Complaints | In My Complaints, search by reference ID and filter by category | Matching complaint is displayed; empty state shown if no match | Pass |
| **TC-08** | Citizen Ownership Isolation | Citizen attempts to access another citizen's private edit | Endpoints strictly enforce ownership checks | Pass |
| **TC-09** | Authority Console Access Guard | Attempt visiting `/authority` as a citizen | System displays "Unauthorized Access" guard card | Pass |
| **TC-10** | Authority Login & Dashboard | Sign in with `admin@civicconnect.gov` / `Admin@123` | Authority Dashboard displays total complaints, category & status distribution charts | Pass |
| **TC-11** | Department & Officer Assignment | Open complaint details in Authority console, select "Public Works Department", officer "R. Sharma", save | Assignment saved and logged to audit trail | Pass |
| **TC-12** | Valid Status Transition | Change status `SUBMITTED` &rarr; `UNDER_REVIEW` with remark | Status updates to `UNDER_REVIEW`, new audit log entry created | Pass |
| **TC-13** | Second Status Transition | Change status `UNDER_REVIEW` &rarr; `IN_PROGRESS` | Status updates to `IN_PROGRESS`, audit trail records timestamp | Pass |
| **TC-14** | Resolution Completion | Change status `IN_PROGRESS` &rarr; `RESOLVED` | Complaint marked `RESOLVED`, marked in green on citizen tracker | Pass |
| **TC-15** | Mandatory Rejection Rationale | Attempt changing status to `REJECTED` with empty remarks | Backend & frontend block submission; requires explanation note | Pass |
| **TC-16** | Public Complaint Tracking by ID | On home page search bar, enter `CC-2026-XXXX` | Full status history, assigned department, and photos visible | Pass |
