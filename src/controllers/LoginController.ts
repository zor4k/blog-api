import express from 'express';
import crypto, { generateKeySync } from 'crypto';
import UserModel from '../models/UserModel';
import { InvalidCredentialsError } from '../misc/Errors';
import jwt, { JsonWebTokenError, JwtPayload } from 'jsonwebtoken';
import redis from 'redis';
import { RedisClientType } from 'redis/dist/lib/client';
import dayjs, { Dayjs } from "dayjs";


const SECRET : string = process.env.SECRET || 'ONLY_FOR_TESTING';


interface ILoginController {
    login(req: express.Request, res: express.Response ): Promise<void>
    logout(req: express.Request, res: express.Response ): Promise<void>
}

let redisClient: RedisClientType;
(async () => {
    redisClient = require('redis').createClient();

    redisClient.on('error', (err: any) => console.log('Redis Client Error', err));

    await redisClient.connect();

})();

const LoginController :ILoginController = {

    login: async function (req: express.Request, res: express.Response ){
        const { email, username, password } = req.body;
        //TODO get the username OR email of the user
        const passwordHash = crypto.createHash('sha256').update(password).digest('base64');

        try {
            let passwordHashDb: string;

            let user;

            // grabbing the password hash from the database and comparing it with 
            // the hash of the current user password
            if(username){

                passwordHashDb = await UserModel.getPasswordHashByUsername(username);
                if(passwordHash !== passwordHashDb){
                    throw new InvalidCredentialsError("");
                }
                user = await UserModel.getUserByUsername(username);
            } else if (email){
                passwordHashDb = await UserModel.getPasswordHashByEmail(email);

                if(passwordHash !== passwordHashDb){
                    throw new InvalidCredentialsError("");
                }

                user = await UserModel.getUserByEmail(email);


            } else {
                // returning a 400 because the request was malformed
                res.sendStatus(400);
                return;
            }
            
            // set the expire time for the token to 1 hour
            var token = jwt.sign(user , SECRET, {expiresIn : "1h"});
            res.send({ token });

        } catch (err: any){
            if(err.name === 'InvalidCredentials'){
                console.log(err)
                res.status(401).send("Incorrect username or password");
                return;
            }
            res.sendStatus(500);
            console.log(err);
            return;
        }

    },
    logout :async  (req: express.Request, res: express.Response) => {
        const userJwt = req.body.token;
        try{
            const decoded : any = jwt.verify(userJwt, SECRET);

            const secondsExpire: number = decoded.exp - dayjs().unix();

            const redisQueryBlacklist = await  redisClient.GET(`blackList:${userJwt}`)

            if(redisQueryBlacklist) {
                res.sendStatus(401);
                return; 
            }
            await redisClient.SETEX(`blackList:${userJwt}`, secondsExpire ,"true" );

            res.sendStatus(200);

        } catch(err){
            res.sendStatus(401);
            console.log(err);
        }
    }
}


export default LoginController;
