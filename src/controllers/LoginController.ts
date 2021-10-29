import express from 'express';
import crypto from 'crypto';
import UserModel from '../models/UserModel';
import { InvalidCredentialsError } from '../misc/Errors';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';

const SECRET : string = process.env.SECRET || 'ONLY_FOR_TESTING';

interface ILoginController {
    login(req: express.Request, res: express.Response ): Promise<void>

    //logout(req: express.Request, res: express.Response ): Promise<void>
}


const LoginController :ILoginController = {
    login: async function (req: express.Request, res: express.Response ){
        const { email, username, password } = req.body;
        //TODO get the username OR email of the user
        const passwordHash = crypto.createHash('md5').update(password).digest('base64');
        //TODO take the username/email and password hash and look for them within the database. 

        try {
            let passwordHashDb: string;

            let user;

            // grabbing the password hash from the database and comparing it with 
            // the hash of the current user password
            if(!email){
                passwordHashDb = await UserModel.getPasswordHashByUsername(passwordHash);

                if(passwordHash !== passwordHashDb){
                    throw new InvalidCredentialsError("");
                }

                user = await UserModel.getUserByUsername(username);

            } else if (!username){
                passwordHashDb = await UserModel.getPasswordHashByEmail(passwordHash);

                if(passwordHash !== passwordHashDb){
                    throw new InvalidCredentialsError("");
                }

                user = await UserModel.getUserByEmail(email);


            } else {
                // returning a 400 because the request was malformed
                res.sendStatus(400);
                return;
            }

            if(passwordHash !== passwordHashDb){
                res.sendStatus(400);
                return;
            }
            var token = jwt.sign(user , SECRET);
            res.send({ token });

        } catch (err){
            res.sendStatus(400);
            return;
        }

    }
}


export default LoginController;
