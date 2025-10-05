import mongoose from 'mongoose';

let cached = global.mongoose;

if (!cached) cached = global.mongoose = { conn: null };

export const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  try {
    cached.conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log(`MongoDB Connected: ${cached.conn.connection.host}`);
    return cached.conn;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
};
