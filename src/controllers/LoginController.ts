import express from 'express';
import crypto from 'crypto';


interface ILoginController {
    login(req: express.Request, res: express.Response ): Promise<void>

    //logout(req: express.Request, res: express.Response ): Promise<void>
}


const LoginController :ILoginController = {
    login: async function (req: express.Request, res: express.Response ){

        //TODO get the username OR email of the user
        const { password, username } = req.body;
        const passwordHash = crypto.createHash('md5').update(password).digest('base64');

        //TODO take the username/email and password hash and look for them within the database. 
            

    }
}


export default LoginController;
