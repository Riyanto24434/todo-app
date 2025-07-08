const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/User');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// @desc    Get all tasks for the logged-in user
// @route   GET /api/tasks
// @access  Private (hanya user sendiri)
router.get('/', protect, async (req, res) => {
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 }); // Urutkan dari terbaru
    res.json(tasks);
});

// @desc    Get tasks for a specific user (Manajer bisa akses ini)
// @route   GET /api/tasks/user/:userId
// @access  Private/Manajer
router.get('/user/:userId', protect, authorizeRoles('manajer'), async (req, res) => {
    const tasks = await Task.find({ user: req.params.userId }).populate('user', 'name email jabatan'); // Ambil info user juga
    if (!tasks) {
        return res.status(404).json({ message: 'Tasks not found for this user' });
    }
    res.json(tasks);
});

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
router.post('/', protect, async (req, res) => {
    const { title, description, deadline, priority, isImportant, steps, addedToMyDay } = req.body;

    if (!title) {
        return res.status(400).json({ message: 'Task title is required' });
    }

    const task = new Task({
        user: req.user.id,
        title,
        description,
        deadline,
        priority,
        isImportant,
        steps,
        addedToMyDay
    });

    const createdTask = await task.save();
    res.status(201).json(createdTask);
});

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private (hanya user sendiri)
router.put('/:id', protect, async (req, res) => {
    const { title, description, deadline, priority, isCompleted, isImportant, steps, addedToMyDay } = req.body;

    const task = await Task.findById(req.params.id);

    if (task && task.user.toString() === req.user.id.toString()) {
        task.title = title || task.title;
        task.description = description !== undefined ? description : task.description;
        task.deadline = deadline !== undefined ? deadline : task.deadline;
        task.priority = priority || task.priority;
        task.isImportant = isImportant !== undefined ? isImportant : task.isImportant;
        task.steps = steps || task.steps;
        task.addedToMyDay = addedToMyDay !== undefined ? addedToMyDay : task.addedToMyDay;

        // Handle completion separately to set completedAt
        if (isCompleted !== undefined) {
            task.isCompleted = isCompleted;
            if (isCompleted && !task.completedAt) {
                task.completedAt = Date.now();
            } else if (!isCompleted && task.completedAt) {
                task.completedAt = undefined; // Hapus timestamp jika tidak selesai
            }
        }

        const updatedTask = await task.save();
        res.json(updatedTask);
    } else {
        res.status(404).json({ message: 'Task not found or user not authorized' });
    }
});


// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private (hanya user sendiri)
router.delete('/:id', protect, async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (task && task.user.toString() === req.user.id.toString()) {
        await task.deleteOne(); // Gunakan deleteOne() di Mongoose 6+
        res.json({ message: 'Task removed' });
    } else {
        res.status(404).json({ message: 'Task not found or user not authorized' });
    }
});

// @desc    Get all users (for managers to select)
// @route   GET /api/users
// @access  Private/Manajer
router.get('/users-list', protect, authorizeRoles('manajer'), async (req, res) => {
    const users = await User.find({}).select('-password'); // Jangan kirim password
    res.json(users);
});


module.exports = router;