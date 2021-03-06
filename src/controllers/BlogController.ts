import express from "express";
import crypto from 'crypto';
import blogModel, { IBlogModel, IPost } from '../models/BlogModel';
// TODO install jsonwebtoken types 
// npm i --save-dev @types/jsonwebtoken
import jwt, { JwtPayload } from 'jsonwebtoken';
import redis from "redis";
import { RedisClientType } from "redis/dist/lib/client";
import dayjs from "dayjs";

const SECRET = process.env.SECRET || 'ONLY_FOR_TESTING';

const REDIS_HOST = process.env.REDIS_HOST || "localhost";

interface IBlogController{
    getPosts(req: express.Request, res:express.Response): Promise<void>
    getPost(req: express.Request , res: express.Response): Promise<void>
    createPost(req: express.Request, res: express.Response): Promise<void>
    deletePost(req:express.Request, res:express.Response) : Promise<void>
    updatePost( req: express.Request, res:express.Response ): Promise<void>

}

console.log("redis host: " + REDIS_HOST);

// getting a redis clinet
let redisClient: RedisClientType;
try {
	(async () => {
	    redisClient = require('redis').createClient({
            socket: { 
                host: REDIS_HOST,
                port:"6379"
            }
        });

	    redisClient.on('error', (err: any) => console.log('Redis Client Error', err));

	    await redisClient.connect();

	})();
} catch (err){
	console.log('getting redis client ');
	
}
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
            console.log(err)
            res.sendStatus(500);
        }

    },

    createPost: async (req: express.Request, res:express.Response) =>{
        // TODO need to check the JWT webtoken 
        

        const bearerHeader = req.headers["authorization"];

        if(!bearerHeader){
            res.sendStatus(401);
            return;
        }

        // checking if the token is blacklisted 
        const token: string = (bearerHeader.split(' '))[1];

        const redisResult = await redisClient.GET(`blacklist:${token}` );
        if(redisResult){
            res.status(401).send({err: "An invalid token was sent"});
        }
        
        let userId: string;
        try {
            const decoded = jwt.verify(token, SECRET);
            if( typeof decoded !== "string" ){
                userId = decoded.id;

            }else{
                res.sendStatus(500);
                return;
            }

        } catch (err: any) {
            if(err.name ==='JsonWebTokenError' ){
                res.status(401).send({err: "An invalid token was sent."});
            } else if (err.name === 'TokenExpiredError') {
                res.status(401).send({err: "An invalid token was sent."});
            } else{
                res.sendStatus(500);
                console.log(err);
            }
            return;
        }

        const { title, content } = req.body;

        const id = crypto.createHash('md5').update(title).digest('base64');

        // title string, id:string, content: string, userId:string
        // TODO need to get the user id
        try{
            const currentDateTime = dayjs().toISOString().replace('T', ' ').replace('Z','');
            await blogModel.createPost(title, id , content, userId, currentDateTime);
            res.sendStatus(201);

        } catch(err: any)
        {
            if(err.code === 'ER_DUP_ENTRY'){
                res.status(409).send({err: "A post with the given title already exists. " +
                        "Use the PUT method to update it."})
                return;
            }

            res.status(500).send();
            console.log(err);
            
        }
    },

    deletePost : async (req: express.Request, res: express.Response) =>{
        const { title } = req.params;
        const bearerHeader = req.headers["authorization"];

        const id = crypto.createHash('md5').update(title).digest('base64');

        if(!bearerHeader){
            res.sendStatus(401);
            return;
        }

       const token: string = (bearerHeader.split(' '))[1];
       const redisResult = redisClient.GET(`blacklist:${token}`)
        if(!redisResult){
            res.status(401).send({err: "An invalid token was sent"});
        }

       try {
            jwt.verify(token, SECRET);
        } catch (err: any) {
            if(err.name ==='JsonWebTokenError' ){
                res.status(401).send({err: "An invalid token was sent."});
            } else{
                res.sendStatus(500);
            };
        }

        await blogModel.deletePost(id);
        res.sendStatus(200);
    },
    updatePost : async (req:express.Request, res: express.Response ) =>{

        const bearerHeader = req.headers["authorization"];

        if(!bearerHeader){
            res.sendStatus(401);
            return;
        }

        // checking if the token is blacklisted 
        const token: string = (bearerHeader.split(' '))[1];

        const redisResult = await redisClient.GET(`blacklist:${token}`);
        if(redisResult){
            res.status(401).send({err: "An invalid token was sent"});
        }
        
        try {
            jwt.verify(token, SECRET);

        } catch (err: any) {
            if(err.name ==='JsonWebTokenError' ){
                res.status(401).send({err: "An invalid token was sent."});
            } else{
                res.sendStatus(500);
            }
            return;
        }

        const { title , content } = req.body;
        // title string, id:string, content: string, userId:string

        const id = crypto.createHash('md5').update(title).digest('base64');

        try{
            await blogModel.updatePost(id, content , title)
            res.sendStatus(200);

        } catch(err: any)
        {
            console.log(err.name)
            res.status(500).send();
            console.log(err);
            
        }
    }

}


export default BlogController;
