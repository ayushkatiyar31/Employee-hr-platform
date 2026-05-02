# API Endpoints & Database Schema Reference

## 📡 Complete API Specification

### **Authentication Endpoints** (`/api/auth`)

| Method | Endpoint | Auth | Payload | Response | Notes |
|--------|----------|------|---------|----------|-------|
| POST | `/login` | No | `{email, password}` | `{token, user}` | Returns JWT token |
| POST | `/register` | No | `{name, email, password}` | `{user, token}` | Creates User with role 'employee' |
| GET | `/me` | Yes | - | `{user}` | Current authenticated user |

---

### **Employee Endpoints** (`/api/employees`)

| Method | Endpoint | Auth | Role | Request | Response |
|--------|----------|------|------|---------|----------|
| GET | `/` | Yes | admin/hr | Query: `page, limit, search` | `{employees: [], total, pages}` |
| GET | `/:id` | Yes | admin/hr | - | `{employee}` |
| POST | `/` | Yes | admin/hr | `{name, email, department, ...}` | `{employee, _id}` |
| PUT | `/:id` | Yes | admin/hr | `{field: value, ...}` | `{employee}` |
| DELETE | `/:id` | Yes | admin | - | `{message: "Deleted"}` |
| GET | `/me/profile` | Yes | - | - | `{employee}` - Own profile |
| PUT | `/me/profile` | Yes | - | `{phone, address, ...}` | `{employee}` - Update own profile |

**Employee Object**:
```javascript
{
  _id: ObjectId,
  user: ObjectId (User ref),
  employeeCode: String,
  name: String,
  email: String,
  phone: String,
  department: String,
  designation: String,
  joiningDate: Date,
  dateOfBirth: Date,
  salary: Number,
  status: 'active' | 'inactive',
  address: String,
  emergencyContact: String,
  profileImage: String (URL),
  documents: [{name, url, uploadedAt}]
}
```

---

### **Leave Endpoints** (`/api/leaves`)

| Method | Endpoint | Auth | Role | Request | Response |
|--------|----------|------|------|---------|----------|
| GET | `/` | Yes | admin/hr/manager | Query: `status, month, year` | `{leaves: [], total}` |
| POST | `/` | Yes | employee | `{leaveType, startDate, endDate, days, reason}` | `{leave, _id}` |
| PUT | `/:id/status` | Yes | admin/hr/manager | `{status, approvedBy}` | `{leave}` |
| GET | `/my-leaves` | Yes | employee | - | `{leaves: []}` |

**Leave Object**:
```javascript
{
  _id: ObjectId,
  employee: ObjectId (Employee ref),
  employeeId: String,
  employeeName: String,
  leaveType: 'annual' | 'sick' | 'maternity' | 'emergency',
  startDate: Date,
  endDate: Date,
  days: Number,
  reason: String,
  status: 'pending' | 'approved' | 'rejected',
  appliedDate: Date,
  approvedBy: String,
  approvedDate: Date,
  statusUpdatedAt: Date
}
```

**Leave Type Rules** (Document):
- **Annual**: 20 days/year
- **Sick**: 10 days/year
- **Maternity**: 90 days (female only)
- **Emergency**: 5 days/year

---

### **Attendance Endpoints** (`/api/attendance`)

| Method | Endpoint | Auth | Role | Request | Response |
|--------|----------|------|------|---------|----------|
| GET | `/` | Yes | admin/hr/manager | Query: `date, month, employeeId` | `{attendance: [], total}` |
| GET | `/me` | Yes | - | Query: `month, year` | `{attendance: []}` - My records |
| POST | `/check-in` | Yes | employee | - | `{checkIn: Timestamp}` |
| POST | `/check-out` | Yes | employee | - | `{checkOut: Timestamp}` |

**Attendance Object**:
```javascript
{
  _id: ObjectId,
  employee: ObjectId (Employee ref),
  date: Date,
  checkInTime: Timestamp,
  checkOutTime: Timestamp,
  duration: Number (in minutes),
  status: 'present' | 'absent' | 'late',
  notes: String
}
```

---

### **Payroll Endpoints** (`/api/payrolls`)

| Method | Endpoint | Auth | Role | Request | Response |
|--------|----------|------|------|---------|----------|
| GET | `/` | Yes | admin/hr | Query: `month, year` | `{payrolls: [], total}` |
| GET | `/me` | Yes | employee | Query: `month, year` | `{payslips: []}` |
| POST | `/` | Yes | admin/hr | `{employeeId, month, year, salary, deductions, ...}` | `{payroll, _id}` |

**Payroll Object**:
```javascript
{
  _id: ObjectId,
  employee: ObjectId (Employee ref),
  month: Number (1-12),
  year: Number,
  baseSalary: Number,
  allowances: Number,
  deductions: Number,
  tax: Number,
  netSalary: Number,
  processedDate: Date,
  status: 'draft' | 'finalized',
  createdAt: Date
}
```

---

### **Announcement Endpoints** (`/api/announcements`)

| Method | Endpoint | Auth | Role | Request | Response |
|--------|----------|------|------|---------|----------|
| GET | `/` | Yes | - | - | `{announcements: []}` |
| POST | `/` | Yes | admin/hr | `{title, content, priority}` | `{announcement, _id}` |
| DELETE | `/:id` | Yes | admin | - | `{message: "Deleted"}` |

**Announcement Object**:
```javascript
{
  _id: ObjectId,
  title: String,
  content: String,
  createdBy: ObjectId (User ref),
  createdDate: Date,
  priority: 'high' | 'medium' | 'low',
  expiryDate: Date
}
```

---

### **Dashboard Endpoints** (`/api/dashboard`)

| Method | Endpoint | Auth | Role | Request | Response |
|--------|----------|------|------|---------|----------|
| GET | `/admin` | Yes | admin | - | `{totalEmployees, activeEmployees, leavesThisMonth, attendanceRate, ...}` |
| GET | `/employee` | Yes | employee | - | `{myLeaves, myAttendance, mySalary, myDetails, ...}` |

**Admin Dashboard Response**:
```javascript
{
  totalEmployees: Number,
  activeEmployees: Number,
  inactiveEmployees: Number,
  totalLeavesPending: Number,
  totalLeavesApproved: Number,
  avgAttendanceRate: Number,
  avgSalary: Number,
  announcements: Number,
  departmentBreakdown: {dept: count, ...}
}
```

---

## 💾 Database Schema Relationships

```
┌─────────────────────────────────────────────┐
│           User Collection                    │
│  _id, name, email, password, role, isActive │
└──────────────┬────────────────────────────────┘
               │
               ├─────────────────────┐
               │                     │
        (1:1 ref)              (1:many ref)
               │                     │
        ┌──────▼──────┐      ┌──────▼──────────┐
        │ Employee     │      │ Announcement    │
        │ Collection   │      │ Collection      │
        └──────┬───────┘      └─────────────────┘
               │
        (1:many ref - multiple refs to Employee)
               │
    ┌──────────┼──────────┬──────────────┐
    │          │          │              │
    ▼          ▼          ▼              ▼
┌─────────┐ ┌─────────┐ ┌────────┐ ┌──────────┐
│ Leave   │ │Attendance│Payroll  │Documents  │
│         │ │          │         │(embedded) │
└─────────┘ └──────────┘ └────────┘ └──────────┘
```

---

## 🔐 Authentication & Authorization

### JWT Token Structure
```javascript
{
  header: {
    alg: 'HS256',
    typ: 'JWT'
  },
  payload: {
    userId: '...',
    email: 'user@example.com',
    role: 'admin' | 'hr' | 'manager' | 'employee',
    iat: 1234567890,
    exp: 1234571490  // Expires in 1 hour
  },
  signature: 'HMACSHA256(header.payload, secret)'
}
```

### Role Permissions Matrix

| Feature | Admin | HR | Manager | Employee |
|---------|-------|----|---------|---------| 
| View All Employees | ✅ | ✅ | ✅ (team only) | ❌ |
| Create Employee | ✅ | ✅ | ❌ | ❌ |
| Update Employee | ✅ | ✅ | ❌ | ❌ (own profile only) |
| Delete Employee | ✅ | ❌ | ❌ | ❌ |
| View Leaves | ✅ | ✅ | ✅ | ✅ (own only) |
| Apply Leave | ✅ | ✅ | ✅ | ✅ |
| Approve Leave | ✅ | ✅ | ✅ | ❌ |
| View Attendance | ✅ | ✅ | ✅ | ✅ (own only) |
| Check-in/out | ✅ | ✅ | ✅ | ✅ |
| Manage Payroll | ✅ | ✅ | ❌ | ❌ |
| View Payslip | ✅ | ✅ | ❌ | ✅ (own only) |
| Create Announcement | ✅ | ✅ | ❌ | ❌ |
| View Announcement | ✅ | ✅ | ✅ | ✅ |

---

## ⚠️ Common API Errors & Status Codes

| Status | Error | Cause | Solution |
|--------|-------|-------|----------|
| 200 | OK | Success | Expected response |
| 201 | Created | Resource created | Expected on POST |
| 400 | Bad Request | Invalid input | Check validation rules |
| 401 | Unauthorized | No/Invalid token | Login again, check localStorage |
| 403 | Forbidden | Insufficient role | Login with correct role |
| 404 | Not Found | Resource doesn't exist | Check ID/endpoint |
| 409 | Conflict | Duplicate entry | Email/code already exists |
| 422 | Validation Failed | Input validation error | Check field requirements |
| 500 | Server Error | Backend error | Check logs |

---

## 📝 Request/Response Examples

### Login Example
**Request**:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}'
```

**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

### Create Employee Example
**Request**:
```bash
curl -X POST http://localhost:5000/api/employees \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "John Doe",
    "email": "john@company.com",
    "department": "Engineering",
    "designation": "Software Engineer",
    "salary": 50000
  }'
```

**Response**:
```json
{
  "employee": {
    "_id": "507f1f77bcf86cd799439012",
    "employeeCode": "EMP001",
    "name": "John Doe",
    "email": "john@company.com",
    "department": "Engineering",
    "designation": "Software Engineer",
    "salary": 50000,
    "status": "active",
    "createdAt": "2024-04-26T10:30:00Z"
  }
}
```

### Apply Leave Example
**Request**:
```bash
curl -X POST http://localhost:5000/api/leaves \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "leaveType": "annual",
    "startDate": "2024-05-01",
    "endDate": "2024-05-05",
    "days": 5,
    "reason": "Vacation"
  }'
```

**Response**:
```json
{
  "leave": {
    "_id": "507f1f77bcf86cd799439013",
    "employeeId": "EMP001",
    "employeeName": "John Doe",
    "leaveType": "annual",
    "startDate": "2024-05-01",
    "endDate": "2024-05-05",
    "days": 5,
    "status": "pending",
    "appliedDate": "2024-04-26T10:35:00Z"
  }
}
```

---

## 🚀 Quick Copy-Paste Queries

### Get All Pending Leaves (for Manager)
```
GET /api/leaves?status=pending
Headers: Authorization: Bearer <token>
```

### Update Leave Status (Approve)
```
PUT /api/leaves/507f1f77bcf86cd799439013/status
Headers: Authorization: Bearer <token>
Body: {"status": "approved", "approvedBy": "Manager Name"}
```

### Check-in
```
POST /api/attendance/check-in
Headers: Authorization: Bearer <token>
Body: {}
Response: {checkInTime: "2024-04-26T09:00:00Z"}
```

### Get Employee Dashboard
```
GET /api/dashboard/employee
Headers: Authorization: Bearer <token>
```

---

## 📊 Data Validation Rules

### Employee
- **Email**: Valid email format, unique
- **EmployeeCode**: Unique, 6-10 characters
- **Name**: 2-50 characters, no special chars
- **Department**: Required, from predefined list
- **Salary**: Positive number
- **Status**: 'active' or 'inactive'

### Leave
- **LeaveType**: Must be one of [annual, sick, maternity, emergency]
- **StartDate**: Cannot be in past
- **EndDate**: Must be >= StartDate
- **Days**: Calculated automatically from dates
- **Reason**: 10-500 characters

### User
- **Email**: Valid format, unique, lowercase
- **Password**: Min 6 chars, hashed before storage
- **Role**: One of [admin, hr, manager, employee]
- **Name**: 2-50 characters

---

This reference should cover 90% of interview questions about the API and database!
