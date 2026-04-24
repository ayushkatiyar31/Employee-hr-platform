const { createEmployee,
    getAllEmployees,
    getEmployeeById,
    deleteEmployeeById,
    updateEmployeeById
} = require('../Controllers/EmployeeController');
const { cloudinaryFileUploader } = require('../Middlewares/FileUplaoder');
const { auth, authorize } = require('../Middlewares/auth');
const { cacheMiddleware } = require('../Middlewares/cache');

const router = require('express').Router();

router.get('/', cacheMiddleware(2 * 60 * 1000), getAllEmployees)
router.get('/:id', cacheMiddleware(5 * 60 * 1000), getEmployeeById)
router.delete('/:id', deleteEmployeeById)
router.put('/:id', cloudinaryFileUploader.single('profileImage'), updateEmployeeById)
router.post('/', cloudinaryFileUploader.single('profileImage'), createEmployee);

module.exports = router;