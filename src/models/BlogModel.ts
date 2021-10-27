const mysql = require('mysql2/promise');
import { stringify } from 'querystring';
import { RowDoesNotExistError } from '../misc/Errors';
import { Connection } from 'mysql2/promise';
import { connect } from 'http2';
import BlogController from '../controllers/BlogController';
import Pool from '../misc/sqlConnection'
import { PoolConnection } from 'mysql2/typings/mysql';

const HOST = process.env.SQL_HOST;
const PASSWORD = '1234'//process.env.SQL_PASSWORD;
const DB = process.env.SQL_DB;
const USER = process.env.USER;

console.log(HOST);

interface IPost{
    title: string,
    id: string, 
    userName : string,
    userEmail: string,
    content: string 
}

interface IBlogModel{
    connection: PoolConnection
    getPosts():Promise<IPost[]>
    getPost(id: string): Promise<IPost>
    createPost(title: string, id:string, content: string, userId:string) : Promise<void>
    deletePost(id:string) : Promise<void>
    updatePost(id:string, content:string, title:string) : Promise<void>
}

function rowToPost(row: any): IPost{
    return{
        title : row.title,
        id : row.id,
        userName:row.username, 
        userEmail: row.email,
        content : row.content
    }
}

async function BlogModel() : Promise<IBlogModel> {
//const BlogModel : IBlogModel= {
    const BlogModel: IBlogModel = {

        connection : await Pool.getPool(),
        getPosts: async function() {
            const sql =  `SELECT * FROM Post;`;
            
            const [rows,] = await this.connection.query(sql) as any;
            return  rows.map( (row: Object) => rowToPost(row));
            
        },
        getPost: async function (id: string) {
            const sql = `SELECT Post.title, Post.id, Post.content, 
            User.email, User.username  
            FROM Post, User WHERE User.id = Post.userId AND Post.id =  ?`;
            const [rows,] = await this.connection.query(sql, id) as any;

            if (rows.length === 0) {
                throw new RowDoesNotExistError('row for given blog title does not exist ');
            }
            return rowToPost(rows[0]);

        },
        createPost: async function(title: string, id:string, content: string, userId:string) {
            const sql = `INSERT INTO Post(title, id, userId, content) 
                VALUES(? , ? , ? , ?)`;

            await this.connection.query(sql, [ title, id, userId, content]);
        },

        deletePost: async function(id: string) {
            const sql = `DELETE FROM Post where id = ?`;

            await this.connection.query(sql, id);
        },
        updatePost: async function(id: string, content: string, title:string) {
            const sql = `UPDATE POST SET content = ? AND title = ? WHERE id = ?`;
            await this.connection.query(sql, [ content , title , id ]);
        },

    }
    return BlogModel;

}


export default BlogModel;
export { IPost, IBlogModel };
