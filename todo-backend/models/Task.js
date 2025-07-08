const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    user: { // Referensi ke user yang memiliki tugas ini
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: { // Untuk 'Tambahkan catatan'
        type: String,
        default: ''
    },
    deadline: {
        type: Date,
        required: false // Bisa tidak ada deadline
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date,
        required: false
    },
    isImportant: { // Untuk fitur 'Penting'
        type: Boolean,
        default: false
    },
    steps: [ // Array of sub-tasks/steps
        {
            text: { type: String, required: true },
            isCompleted: { type: Boolean, default: false }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    },
    addedToMyDay: { // Untuk fitur 'Hari Saya'
        type: Boolean,
        default: false
    }
    // Tambahkan properti lain jika diperlukan (e.g., reminders, category)
});

module.exports = mongoose.model('Task', TaskSchema);