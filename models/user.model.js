import mongoose from "mongoose";

const userSchema = new Schema({
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    skills: {
        type: [String],
        default: []
    }
},{timeStamps: true})

export const user = mongoose.model("user", userSchema)