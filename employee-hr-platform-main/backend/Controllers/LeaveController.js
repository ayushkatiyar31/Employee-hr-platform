const LeaveModel = require('../Models/LeaveModel');

const createLeave = async (req, res) => {
    try {
        const { employeeId, employeeName, leaveType, startDate, endDate, reason } = req.body;
        
        // Calculate days
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        
        const leave = new LeaveModel({
            employeeId,
            employeeName,
            leaveType,
            startDate,
            endDate,
            days,
            reason,
            status: 'pending'
        });
        
        await leave.save();
        res.status(201).json({
            message: 'Leave application submitted successfully',
            leave
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error creating leave application',
            error: error.message
        });
    }
};

const getAllLeaves = async (req, res) => {
    try {
        const { status, employeeId } = req.query;
        let filter = {};
        
        if (status) filter.status = status;
        if (employeeId) filter.employeeId = employeeId;
        
        const leaves = await LeaveModel.find(filter).sort({ appliedDate: -1 });
        res.status(200).json({
            message: 'Leaves fetched successfully',
            leaves
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching leaves',
            error: error.message
        });
    }
};

const updateLeaveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, approvedBy } = req.body;
        
        const updateData = { status };
        if (status === 'approved' || status === 'rejected') {
            updateData.approvedBy = approvedBy;
            updateData.approvedDate = new Date();
        }
        
        const leave = await LeaveModel.findByIdAndUpdate(id, updateData, { new: true });
        
        if (!leave) {
            return res.status(404).json({ message: 'Leave not found' });
        }
        
        res.status(200).json({
            message: `Leave ${status} successfully`,
            leave
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error updating leave status',
            error: error.message
        });
    }
};

const deleteLeave = async (req, res) => {
    try {
        const { id } = req.params;
        const leave = await LeaveModel.findByIdAndDelete(id);
        
        if (!leave) {
            return res.status(404).json({ message: 'Leave not found' });
        }
        
        res.status(200).json({ message: 'Leave deleted successfully' });
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting leave',
            error: error.message
        });
    }
};

module.exports = {
    createLeave,
    getAllLeaves,
    updateLeaveStatus,
    deleteLeave
};
