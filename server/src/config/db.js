/**
 * MongoDB connection configuration using Mongoose.
 */

const mongoose = require("mongoose");

/**
 * Connects the application to MongoDB.
 */
const connectDB = async () => {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    return {
        connection: conn,
        host: conn.connection.host,
    };
};

module.exports = connectDB;
