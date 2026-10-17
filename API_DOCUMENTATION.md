# CivicConnect AI - REST API Documentation

Base URL: `http://localhost:8080` (Proxied via Vite development server at `http://localhost:5173/api`)

Authentication Scheme: Standard HTTP Bearer Token (`Authorization: Bearer <JWT_TOKEN>`)

---

## 1. Authentication APIs

### Register Citizen Account
* **Endpoint:** `POST /api/auth/register`
* **Access:** Public
* **Description:** Creates a verified citizen account. Public registration is strictly restricted from granting `AUTHORITY` privileges.
* **Request Body:**
```json
{
  "fullName": "Ravi Kumar",
  "email": "ravi@example.com",
  "password": "Password@123",
  "phone": "+91 9876543210"
}
```
* **Response (201 Created):**
```json
{
  "id": 1,
  "fullName": "Ravi Kumar",
  "email": "ravi@example.com",
  "phone": "+91 9876543210",
  "role": "CITIZEN"
}
```

### Sign In
* **Endpoint:** `POST /api/auth/login`
* **Access:** Public
* **Description:** Authenticates credentials and issues a signed JWT token valid for 24 hours.
* **Request Body:**
```json
{
  "email": "citizen@example.com",
  "password": "Citizen@123"
}
```
* **Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "user": {
    "id": 1,
    "fullName": "Ravi Kumar",
    "email": "citizen@example.com",
    "phone": "+1 555-0199",
    "role": "CITIZEN"
  }
}
```

---

## 2. AI Complaint Analysis & Citizen APIs

### AI Classification Preview
* **Endpoint:** `POST /api/complaints/analyze`
* **Access:** Public
* **Description:** Evaluates complaint text using the NLP rule-based classifier and returns suggested category, priority, confidence score, and explanation before submission.
* **Request Body:**
```json
{
  "title": "Dangerous deep crater on Main Road",
  "description": "Massive pothole causing vehicles to skid. Accident hazard."
}
```
* **Response (200 OK):**
```json
{
  "predictedCategory": "ROADS",
  "predictedPriority": "HIGH",
  "confidenceScore": 0.94,
  "explanation": "Rule-based classifier matched key indicators [crater, pothole, road] mapping to category 'ROADS'. High priority assigned due to urgent/safety keywords: [accident, dangerous]."
}
```

### File a Complaint (Multipart Upload)
* **Endpoint:** `POST /api/complaints`
* **Access:** Authenticated (`CITIZEN` or `AUTHORITY`)
* **Content-Type:** `multipart/form-data`
* **Form Fields:**
  * `title` (string, required)
  * `description` (string, required)
  * `location` (string, required)
  * `category` (string, optional: `ROADS`, `WATER_SUPPLY`, `ELECTRICITY`, `SANITATION`, `DRAINAGE`, `PUBLIC_SAFETY`, `OTHER`)
  * `priority` (string, optional: `LOW`, `MEDIUM`, `HIGH`)
  * `image` (binary file, optional: JPEG, PNG, or WebP up to 5MB)
* **Response (201 Created):**
```json
{
  "id": 5,
  "referenceId": "CC-2026-F91A",
  "title": "Dangerous deep crater on Main Road",
  "description": "Massive pothole causing vehicles to skid.",
  "category": "ROADS",
  "priority": "HIGH",
  "status": "SUBMITTED",
  "imageUrl": "a931d87e-e11a-4632-bd92.jpg",
  "location": "Near Metro Gate 1",
  "department": null,
  "assignedOfficer": null,
  "aiConfidenceScore": 0.94,
  "aiExplanation": "Rule-based classifier matched...",
  "citizenId": 1,
  "citizenName": "Ravi Kumar",
  "citizenEmail": "citizen@example.com",
  "createdAt": "2026-10-10T21:30:00",
  "updatedAt": "2026-10-10T21:30:00"
}
```

### Get My Complaints
* **Endpoint:** `GET /api/complaints/my`
* **Access:** Authenticated (`CITIZEN`)
* **Query Parameters:** `search`, `category`, `priority`, `status`, `page` (default 0), `size` (default 10)
* **Response (200 OK):** Spring Data Page object with `content`, `totalElements`, `totalPages`.

### Get Complaint by Reference or ID
* **Endpoint:** `GET /api/complaints/{id}`
* **Access:** Public / Citizen tracking
* **Path Variable:** Numeric ID or Reference string (`CC-2026-1001`)
* **Response (200 OK):** Full complaint details including `statusHistory` array and official `remarks` array.

### Get Complaint Status History
* **Endpoint:** `GET /api/complaints/{id}/history`
* **Access:** Public / Citizen tracking
* **Response (200 OK):** Array of historical lifecycle state changes with timestamps, officers, and remarks.

### Get Citizen Dashboard Statistics
* **Endpoint:** `GET /api/complaints/stats`
* **Access:** Authenticated (`CITIZEN`)
* **Response (200 OK):**
```json
{
  "total": 3,
  "pending": 1,
  "inProgress": 1,
  "resolved": 1
}
```

### Download / View Uploaded Evidence Photo
* **Endpoint:** `GET /api/complaints/images/{fileName}`
* **Access:** Public / Safe resource streaming
* **Response (200 OK):** Image binary stream with appropriate `image/jpeg` or `image/png` Content-Type.

---

## 3. Municipal Authority APIs

### List All Complaints for Review
* **Endpoint:** `GET /api/authority/complaints`
* **Access:** Restricted (`AUTHORITY` role only)
* **Query Parameters:** `search`, `category`, `priority`, `status`, `page`, `size`
* **Response (200 OK):** Paginated complaints list.

### Get Authority Dashboard Metrics
* **Endpoint:** `GET /api/authority/dashboard`
* **Access:** Restricted (`AUTHORITY` role only)
* **Response (200 OK):**
```json
{
  "totalComplaints": 4,
  "submitted": 1,
  "underReview": 1,
  "inProgress": 1,
  "resolved": 1,
  "rejected": 0,
  "categoryDistribution": {
    "ROADS": 1,
    "WATER_SUPPLY": 1,
    "ELECTRICITY": 1,
    "SANITATION": 1,
    "DRAINAGE": 0,
    "PUBLIC_SAFETY": 0,
    "OTHER": 0
  },
  "statusDistribution": {
    "SUBMITTED": 1,
    "UNDER_REVIEW": 1,
    "IN_PROGRESS": 1,
    "RESOLVED": 1,
    "REJECTED": 0
  }
}
```

### Update Complaint Status
* **Endpoint:** `PATCH /api/authority/complaints/{id}/status`
* **Access:** Restricted (`AUTHORITY` role only)
* **Permitted Transitions:**
  * `SUBMITTED` &rarr; `UNDER_REVIEW`, `REJECTED`
  * `UNDER_REVIEW` &rarr; `IN_PROGRESS`, `REJECTED`
  * `IN_PROGRESS` &rarr; `RESOLVED`, `REJECTED`
* **Validation:** Transitioning to `REJECTED` requires a mandatory non-blank `remarks` field.
* **Request Body:**
```json
{
  "status": "UNDER_REVIEW",
  "remarks": "Assigned to Ward 12 field inspector for verification."
}
```

### Review & Update Classification
* **Endpoint:** `PATCH /api/authority/complaints/{id}/classification`
* **Access:** Restricted (`AUTHORITY` role only)
* **Request Body:**
```json
{
  "category": "DRAINAGE",
  "priority": "HIGH",
  "rationale": "Inspection revealed deep sewage backflow instead of surface runoff."
}
```

### Assign Department & Officer
* **Endpoint:** `PATCH /api/authority/complaints/{id}/assignment`
* **Access:** Restricted (`AUTHORITY` role only)
* **Request Body:**
```json
{
  "department": "Public Works Department (Roads)",
  "assignedOfficer": "Inspector R. Sharma"
}
```

### Add Official Remark
* **Endpoint:** `POST /api/authority/complaints/{id}/remarks`
* **Access:** Restricted (`AUTHORITY` role only)
* **Request Body:**
```json
{
  "remarkText": "Patch work completed at 3:00 PM. Traffic flow restored."
}
```
