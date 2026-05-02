# Employee HR Platform - Complete Project Guide

## 📌 Project Overview

**Employee HR Platform** is a full-stack web application built with the **MERN stack** that streamlines HR operations. It allows administrators to manage employee data, track leave, monitor attendance, manage payroll, and broadcast company announcements. The platform emphasizes security (JWT authentication), scalability, and user-friendly interface.

---

## 🏗️ Architecture & Tech Stack

### Frontend
- **React 18.3.1** - UI library
- **React Router v6** - Client-side routing
- **CSS** - Multiple custom stylesheets (Tailwind-inspired styling)
- **React Toastify** - Notifications/alerts

### Backend
- **Node.js (18.x)** - JavaScript runtime
- **Express.js 4.21** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose 8.18** - ODM (Object Data Mapping)

### Security & Utilities
- **JWT (jsonwebtoken)** - Token-based authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **Express Rate Limiting** - DDoS protection
- **CSRF Protection** - Request forgery prevention
- **Multer + Cloudinary** - File uploads to cloud storage
- **Express Validator** - Input validation
- **Compression** - Response compression

---

## 🎯 Key Features

### 1. **Authentication & Authorization**
- User registration and login
- JWT-based session management
- Role-based access control (RBAC):
  - **Admin** - Full system access, manage all data
  - **HR** - Manage employees, leaves, attendance
  - **Manager** - View team data, approve leaves
  - **Employee** - View personal data, submit leaves
- Password hashing with bcryptjs
- Secure token storage in localStorage

### 2. **Employee Management**
- Create, read, update, delete (CRUD) employee profiles
- Store: Name, Email, Phone, Department, Designation
- Additional fields: Salary, DOB, Address, Status (active/inactive)
- Profile images via Cloudinary
- Document storage (certificates, contracts)
- Employee code generation

### 3. **Leave Management**
- Submit leave requests (Annual, Sick, Maternity, Emergency)
- Track leave dates and duration
- Leave status workflow: Pending → Approved/Rejected
- Manager/Admin approval system
- View leave history

### 4. **Attendance Tracking**
- Check-in/Check-out functionality
- Real-time attendance records
- Attendance history and reports
- Filter and view attendance by date range

### 5. **Payroll Management**
- Create and manage salary records
- Store salary, deductions, benefits
- Payroll processing and history
- Generate payroll reports

### 6. **Announcements (Internal Notices)**
- Post company-wide announcements
- Broadcast to all employees
- View announcement history

### 7. **Dashboard**
- Admin Dashboard: Statistics, employee count, leave overview
- Employee Dashboard: Personal metrics, quick actions

---

## 📊 Database Models

### 1. **User Model**
```
- name (String)
- email (String, unique)
- password (String, hashed)
- role (enum: admin, hr, manager, employee)
- isActive (Boolean)
- avatar (String, URL)
- company (String)
- timestamps (createdAt, updatedAt)
```

### 2. **Employee Model**
```
- user (Reference to User)
- employeeCode (String, unique)
- name, email, phone
- department, designation
- joiningDate, dateOfBirth
- salary
- status (active/inactive)
- address, emergencyContact
- profileImage (URL)
- documents (Array of {name, url, uploadedAt})
```

### 3. **Leave Model**
```
- employee (Reference to Employee)
- employeeId, employeeName
- leaveType (annual, sick, maternity, emergency)
- startDate, endDate, days
- reason
- status (pending, approved, rejected)
- appliedDate, approvedDate, approvedBy
```

### 4. **Attendance Model**
```
- employee (Reference to Employee)
- checkInTime, checkOutTime
- date
- duration
- status (present, absent, late)
```

### 5. **Payroll Model**
```
- employee (Reference to Employee)
- month, year
- baseSalary, deductions, benefits
- netSalary
- processedDate, status
```

### 6. **Announcement Model**
```
- title, content
- createdBy (Reference to User)
- createdDate
- priority (high, medium, low)
- expiryDate
```

---

## 🔌 API Endpoints

### **Auth Routes** (`/api/auth`)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/login` | User login |
| POST | `/register` | User registration |
| GET | `/me` | Get current user |

### **Employee Routes** (`/api/employees`)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | List all employees |
| GET | `/:id` | Get employee by ID |
| POST | `/` | Create employee |
| PUT | `/:id` | Update employee |
| DELETE | `/:id` | Delete employee |
| GET | `/me/profile` | Get own profile |
| PUT | `/me/profile` | Update own profile |

### **Leave Routes** (`/api/leaves`)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | List leaves |
| POST | `/` | Apply for leave |
| PUT | `/:id/status` | Approve/Reject leave |

### **Attendance Routes** (`/api/attendance`)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | List attendance |
| GET | `/me` | My attendance |
| POST | `/check-in` | Check in |
| POST | `/check-out` | Check out |

### **Payroll Routes** (`/api/payrolls`)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | List payroll records |
| POST | `/` | Create payroll |

### **Announcement Routes** (`/api/announcements`)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | List announcements |
| POST | `/` | Create announcement |

### **Dashboard Routes** (`/api/dashboard`)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/admin` | Admin dashboard data |
| GET | `/employee` | Employee dashboard data |

---

## 🔐 Security Features

1. **JWT Authentication** - Stateless, token-based auth
2. **Password Hashing** - bcryptjs with salt rounds
3. **CORS Configuration** - Allowed origins:
   - localhost:3000
   - Production URL on Netlify
   - Production URL on Render
4. **Rate Limiting** - Prevent brute-force attacks
5. **CSRF Protection** - Cross-Site Request Forgery tokens
6. **Input Validation** - express-validator middleware
7. **Error Handling** - Centralized error handler middleware
8. **File Upload Security** - Cloudinary integration for safe uploads

---

## 🚀 Frontend Structure

### Pages/Components
- **AuthPage** - Login/Register
- **AdminPortal** - Admin management interface
- **EmployeePortal** - Employee dashboard
- **Protected Routes** - Authorization wrapper

### Key Utilities
- **api.js** - API client with fetch wrapper
- **AuthContext** - Global auth state management
- **validation.js** - Form and input validation
- **utils.js** - Helper functions

### Styling
- Custom CSS modules for different themes:
  - modern-ui.css, professional-styles.css
  - Responsive design for mobile devices

---

## 🛠️ Backend Structure

### Controllers
Each controller handles business logic for a feature:
- **AuthController** - Login, register, authentication
- **EmployeeController** - CRUD operations, profile updates
- **LeaveController** - Leave applications and approvals
- **AttendanceController** - Check-in/out logic
- **PayrollController** - Salary calculations
- **AnnouncementController** - Notice management
- **DashboardController** - Statistics and analytics

### Middlewares
- **auth.js** - JWT verification
- **cache.js** - Response caching
- **csrf.js** - CSRF token generation/validation
- **errorHandler.js** - Centralized error handling
- **FileUploader.js** - Multer configuration for uploads
- **validation.js** - Input validation rules

### Routes
Modular route files for each feature, all registered in index.js

### Utils
- **ensureDefaultAdmin.js** - Create default admin on startup
- **sanitizer.js** - Input sanitization

---

## 📝 Data Flow

### Login Flow
1. User submits email & password
2. Frontend calls `/api/auth/login`
3. Backend validates credentials against User model
4. Password compared using bcryptjs
5. JWT token generated and returned
6. Frontend stores token in localStorage
7. Token sent in Authorization header for subsequent requests

### Employee Creation Flow (Admin)
1. Admin fills employee form
2. Frontend calls `/api/employees` with POST
3. Backend validates input with express-validator
4. Checks unique constraints (employeeCode, email)
5. Creates User record with role 'employee'
6. Creates Employee record linked to User
7. Returns created employee data

### Leave Application Flow
1. Employee submits leave request
2. Frontend calls `/api/leaves` with POST
3. Backend creates Leave record with status 'pending'
4. Manager receives notification
5. Manager approves/rejects via `/api/leaves/:id/status` PUT
6. Status updated, timestamps recorded

---

## 📱 Frontend Components

### Admin Sections
- Employee management (CRUD)
- Leave approvals
- Attendance monitoring
- Payroll processing
- Announcement creation
- System analytics

### Employee Sections
- View personal profile
- Apply for leave
- Check-in/Check-out
- View payslips
- Read announcements
- Dashboard with personal stats

---

## 🔄 Deployment

### Frontend Deployment
- Netlify (URL: jocular-cat-42520b.netlify.app)
- React build optimized with Craco

### Backend Deployment
- Render (Production URL configured)
- Node.js with Nodemon for development

### Database
- MongoDB Atlas (cloud-based)
- Connection via MONGO_URI in .env

---

## 🎓 Interview Talking Points

### Strengths to Highlight
1. **Full-Stack Solution** - Complete HR system from scratch
2. **Security** - JWT, CSRF protection, password hashing
3. **Scalability** - Modular architecture, cloud storage
4. **User Experience** - Role-based access, intuitive UI
5. **Best Practices** - Validation, error handling, middleware pattern
6. **Cloud Integration** - Cloudinary for file uploads, multiple deployments

### Technical Highlights
1. JWT implementation and token management
2. Role-based access control system
3. Database schema design with relationships
4. Error handling and validation middleware
5. RESTful API design principles
6. State management with React Context
7. File upload integration with Cloudinary
8. Rate limiting and security measures

### Challenges Overcome
1. Implementing secure authentication
2. Managing complex role permissions
3. Handling concurrent requests and race conditions
4. Optimizing database queries
5. Cross-origin requests (CORS)
6. File upload security

---

## 📚 Setup & Running Locally

### Backend
```bash
cd backend
npm install
npm run dev  # Uses nodemon for auto-restart
```

### Frontend
```bash
cd frontend
npm install
npm start
```

### Environment Variables (.env)
```
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
PORT=5000
REACT_APP_API_URL=http://localhost:5000
```

---

## 🎯 Interview Questions You Should Be Ready For

1. **Architecture** - Why MERN? Why MongoDB?
2. **Authentication** - How does JWT work? Why not sessions?
3. **Scalability** - How would you scale this?
4. **Database** - Explain the schema relationships
5. **Security** - What are the vulnerabilities and fixes?
6. **Performance** - How would you optimize queries?
7. **Testing** - How would you test this application?
8. **Deployment** - Explain your deployment strategy
9. **Error Handling** - How do you handle errors?
10. **Role-Based Access** - How does RBAC work in your system?

---

## 🔗 Quick Summary

| Aspect | Details |
|--------|---------|
| **Framework** | MERN (MongoDB, Express, React, Node.js) |
| **Authentication** | JWT with role-based access (4 roles) |
| **Main Features** | Employee CRUD, Leave, Attendance, Payroll, Announcements |
| **Database** | MongoDB with 7 main collections |
| **API Style** | RESTful with 6 route modules |
| **Security** | JWT, bcryptjs, CORS, Rate limiting, CSRF, Validation |
| **File Storage** | Cloudinary integration for images/documents |
| **Deployment** | Netlify (frontend), Render (backend), MongoDB Atlas |

---

**Key Takeaway**: This is a production-ready HR management system demonstrating modern full-stack development with emphasis on security, scalability, and user roles. Perfect for discussing your understanding of authentication, database design, API development, and React applications.
