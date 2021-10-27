import Pool from '../misc/sqlConnection';

interface IUser{
    id: number
    email: string
    username: string
    password: string
    role: string
}

interface IUserModel {
    getUser(email: string, paswordHash: string): 
}