# Employee Management Full Stack Application

A modern, full-stack Employee Management web application featuring a beautiful dashboard, powerful analytics, and seamless CRUD operations. Built with Angular, Node.js, SQLite, Syncfusion UI, and ngx-charts.

---

## 🚀 Overview
This application enables organizations to manage employees, salaries, and related HR data efficiently. It provides a visually appealing dashboard, secure authentication, and interactive analytics, making HR management intuitive and insightful.

---

## ✨ Features
- **User Authentication:** Secure login interface for access control
- **Employee CRUD:** Create, Read, Update, Delete employee records
- **Salary Management:** Track and update employee salaries
- **Advanced Dashboard Analytics:**
  - Visualize key HR metrics with interactive ngx-charts (bar, pie, line, area, and more)
  - Employee trends, salary breakdowns, recent hires, and department-wise analytics
  - Real-time updates and drill-down capabilities for detailed insights
  - Export dashboard charts as images or PDFs for reporting
- **Data Filtering & Search:** Quickly find employees or salary records using powerful filters and search tools
- **Data Export & Import:** Export employee data to CSV/Excel, or import data for bulk management
- **Notifications & Alerts:** Receive real-time notifications for important actions (e.g., new hires, salary updates)
- **Modern UI:** Built with Syncfusion Angular components for tables, forms, modals, and more
- **Sidebar Navigation:** Easy access to all modules
- **Role-Based Access:** (Optional) Restrict access to features based on user roles (admin, HR, etc.)
- **Accessibility & Responsive Design:** Fully responsive and accessible on desktop, tablet, and mobile devices

---

## 🛠️ Tech Stack
- **Frontend:** [Angular](https://angular.io/), [Syncfusion Angular UI](https://www.syncfusion.com/angular-components), [ngx-charts](https://swimlane.github.io/ngx-charts/)
- **Backend:** [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/)
- **Database:** [SQLite](https://www.sqlite.org/index.html)

---

## 📦 Project Structure
```
Employee-management/
├── backend/        # Node.js + Express API
├── frontend/       # Angular app (Syncfusion UI, ngx-charts)
├── database/       # SQLite DB files
└── README.md
```

---

## ⚙️ Setup Instructions

### 1. Clone the Repository
```bash
git clone <repo-url>
cd Employee-management
```

### 2. Backend Setup
```bash
cd backend
npm install
# Configure environment variables if needed
npm start
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
ng serve
```

### 4. Database
- SQLite database is auto-initialized on server start.
- DB file location: `/database/employee.db`

---

## 🖥️ Usage
1. Open your browser and navigate to `http://localhost:4200`.
2. Log in with your credentials.
3. Use the sidebar to navigate between Employees, Salaries, and Dashboard.
4. Add, edit, or remove employees and view analytics in real-time.

---

## 📊 Dashboard & Analytics
- Interactive charts powered by ngx-charts
- Key metrics: total employees, salary distribution, recent hires, etc.

---

## 💎 UI & Components
- Syncfusion Angular UI for tables, forms, modals, and more
- Responsive, modern, and accessible design

---

## 📚 Further Reading
- [Angular Documentation](https://angular.io/docs)
- [Syncfusion Angular UI Docs](https://ej2.syncfusion.com/angular/documentation/)
- [Node.js Docs](https://nodejs.org/en/docs/)
- [SQLite Docs](https://www.sqlite.org/docs.html)

---

## 📝 License
MIT License. See [LICENSE](LICENSE) for details.
