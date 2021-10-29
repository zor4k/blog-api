
import pool from '../misc/sqlConnection'
import { PoolConnection } from 'mysql2/typings/mysql';
import { InvalidCredentialsError, RowDoesNotExistError } from '../misc/Errors';

interface IUser{
    id: number
    email: string
    username: string
    password: string
    role: string
}

interface IUser {
    
}

interface IUserModel {
    getPasswordHashByEmail(email: string): Promise<string>
    getPasswordHashByUsername(username : string) : Promise<string>
    getUserByEmail(email: string): Promise<object>
    getUserByUsername(username: string) : Promise<object>
    /*
        TODO add:
        getUserRoleById
        getUserRoleByUsername
    */
}



const UserModel : IUserModel =  {
    getPasswordHashByEmail : async (email: string ) => {
        const sql = 'SELECT passwordHash from User where email = ?;';
        const [ rows , ] = await pool.query(sql, email);
        if(rows.length === 0){
            throw new InvalidCredentialsError("");
        }
        return rows[0].passwordHash;
    },

    getPasswordHashByUsername : async (username: string) => {
        const sql = 'SELECT passwordHash from User where username = ?;';
        const [ rows , ] = await pool.query(sql, username);
        if(rows.length === 0){
            throw new InvalidCredentialsError("");
        }
        return rows[0].passwordHash;
    }, 

    getUserByEmail: async (email: string) =>{
        const sql = 'SELECT username, email, id FROM User WHERE email = ?';
        const [ rows , ] = await pool.query(sql, email);
        if(rows.length === 0){
            throw new InvalidCredentialsError("");
        }
        return rows[0];
    },

    getUserByUsername: async (email: string) =>{
        const sql = 'SELECT username, email, id FROM User WHERE email = ?';
        const [ rows , ] = await pool.query(sql, email);
        if(rows.length === 0){
            throw new InvalidCredentialsError("");
        }
        return rows[0];
    }
}

export default UserModel;