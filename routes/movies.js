const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/authenticate');

// Define movie routes


router.route('/movies').get(movieController.getMovies);
router.route('/movies/:id').get(isAuthenticatedUser,movieController.getMovieById);

router.route('/movies').post(isAuthenticatedUser,authorizeRoles('admin'),movieController.createMovie);
router.route('/movies/:id').put(isAuthenticatedUser,authorizeRoles('admin'),movieController.updateMovie);
router.route('/movies/:id').delete(isAuthenticatedUser,authorizeRoles('admin'),movieController.deleteMovie);

module.exports = router;
