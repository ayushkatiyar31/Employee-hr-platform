const router = require('express').Router();
const {
    createEmployee,
    getAllEmployees,
    getEmployeeById,
    updateEmployeeById,
    deleteEmployeeById,
    getMyProfile,
    updateMyProfile
} = require('../Controllers/EmployeeController');
const { cloudinaryFileUploader } = require('../Middlewares/FileUplaoder');
const { auth, authorize } = require('../Middlewares/auth');

router.get('/me/profile', auth, authorize('employee'), getMyProfile);
router.put('/me/profile', auth, authorize('employee'), updateMyProfile);

router.get('/', auth, authorize('admin', 'hr', 'manager'), getAllEmployees);
router.get('/:id', auth, authorize('admin', 'hr', 'manager'), getEmployeeById);
router.post(
    '/',
    auth,
    authorize('admin', 'hr', 'manager'),
    cloudinaryFileUploader.fields([
        { name: 'profileImage', maxCount: 1 },
        { name: 'documents', maxCount: 5 }
    ]),
    createEmployee
);
router.put(
    '/:id',
    auth,
    authorize('admin', 'hr', 'manager'),
    cloudinaryFileUploader.fields([
        { name: 'profileImage', maxCount: 1 },
        { name: 'documents', maxCount: 5 }
    ]),
    updateEmployeeById
);
router.delete('/:id', auth, authorize('admin', 'hr', 'manager'), deleteEmployeeById);

module.exports = router;
