# Technical Deep Dive - Architecture & Implementation

## 🏗️ System Architecture Diagram

```
                           ┌─────────────────────────────────┐
                           │      User Browser               │
                           │  (React Single Page App)        │
                           └──────────────┬──────────────────┘
                                          │
                                          │ HTTPS
                                          │ React Router
                                          ↓
                    ┌─────────────────────────────────────┐
                    │        Frontend Layer (Netlify)     │
                    │  ┌─────────────────────────────────┐│
                    │  │  React Components               ││
                    │  │  - Auth Pages                   ││
                    │  │  - Admin Portal                 ││
                    │  │  - Employee Portal              ││
                    │  │  - Protected Routes             ││
                    │  └────────────┬────────────────────┘│
                    │               │                       │
                    │  ┌────────────▼────────────────────┐ │
                    │  │ API Client (api.js)             │ │
                    │  │ - Fetch wrapper                 │ │
                    │  │ - Token management              │ │
                    │  │ - Error handling                │ │
                    │  └────────────┬────────────────────┘ │
                    └───────────────┼──────────────────────┘
                                    │
                                    │ REST API (JSON)
                                    │ Authorization: Bearer <JWT>
                                    ↓
         ┌──────────────────────────────────────────────────┐
         │     Backend Layer (Render/Express.js)           │
         │ ┌────────────────────────────────────────────┐  │
         │ │ Express Middleware Stack                   │  │
         │ │ 1. CORS Configuration                     │  │
         │ │ 2. Body Parser (JSON)                     │  │
         │ │ 3. Rate Limiting                          │  │
         │ │ 4. Compression (gzip)                     │  │
         │ │ 5. CSRF Protection                        │  │
         │ │ 6. Authentication (JWT verify)            │  │
         │ │ 7. Input Validation                       │  │
         │ │ 8. Error Handler                          │  │
         │ └────────────────────────────────────────────┘  │
         │                                                  │
         │ ┌────────────────────────────────────────────┐  │
         │ │ Route Handlers (/Routes)                  │  │
         │ │ - AuthRoutes         - EmployeeRoutes     │  │
         │ │ - LeaveRoutes        - AttendanceRoutes   │  │
         │ │ - PayrollRoutes      - AnnouncementRoutes │  │
         │ │ - DashboardRoutes                         │  │
         │ └────────────────────────────────────────────┘  │
         │                                                  │
         │ ┌────────────────────────────────────────────┐  │
         │ │ Controllers (/Controllers)                │  │
         │ │ - Business Logic Layer                     │  │
         │ │ - Data Processing                          │  │
         │ │ - Calculations                             │  │
         │ └────────────────────────────────────────────┘  │
         │                                                  │
         │ ┌────────────────────────────────────────────┐  │
         │ │ Models (/Models)                          │  │
         │ │ - Mongoose Schemas                        │  │
         │ │ - Data Validation                         │  │
         │ │ - Pre/Post Hooks                          │  │
         │ │ - Methods (comparePassword, etc.)         │  │
         │ └────────────────────────────────────────────┘  │
         │                                                  │
         │ ┌────────────────────────────────────────────┐  │
         │ │ Utils (/Utils)                            │  │
         │ │ - Sanitization                            │  │
         │ │ - Default Admin Setup                     │  │
         │ │ - Helper Functions                        │  │
         │ └────────────────────────────────────────────┘  │
         └──────────────┬───────────────────────────────────┘
                        │
                        │ MongoDB Protocol
                        │ Connection Pooling
                        ↓
    ┌──────────────────────────────────────┐
    │  Database Layer (MongoDB Atlas)      │
    │  ┌──────────────────────────────────┐│
    │  │ Collections                      ││
    │  │ - users                          ││
    │  │ - employees                      ││
    │  │ - leaves                         ││
    │  │ - attendances                    ││
    │  │ - payrolls                       ││
    │  │ - announcements                  ││
    │  │ - _prisma_migrations (audit)     ││
    │  └──────────────────────────────────┘│
    │                                      │
    │  ┌──────────────────────────────────┐│
    │  │ Indexes (Performance)             ││
    │  │ - email (unique)                 ││
    │  │ - employeeCode (unique)          ││
    │  │ - status (search)                ││
    │  │ - createdAt (sorting)            ││
    │  └──────────────────────────────────┘│
    └──────────────────────────────────────┘
                        │
                        │ Cloudinary API
                        ↓
    ┌──────────────────────────────────────┐
    │  File Storage (Cloudinary)           │
    │  - Employee Profile Images           │
    │  - Employee Documents                │
    │  - Certificates, Contracts, etc.     │
    └──────────────────────────────────────┘
```

---

## 🔄 Request-Response Lifecycle

### 1. Authentication Request
```
User inputs credentials
        ↓
Form submitted → Frontend calls authApi.login()
        ↓
Fetch POST /api/auth/login with {email, password}
        ↓
Backend receives request
        ↓
express-validator sanitizes input
        ↓
AuthController.login() executes:
  - Find user by email in User collection
  - Use bcryptjs.compare(password, user.password)
  - If match: Generate JWT token with jwt.sign()
  - Return {token, user}
        ↓
Frontend receives response
        ↓
localStorage.setItem('token', response.token)
        ↓
AuthContext updates: {isAuthenticated: true, user: {...}}
        ↓
Navigate to dashboard
        ↓
All subsequent requests include: Authorization: Bearer <token>
```

### 2. Protected Resource Request (Get Employee List)
```
Frontend: Get /api/employees
        ↓
Include Authorization header with JWT token
        ↓
Backend CORS middleware checks origin
        ↓
bodyParser parses request
        ↓
Auth middleware executes:
  - Extract token from header
  - jwt.verify(token, SECRET_KEY)
  - Attach user to request object
        ↓
EmployeeController.list() executes:
  - Check req.user.role (must be admin or hr)
  - Query: Employee.find()
    .populate('user') // Get user details
    .limit(20)
    .skip(page * 20)
  - Count total for pagination
        ↓
MongoDB returns documents
  - Applies indexes for fast retrieval
  - Joins with User collection (populate)
        ↓
Response sent: {employees: [...], total: 150, pages: 8}
        ↓
Frontend receives JSON
        ↓
React re-renders with new employee list
```

---

## 🔐 JWT Implementation Details

### Token Generation
```javascript
// In AuthController.login()
const token = jwt.sign(
  {
    userId: user._id,
    email: user.email,
    role: user.role
  },
  process.env.JWT_SECRET,  // Secret key from .env
  {
    expiresIn: '24h',      // Token valid for 24 hours
    issuer: 'EmployeeHR',
    audience: 'EmployeeHR-App'
  }
);
```

### Token Verification
```javascript
// In auth.js middleware
const token = req.headers.authorization.split(' ')[1];  // Extract from "Bearer <token>"

jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
  if (err) return res.status(401).json({message: 'Invalid token'});
  
  req.user = decoded;  // Attach user info to request
  next();
});
```

### Token Storage (Frontend)
```javascript
// localStorage storage
localStorage.setItem('token', token);
localStorage.getItem('token');  // Retrieve before each API call

// Auto-attach to headers
const getToken = () => localStorage.getItem('token');
headers.set('Authorization', `Bearer ${getToken()}`);
```

---

## 📚 Database Query Examples

### User Registration (Backend)
```javascript
// UserModel.pre('save', async function(next))
// Hook: Before saving, hash password
const hashedPassword = await bcryptjs.hash(this.password, 12);

// Create user
const user = await User.create({
  name: req.body.name,
  email: req.body.email,
  password: hashedPassword,  // Already hashed by pre-hook
  role: 'employee'           // Default role
});

// Result stored in MongoDB:
// {
//   _id: ObjectId("..."),
//   name: "John Doe",
//   email: "john@example.com",
//   password: "$2a$12$...",  // Bcrypt hash, not plain text
//   role: "employee"
// }
```

### Employee Search with Pagination
```javascript
// Frontend: /api/employees?page=1&limit=20&search=john

// Backend:
const page = req.query.page || 0;
const limit = req.query.limit || 20;
const search = req.query.search || '';

const query = {};
if (search) {
  query.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
    { employeeCode: { $regex: search, $options: 'i' } }
  ];
}

const employees = await Employee
  .find(query)
  .populate('user')              // Join with User
  .sort({createdAt: -1})         // Newest first
  .skip(page * limit)            // Pagination
  .limit(limit)
  .lean();                       // Return plain JS objects (faster)

const total = await Employee.countDocuments(query);

// MongoDB uses index on name, email for fast search
```

### Leave Approval Workflow
```javascript
// Manager approves leave:
// PUT /api/leaves/507f1f77bcf86cd799439013/status
// {status: "approved", approvedBy: "Manager Name"}

const leave = await Leave.findByIdAndUpdate(
  req.params.id,
  {
    status: req.body.status,
    approvedBy: req.body.approvedBy,
    approvedDate: new Date(),
    statusUpdatedAt: new Date()
  },
  { new: true }  // Return updated document
);

// Atomic update: MongoDB processes all fields at once
// No race condition possible
```

---

## 🛡️ Security Implementation

### Password Security Flow
```
User enters password: "MyPassword123"
        ↓
bcryptjs.hash("MyPassword123", 12)
        ↓
Generate random salt
        ↓
Hash password + salt 12 times (computationally expensive)
        ↓
Store: "$2a$12$..." in database
        ↓
Login attempt: User enters "MyPassword123" again
        ↓
bcryptjs.compare("MyPassword123", "$2a$12$...")
        ↓
Re-hash with same salt and compare
        ↓
Match or not match (constant time comparison)
```

### CORS Protection
```javascript
// Only these origins allowed:
const allowedOrigins = [
  'http://localhost:3000',           // Local development
  'https://jocular-cat-42520b.netlify.app',  // Production frontend
  'https://employee-hr-platform-1.onrender.com'  // Another deployment
];

// Request from other origins rejected automatically
```

### Input Validation
```javascript
// Example: Create employee
const { body, validationResult } = require('express-validator');

router.post('/',
  body('email').isEmail().normalizeEmail(),
  body('name').trim().isLength({min: 2, max: 50}),
  body('salary').isNumeric().toFloat(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    // Proceed with validated data
  }
);
```

### Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.'
});

app.use('/api/', limiter);  // Apply to all API routes
```

---

## 🚀 Optimization Techniques

### Database Indexing
```javascript
// UserModel
userSchema.index({ email: 1 });           // Single index

// EmployeeModel
employeeSchema.index({ email: 1 });
employeeSchema.index({ employeeCode: 1 });
employeeSchema.index({ status: 1 });
employeeSchema.index({ createdAt: -1 });  // For sorting

// LeaveModel
leaveSchema.index({ employee: 1, status: 1 });  // Compound index
```

### Query Optimization
```javascript
// ❌ Bad: N+1 query problem
const employees = await Employee.find();
for (let emp of employees) {
  emp.user = await User.findById(emp.user);  // Extra query per employee!
}

// ✅ Good: Use populate
const employees = await Employee
  .find()
  .populate('user')  // Single join query
  .lean();           // Exclude methods for speed
```

### Caching Strategy
```javascript
// Cache dashboard data for 5 minutes
const CACHE_TTL = 5 * 60;  // 5 minutes

const dashboardData = cache.get('admin-dashboard');
if (dashboardData) {
  return res.json(dashboardData);
}

// If not cached, compute
const data = {
  totalEmployees: await Employee.countDocuments(),
  activeCount: await Employee.countDocuments({status: 'active'}),
  // ... more calculations
};

cache.set('admin-dashboard', data, CACHE_TTL);
res.json(data);
```

### Response Compression
```javascript
const compression = require('compression');
app.use(compression());  // Compresses responses with gzip

// Before: 50KB JSON
// After: 5KB (90% reduction)
```

---

## 🧪 Error Handling Strategy

### Centralized Error Handler
```javascript
// All errors caught and standardized
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  
  // Validation errors
  if (err.status === 422) {
    return res.status(422).json({
      message: 'Validation failed',
      errors: err.errors
    });
  }
  
  // Authorization errors
  if (err.status === 403) {
    return res.status(403).json({
      message: 'Insufficient permissions'
    });
  }
  
  // Server errors
  return res.status(500).json({
    message: 'Internal server error'
  });
});
```

### Frontend Error Handling
```javascript
try {
  const response = await employeeApi.create(formData);
  showSuccessToast('Employee created successfully');
} catch (error) {
  if (error.status === 409) {
    showErrorToast('Email already exists');
  } else if (error.status === 422) {
    showErrorToast(error.payload.errors[0].msg);
  } else {
    showErrorToast('Failed to create employee');
  }
}
```

---

## 📊 Performance Metrics

| Operation | Expected Time | Optimization |
|-----------|---------------|--------------|
| Login | < 200ms | Password hash cached, JWT generated in memory |
| Load Employee List | < 500ms | Index on email, pagination limit 20 |
| Search Employees | < 300ms | Regex with index, skip large datasets |
| Approve Leave | < 150ms | Single atomic update, no race condition |
| Dashboard Load | < 400ms | Cached for 5 minutes, aggregation queries |
| File Upload | 1-3s | Async upload to Cloudinary, returns URL |

---

## 🔗 Integration Points

### Cloudinary Integration
```javascript
// File upload middleware
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const storage = require('multer-storage-cloudinary');

const upload = multer({
  storage: storage({
    cloudinary: cloudinary,
    folder: 'employee-hr-platform',
    allowedFormats: ['jpg', 'jpeg', 'png', 'pdf']
  })
});

app.post('/api/employees/upload', upload.single('file'), (req, res) => {
  // req.file.path = 'https://res.cloudinary.com/.../...'
  res.json({url: req.file.path});
});
```

### Email Notifications (Future Enhancement)
```javascript
// Could integrate Nodemailer for notifications
const nodemailer = require('nodemailer');

const sendLeaveApprovalEmail = async (employee, status) => {
  await transporter.sendMail({
    to: employee.email,
    subject: `Leave ${status}`,
    html: `Your leave has been ${status}`
  });
};
```

---

This deep dive should help you discuss architecture and implementation decisions confidently in technical interviews!
