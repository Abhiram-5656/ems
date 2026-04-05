# 🚀 Quick Reference Guide - Employee Management System

## 📑 Table of Contents
1. Running the Application
2. API Quick Endpoints
3. Role Permissions Matrix
4. Database Schemas
5. Common Operations
6. Troubleshooting

---

## 1. Running the Application

### Start All Services
```bash
# Terminal 1: Backend
cd backend
npm install
npm start
# http://localhost:5000

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
# http://localhost:5173 (or next available port)
```

### Build for Production
```bash
# Frontend
npm run build      # Creates dist/ folder

# Backend
npm start          # Use process manager like PM2 in production
```

---

## 2. API Quick Endpoints

### 🔐 Authentication
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me              ⭐ (Restores user on refresh)
GET    /api/auth/logout
```

### 👥 Employees
```
POST   /api/employees
GET    /api/employees?page=1&limit=10&search=john
GET    /api/employees/:id
PUT    /api/employees/:id
DELETE /api/employees/:id
GET    /api/employees/stats/summary  ⭐ (BEFORE /:id route)
```

### 📅 Leaves
```
POST   /api/leaves/apply
GET    /api/leaves/my-applications
GET    /api/leaves/pending
PUT    /api/leaves/:id/approve
PUT    /api/leaves/:id/reject
PUT    /api/leaves/:id/cancel
```

### 💰 Payroll
```
POST   /api/payroll/create
GET    /api/payroll?page=1&month=4&year=2026
GET    /api/payroll/employee/my-payroll  ⭐ (BEFORE /:id route)
PUT    /api/payroll/:id
PUT    /api/payroll/:id/approve
PUT    /api/payroll/:id/mark-paid
DELETE /api/payroll/:id
```

### ⏰ Attendance
```
POST   /api/attendance/mark
GET    /api/attendance/report
GET    /api/attendance/my-attendance
PUT    /api/attendance/:id/approve
DELETE /api/attendance/:id
```

### 📊 Dashboard
```
GET    /api/dashboard/stats
```

---

## 3. Role Permissions Matrix

| Action | ADMIN | HR | MANAGER | EMPLOYEE |
|--------|-------|----|----|----------|
| **Employees** |
| Create | ✅ | ✅ | ❌ | ❌ |
| Read | ✅ | ✅ | ✅ | ❌ |
| Update | ✅ | ✅ | ❌ | ❌ |
| Delete | ✅ | ✅ | ❌ | ❌ |
| **Leaves** |
| Apply | ✅ | ✅ | ✅ | ✅ |
| View Own | ✅ | ✅ | ✅ | ✅ |
| Approve | ✅ | ✅ | ✅ | ❌ |
| Reject | ✅ | ✅ | ✅ | ❌ |
| **Payroll** |
| Create | ✅ | ✅ | ❌ | ❌ |
| Approve | ✅ | ✅ | ❌ | ❌ |
| View Own | ✅ | ✅ | ❌ | ✅ |
| **Attendance** |
| Mark | ✅ | ✅ | ✅ | ✅ |
| Report | ✅ | ✅ | ✅ | ❌ |
| Approve | ✅ | ✅ | ✅ | ❌ |

---

## 4. Database Schemas Quick Reference

### User
```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  phone: String (unique),
  password: String (hashed),
  department: String,
  position: String,
  salary: Number,
  role: ObjectId → Role,
  isActive: Boolean,
  isEmailVerified: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Payroll
```javascript
{
  employee: ObjectId → User,
  month: Number (1-12),
  year: Number,
  baseSalary: Number,
  allowances: {
    hra: Number,
    da: Number,
    medical: Number
  },
  deductions: {
    providentFund: Number,
    tax: Number,
    insurance: Number
  },
  grossSalary: Number,      // baseSalary + sum(allowances)
  netSalary: Number,        // grossSalary - sum(deductions)
  status: DRAFT|APPROVED|PAID,
  approvedBy: ObjectId → User,
  paidDate: Date,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Leave
```javascript
{
  employee: ObjectId → User,
  leaveType: String,        // SICK, CASUAL, PAID, UNPAID
  startDate: Date,
  endDate: Date,
  numberOfDays: Number,     // Auto-calculated
  reason: String,
  status: PENDING|APPROVED|REJECTED|CANCELLED,
  approvedBy: ObjectId → User,
  rejectionReason: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Attendance
```javascript
{
  employee: ObjectId → User,
  date: Date,
  status: PRESENT|ABSENT|LATE|HALF_DAY,
  checkInTime: Date,
  checkOutTime: Date,
  workingHours: Number,     // Auto-calculated
  notes: String,
  approved: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 5. Common Operations

### Login User
```javascript
// Frontend
const res = await authAPI.login({
  email: 'admin@ems.com',
  password: 'Admin@123'
});
// Returns: { token, user }
// Token auto-stored in localStorage

// Restore on refresh
dispatch(fetchCurrentUser());
```

### Create Payroll
```javascript
const payroll = await payrollAPI.createPayroll({
  employeeId: '65abc123',
  month: 4,
  year: 2026,
  baseSalary: 50000,
  allowances: {
    hra: 5000,
    da: 3000,
    medical: 1000
  },
  deductions: {
    providentFund: 2000,
    tax: 5000,
    insurance: 500
  }
});
// Auto-calculates:
// grossSalary = 50000 + 5000 + 3000 + 1000 = 59000
// netSalary = 59000 - 2000 - 5000 - 500 = 51500
```

### Approve Leave
```javascript
// Step 1: Get pending leaves
const leaves = await leaveAPI.getPendingLeaves();

// Step 2: Approve leave
await leaveAPI.approveLeave(leaveId);

// Step 3: Refresh list
const updated = await leaveAPI.getPendingLeaves();
```

### Mark Attendance
```javascript
await attendanceAPI.markAttendance({
  date: '2026-04-05',
  status: 'PRESENT',
  checkInTime: '09:00',
  checkOutTime: '17:30'
});
// Auto-calculates: workingHours = 8.5
```

---

## 6. Troubleshooting

### "Port 5000 already in use"
```bash
# Find and kill process
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or use npm utility
npx kill-port 5000
```

### "Failed to load payroll records"
✅ **Causes & Fixes:**
1. Backend not running → `npm start` in backend folder
2. Route order issue → Verify `/employee/my-payroll` comes BEFORE `/:id` ✅ FIXED
3. CORS blocked → Check allowed ports in app.js ✅ FIXED
4. Token expired → Re-login
5. Database connection → Check MongoDB Atlas

### "Invalid credentials during login"
✅ **Causes & Fixes:**
1. Double hashing → Only happens once now ✅ FIXED
2. User not seeded → Run seed script: `node backend/src/seeds/seedAdmin.js`
3. Wrong password → Check test credentials (see top of this file)
4. Email mismatch → Database is case-sensitive

### "Menu disappears on page navigation"
✅ **Causes & Fixes:**
1. User state lost → `fetchCurrentUser` now restores on mount ✅ FIXED
2. Token expired → Auto-logout and redirect to login
3. Layout component issue → Sidebar properly positioned now ✅ FIXED

### "Chart shows no data"
✅ **Causes & Fixes:**
1. No data in database → Create records using create buttons
2. Dashboard endpoint down → Verify backend running
3. Data format wrong → Check dashboard controller
4. Permission denied → Ensure logged in as ADMIN

### "CORS: Not allowed by Origin"
✅ **Causes & Fixes:**
Frontend port not in CORS whitelist:
```javascript
// Add your port to allowedOrigins in app.js
const allowedOrigins = [
  'http://localhost:5176',  // ← Add this
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3000',
];
```

---

## 💡 Pro Tips

### Debugging
```javascript
// Frontend - Check Redux state
console.log(store.getState());

// Frontend - Check API calls
// Axios interceptor in apiClient.js logs all requests

// Backend - Enable request logging
console.log('Request:', req.method, req.path);
```

### Testing
```bash
# Test backend API directly
curl -X GET http://localhost:5000/api/employees \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ems.com","password":"Admin@123"}'
```

### Performance
```javascript
// Frontend build size check
npm run build
// Look for warning about large chunks
// Solution: Code splitting with React.lazy()

// Backend response times
// Check Network tab in DevTools
// Recommend < 100ms for endpoints
```

### Git Workflow
```bash
# Before committing
npm run build          # Frontend
npm start              # Backend - verify no errors

# Useful branches
feature/          # New features
bugfix/           # Fixes
refactor/         # Code improvements
```

---

## 📊 Testing Checklist

- [ ] Login with all 4 roles works
- [ ] Dashboard shows charts with data
- [ ] Create employee → appears in list
- [ ] Search employees works
- [ ] Edit employee → update persists
- [ ] Delete employee → soft delete works
- [ ] Apply leave → email notification sent
- [ ] Approve leave → status changes
- [ ] Create payroll → calculations correct
- [ ] Approve payroll → status updates
- [ ] Mark paid → date recorded
- [ ] Mark attendance → hours calculated
- [ ] Logout → token removed
- [ ] Refresh page → user persists
- [ ] Responsive design works on mobile

---

## 🔗 Important Links

| Item | Link |
|------|------|
| Full Implementation Guide | `IMPLEMENTATION_GUIDE.md` |
| Complete README | `COMPLETE_IMPLEMENTATION.md` |
| Backend Docs | `backend/README.md` |
| Frontend Docs | `frontend/README.md` |
| Postman Collection | (Create from API section) |

---

## 📞 Quick Support

**Port Issues?** → Check context.md for available ports
**API Not Working?** → Verify backend CORS configuration  
**Data Missing?** → Seed database with test data
**Auth Failed?** → Check credentials and token expiry

---

**Last Updated:** April 5, 2026 | **Status:** ✅ Production Ready
