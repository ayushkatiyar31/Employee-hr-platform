# 🚀 Employee HR Platform - Quick Setup Guide

## Prerequisites
- Node.js (v14+)
- MongoDB account
- Git

## 1. Clone Repository
```bash
git clone https://github.com/Algoraver22/employee-hr-platform.git
cd employee-hr-platform
```

## 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
```env
MONGODB_URI=your_mongodb_connection_string
PORT=8080
```

Start backend:
```bash
npm start
```

## 3. Frontend Setup
```bash
cd ../frontend
npm install
npm start
```

## 4. Access Application
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8080

## 🌐 Live Demo
- **Live App**: https://employee-hr-platform-frontend.vercel.app
- **API**: https://employee-hr-platform.onrender.com

## 📋 Features
- ✅ Employee CRUD operations
- ✅ Dashboard with statistics
- ✅ Search & pagination
- ✅ Profile image upload
- ✅ Responsive design
- ✅ Modern UI with animations

## 🛠 Tech Stack
- **Frontend**: React, Bootstrap, React-Toastify
- **Backend**: Node.js, Express, MongoDB
- **Deployment**: Vercel + Render
- **Storage**: Cloudinary (images)

## 📞 Support
For issues or questions, check the PROJECT_DOCUMENTATION.md file or open a GitHub issue.