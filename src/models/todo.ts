import mongoose, { Types } from "mongoose";

export interface IToDo {
    _id?: Types.ObjectId;
    task: string;
    completed: boolean;
}

export const ToDoSchema = new mongoose.Schema({
    task: String,
    completed: Boolean,
});

export const ToDo = mongoose.model("ToDo", ToDoSchema);
