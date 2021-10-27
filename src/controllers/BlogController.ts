import express from "express";
import crypto from 'crypto';
import BlogModel, { IBlogModel, IPost } from '../models/BlogModel';
// TODO install jsonwebtoken types 
// npm i --save-dev @types/jsonwebtoken
import jwt from 'jsonwebtoken';

const  SECRET  = process.env.SECRET || 'secret1288';

interface IBlogController{
    getPosts(req: express.Request, res:express.Response): Promise<void>
    getPost(req: express.Request , res: express.Response): Promise<void>
    createPost(req: express.Request, res: express.Response): Promise<void>
    deletePost(req:express.Request, res:express.Response) : Promise<void>
    
}

let blogModel: IBlogModel;

// getting a blog model object
BlogModel().then( function (blogModelObj: IBlogModel) { blogModel = blogModelObj})


const BlogController: IBlogController =  {
    getPosts: async (req: express.Request, res:express.Response)=>{
        try{

            const posts : IPost[] = await blogModel.getPosts();
            res.send(posts);
            
        } catch(err:any){
            res.sendStatus(500);
        }
    },

    getPost: async (req: express.Request, res:express.Response) =>{
        const title = req.params.title;
        if(!title){
            res.status(404).send();
            console.log()
            return;
        } 

        const id = crypto.createHash('md5').update(title).digest('base64');

        try{ 
            const post: IPost = await blogModel.getPost(id);
            res.send(post);
        } catch(err:any){
            if(err.name === "RowDoesNotExist"){
               res.sendStatus(404);
               return;
            }
            res.sendStatus(500);
        }
        console.log('finished!')

    },

    createPost: async (req: express.Request, res:express.Response) =>{
        // TODO need to check the JWT webtoken 
        

        const bearerHeader = req.headers["authorization"];

        if(!bearerHeader){
            res.sendStatus(404);
            return;
        }

        const token: string = (bearerHeader.split(' '))[1];
        let userId: string;
        try {
            const decoded = jwt.verify(token, SECRET);
        } catch (err) {
            res.sendStatus(404);
            return;
        }

        const { title, id , content } = req.body;
        // title string, id:string, content: string, userId:string
        // TODO need to get the user id
        await blogModel.createPost(title, id , content, userId)
        res.sendStatus(200);
    },

    deletePost : async (req: express.Request, res: express.Response) =>{
        const { id } = req.params;
        const bearerHeader = req.headers["authorization"];

        if(!bearerHeader){
            res.sendStatus(404);
            return;
        }

        const token: string = (bearerHeader.split(' '))[1];
        let userId: string;
        try {
            const decoded = jwt.verify(token, SECRET);
        } catch (err) {
            res.sendStatus(404);
            return;
        }

        await blogModel.deletePost(id);
        res.sendStatus(200);
    }

}


export default BlogController;