const express = require('express');
const multer = require('multer');
const path = require('path');
const { registerUser, loginUser, logoutUser, getUserProfile, forgotPassword, resetPassword, changePassword, updateProfile, getAllUsers, getUser, updateUser, deleteUser, addToWatchlist } = require('../controllers/authController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/authenticate');

const upload = multer({storage: multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join( __dirname,'..' , 'uploads/user' ) )
    },
    filename: function(req, file, cb ) {
        cb(null, file.originalname)
    }
}) })


const router = express.Router();
router.route('/register').post(upload.single('avatar'), registerUser);
router.route('/login').post(loginUser);
router.route('/logout').get(logoutUser);
router.route('/myprofile').get(isAuthenticatedUser, getUserProfile);
router.route('/password/forgot').post(forgotPassword);
router.route('/password/reset/:token').post(resetPassword);
router.route('/password/change').put(isAuthenticatedUser, changePassword);
router.route('/update').put(isAuthenticatedUser,upload.single('avatar'), updateProfile);
router.post('/user/watchlist/:id', isAuthenticatedUser,addToWatchlist);



//Admin routes
router.route('/admin/users').get(isAuthenticatedUser,authorizeRoles('admin','manager'), getAllUsers);
router.route('/admin/user/:id').get(isAuthenticatedUser,authorizeRoles('admin','manager'), getUser)
                                .put(isAuthenticatedUser,authorizeRoles('admin'), updateUser)
                                .delete(isAuthenticatedUser,authorizeRoles('admin'), deleteUser);




module.exports = router;
