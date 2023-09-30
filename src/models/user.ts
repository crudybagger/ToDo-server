import { ToDo } from "./todo";

export interface User {
    _id: string;
    username: string;
    password: string;
    email: string;
    todos: ToDo[];
}