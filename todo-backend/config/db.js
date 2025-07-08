const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // useCreateIndex: true, // Tidak diperlukan lagi di Mongoose 6+
            // useFindAndModify: false // Tidak diperlukan lagi di Mongoose 6+
        });
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error(err.message);
        process.exit(1); // Keluar dari proses jika koneksi gagal
    }
};

module.exports = connectDB;