import express from 'express';

const PORT = process.env.PORT || 3001;

const app = express();

const router = express.Router();

import BlogController from './controllers/BlogController'

// blog endoint

// Logging middleware
app.use(function(req, res, next) {
    console.log(`${req.method} , ${req.url}, ${req.path}`);
    next();
})

router.route("/blog/:title")
    .get(BlogController.getPost)
    .delete(BlogController.deletePost);

router.route("/blog/")
    .get(BlogController.getPosts)
    .post(BlogController.createPost)
    .put(BlogController.updatePost)

// base endpoint for the application
app.use( '/', router)

app.listen(PORT,() => console.log(`listening on port ${PORT}... `))
