import { User } from "./models/user";
import { randomUUID, createHash } from "crypto";

const adminUser : User = {
    _id: '5e4b95d863103e001f694335',
    username: 'crudy',
    password: createHash('sha256').update('abc').digest('hex'),
    email: 'abc@abc.com',
    todos: [{_id: '5e4b95d863103e001f694337', task: 'Integrate database', completed: false}, 
            {_id: '5e4b95d863103e001f694338', task: 'fix todo update bug', completed: true},
            {_id: '5e4b95d863103e001f694339', task: 'style todo list', completed: true},
            {_id: '5e4b95d863103e001f69433a', task: 'add README', completed: true},
            {_id: '5e4b95d863103e001f69433b', task: 'submit assignment', completed: false}]
};
const testUser : User = {
    _id: '5e4b95d863103e001f694336',
    username: 'test',
    password: createHash('sha256').update('test').digest('hex'),
    email: 'test@test.com',
    todos: [{_id: randomUUID(), task: 'Add todo', completed: false}]
};
  

export const users: User[] = [adminUser, testUser];
export const signedInUsers: Map<string, User> = new Map();

export const getUserByEmail = (email: string) => {
    return users.find(user => user.email === email);
};

export const userExists = (email: string) => {
    return users.some(user => user.email === email);
};

export const storeToken = (token : string, user : User) => {
    signedInUsers.set(token, user);
    return token;
};

export const getSignedInUser = (token : string) => {
    return signedInUsers.get(token);
};

export const getSignedInUserTodos = (token : string) => {
    return signedInUsers.get(token)?.todos;
};

export const saveUser = (user : User) => {
    users.push(user);
};