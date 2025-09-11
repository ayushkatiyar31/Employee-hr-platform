// Demo data for testing without MongoDB
const demoEmployees = [
  {
    _id: '1',
    name: 'John Doe',
    email: 'john@company.com',
    phone: '+1234567890',
    department: 'Engineering',
    position: 'Senior Developer',
    salary: 75000,
    status: 'active',
    profileImage: 'https://via.placeholder.com/150'
  },
  {
    _id: '2', 
    name: 'Jane Smith',
    email: 'jane@company.com',
    phone: '+1234567891',
    department: 'Marketing',
    position: 'Marketing Manager',
    salary: 65000,
    status: 'active',
    profileImage: 'https://via.placeholder.com/150'
  },
  {
    _id: '3',
    name: 'Mike Johnson',
    email: 'mike@company.com', 
    phone: '+1234567892',
    department: 'HR',
    position: 'HR Specialist',
    salary: 55000,
    status: 'on-leave',
    profileImage: 'https://via.placeholder.com/150'
  }
];

module.exports = { demoEmployees };