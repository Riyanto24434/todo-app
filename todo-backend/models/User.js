const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: { // 'karyawan' atau 'manajer'
        type: String,
        enum: ['karyawan', 'manajer'],
        default: 'karyawan'
    },
    jabatan: { // Menambahkan jabatan dari info profil Anda
        type: String,
        default: 'Staf'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password sebelum menyimpan user baru
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Metode untuk membandingkan password
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);