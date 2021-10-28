import { RowDoesNotExistError } from '../misc/Errors';
import pool from '../misc/sqlConnection'


interface IPost{
    title: string,
    id: string, 
    userName : string,
    userEmail: string,
    content: string 
}

interface IBlogModel{
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

const BlogModel: IBlogModel = {

        getPosts: async function() {
            const sql =  `SELECT * FROM Post;`;
            
            const [rows,] = await pool.query(sql) ;
            return  rows.map( (row: Object) => rowToPost(row));
            
        },
        getPost: async function (id: string) {
            const sql = `SELECT Post.title, Post.id, Post.content, 
            User.email, User.username  
            FROM Post, User WHERE User.id = Post.userId AND Post.id =  ?`;
            const [rows,] = await pool.query(sql, id) as any;

            if (rows.length === 0) {
                throw new RowDoesNotExistError('row for given blog title does not exist ');
            }
            return rowToPost(rows[0]);

        },
        createPost: async function(title: string, id:string, content: string, userId:string) {
            const sql = `INSERT INTO Post(title, id, userId, content) 
                VALUES(? , ? , ? , ?)`;

            await pool.query(sql, [ title, id, userId, content]);
        },

        deletePost: async function(id: string) {
            const sql = `DELETE FROM Post where id = ?`;

            await pool.query(sql, id);
        },
        updatePost: async function(id: string, content: string, title:string) {
            const sql = `UPDATE POST SET content = ? AND title = ? WHERE id = ?`;
            await pool.query(sql, [ content , title , id ]);
        },

}


export default BlogModel;
export { IPost , IBlogModel};
