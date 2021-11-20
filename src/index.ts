import express from 'express';
const PORT = process.env.PORT || 3001;

const app = express();

const router = express.Router();

import BlogController from './controllers/BlogController';
import LoginController from './controllers/LoginController';


// Logging middleware
app.use(function(req, res, next) {
    console.log(`${req.method} , ${req.url}, ${req.path}`);
    next();
})

app.use(express.json())

router.route("/blog/:title")
    .get(BlogController.getPost)
    .delete(BlogController.deletePost);

router.route("/blog")
    .get(BlogController.getPosts)
    .post(BlogController.createPost)
    .put(BlogController.updatePost)

router.route("/login")
    .post(LoginController.login);

router.route("/logout")
    .post(LoginController.logout);

// base endpoint for the application
app.use( '/api/', router)

app.listen(PORT,() => console.log(`listening on port ${PORT}... `))
