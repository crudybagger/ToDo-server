import { IToDo, ToDo } from "./todo";
import mongoose, {Types} from "mongoose";

export interface IUser {
    _id?: Types.ObjectId;
    username: string;
    password: string;
    email: string;
    todos: IToDo[];
}

// export mongoose schema for user
export const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    todos: { type: Array , default: [] }
});

export const User = mongoose.model("User", userSchema);