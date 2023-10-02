import { IUser, User } from "./models/user";
import { IToDo, ToDo } from "./models/todo";
import { randomUUID, createHash } from "crypto";
import mongoose, {Types} from "mongoose";
import e from "express";

export const connectDB = () => {
    if(!process.env.DB) return console.log('No DB URL provided, defaulting to local, data will be lost on server restart');
    mongoose.connect(process.env.DB).then(() => console.log('DB connected'));
};

const adminUser : IUser = {
    _id: new Types.ObjectId('5e4b95d863103e001f694335'),
    username: 'crudy',
    password: createHash('sha256').update('abc').digest('hex'),
    email: 'abc@abc.com',
    todos: [{_id: new Types.ObjectId('5e4b95d863103e001f694337'), task: 'Integrate database', completed: false}, 
            {_id: new Types.ObjectId('5e4b95d863103e001f694338'), task: 'fix todo update bug', completed: true},
            {_id: new Types.ObjectId('5e4b95d863103e001f694339'), task: 'style todo list', completed: true},
            {_id: new Types.ObjectId('5e4b95d863103e001f69433a'), task: 'add README', completed: true},
            {_id: new Types.ObjectId('5e4b95d863103e001f69433b'), task: 'submit assignment', completed: false}]
};
const testUser : IUser = {
    _id: new Types.ObjectId('5e4b95d863103e001f694336'),
    username: 'test',
    password: createHash('sha256').update('test').digest('hex'),
    email: 'test@test.com',
    todos: [{_id: new Types.ObjectId('5e4b95d863103e001f69433c') , task: 'Add todo', completed: false}]
};

export const users: IUser[] = [adminUser, testUser];
export const signedInUsers: Map<string, IUser> = new Map();

export const getUserByEmail = async (email: string) => {
    if(!process.env.DB) return users.find(user => user.email === email);
    return await User.findOne({email: email});
};

export const userExists = async (email: string) => {
    if(!process.env.DB) return users.some(user => user.email === email);
    return false; //await User.exists({email: email});
};

export const storeToken = (token : string, user : IUser) => {
    // if(!process.env.DB) {
        signedInUsers.set(token, user);
        return token;
    // }
};

export const getSignedInUser = async (token : string) => {
    return signedInUsers.get(token);
    // return await User.findById(signedInUsers.get(token)?._id);
};

export const getSignedInUserTodos = async (token : string) => {
    if(!process.env.DB) return signedInUsers.get(token)?.todos;
    return signedInUsers.get(token)?.todos || [];
};
export const addTodo = async (todo : IToDo, user : IUser) => {
    // if(!process.env.DB)
    const newTodo = new ToDo(todo);
    await newTodo.save();
    await User.updateOne({_id: user._id}, {$push: {todos: newTodo}});
    return newTodo;
};
export const deleteTodo = async (todoId : string, user : IUser) => {
    // if(!process.env.DB)
    const todo = await ToDo.findById(todoId);
    await User.updateOne({_id: user._id}, {$pull: {todos: todo}});
    return todo;
};
export const updateTodo = async (todo : IToDo, user : IUser) => {
    // if(!process.env.DB)
    const todoArray = user.todos.map(t => { return todo._id === t._id ? todo : t; });
    await User.updateOne({_id: user._id}, {$set: {todos: todoArray}});
    return todo;
};

export const saveUser = async (user : IUser) => {
    if(!process.env.DB) users.push(user);
    const newUser = new User(user);
    await newUser.save();
};