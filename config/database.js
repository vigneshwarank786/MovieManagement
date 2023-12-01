const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: "config/config.env" });

const connectDatabase = async () => {
    try {
        await mongoose.connect(process.env.DB_LOCAL_URI);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
    }
};

module.exports = connectDatabase;
