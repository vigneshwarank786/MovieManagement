const catchAsyncError = require('../middlewares/catchAsyncError');
const User = require('../models/userModel');
const ErrorHandler = require('../utils/errorHandler');
const sendToken = require('../utils/jwt');
const crypto = require('crypto');
const sendEmail = require('../utils/email');
const Movie = require('../models/movieModel');




// Register User - /register
exports.registerUser = catchAsyncError(async (req, res, next) => {
    try {
      const { username, email, password, fullName, phoneNumber, address, preferences, watchlist } = req.body;
  
      let avatar;
  
      let BASE_URL = process.env.BACKEND_URL;
      if (process.env.NODE_ENV === 'production') {
        BASE_URL = `${req.protocol}://${req.get('host')}`;
      }
  
      if (req.file) {
        avatar = `${BASE_URL}/uploads/user/${req.file.originalname}`;
      }
  
      const user = await User.create({
        username,
        email,
        password,
        fullName,
        avatar,
        phoneNumber,
        address,
        preferences,
        watchlist,
      });
  
      sendToken(user, 201, res);
    } catch (error) {
      next(error);
    }
  });


exports.loginUser = catchAsyncError(async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return next(new ErrorHandler('Please enter username and password', 400));
    }

    const user = await User.findOne({ $or: [{ email: username }, { username: username }] }).select('+password');

    if (!user) {
        return next(new ErrorHandler('Invalid username or password', 401));
    }

    if (!(await user.isValidPassword(password))) {
        return next(new ErrorHandler('Invalid username or password', 401));
    }

    sendToken(user, 200, res);
});


  // Logout User - /logout
exports.logoutUser = (req, res, next) => {
    try {
      res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
      })
      .status(200)
      .json({
        success: true,
        message: "Logged out successfully"
      });
    } catch (error) {
      next(error);
    }
  };

  
//Forgot Password - /password/forgot
exports.forgotPassword = catchAsyncError( async (req, res, next)=>{
    const user =  await User.findOne({email: req.body.email});

    if(!user) {
        return next(new ErrorHandler('User not found with this email', 404))
    }

    const resetToken = user.getResetToken();
    await user.save({validateBeforeSave: false})
    
    let BASE_URL = process.env.FRONTEND_URL;
    if(process.env.NODE_ENV === "production"){
        BASE_URL = `${req.protocol}://${req.get('host')}`
    }





    //Create reset url
    const resetUrl = `${BASE_URL}/password/reset/${resetToken}`;

    const message = `Your password reset url is as follows \n\n 
    ${resetUrl} \n\n If you have not requested this email, then ignore it.`;

    try{
        sendEmail({
            email: user.email,
            subject: "MovieSystem Password Recovery",
            message
        })

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email}`
        })

    }catch(error){
        user.resetPasswordToken = undefined;
        user.resetPasswordTokenExpire = undefined;
        await user.save({validateBeforeSave: false});
        return next(new ErrorHandler(error.message), 500)
    }

})  

//Reset Password - /password/reset/:token
exports.resetPassword = catchAsyncError( async (req, res, next) => {
   const resetPasswordToken =  crypto.createHash('sha256').update(req.params.token).digest('hex'); 

   

    const user = await User.findOne( {
        resetPasswordToken,
        resetPasswordTokenExpire: {
            $gt : Date.now()
        }
    } )

    if(!user) {
        return next(new ErrorHandler('Password reset token is invalid or expired'));
    }

    if( req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler('Password does not match'));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpire = undefined;
    await user.save({validateBeforeSave: false})
    sendToken(user, 201, res)

})


  
  exports.getUserProfile = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id)
    res.status(200).json({
         success:true,
         user
    })
 })



 //Change Password  - password/change
exports.changePassword  = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');
    if(!await user.isValidPassword(req.body.oldPassword)) {
        return next(new ErrorHandler('Old password is incorrect', 401));
    }

    user.password = req.body.password;
    await user.save();
    res.status(200).json({
        success:true,
    })
 })


 exports.updateProfile = catchAsyncError(async (req, res, next) => {
    let newUserData = {
        username: req.body.username,
        email: req.body.email,
        fullName: req.body.fullName,
    }

    let avatar;
    let BASE_URL = process.env.BACKEND_URL;
    if(process.env.NODE_ENV === "production"){
        BASE_URL = `${req.protocol}://${req.get('host')}`
    }

    if(req.file){
        avatar = `${BASE_URL}/uploads/user/${req.file.originalname}`
        newUserData = {...newUserData,avatar }
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
    })

    res.status(200).json({
        success: true,
        user
    })

})


exports.getAllUsers = catchAsyncError(async (req, res, next) => {
    const users = await User.find();
    res.status(200).json({
         success: true,
         users
    })
 })
 
 //Admin: Get Specific User - admin/user/:id
 exports.getUser = catchAsyncError(async (req, res, next) => {
     const user = await User.findById(req.params.id);
     if(!user) {
         return next(new ErrorHandler(`User not found with this id ${req.params.id}`))
     }
     res.status(200).json({
         success: true,
         user
    })
 });
 

 //Admin: Update User - admin/user/:id
 exports.updateUser = catchAsyncError(async (req, res, next) => {
     const newUserData = {
         name: req.body.name,
         email: req.body.email,
         role: req.body.role
     }
 
     const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
         new: true,
         runValidators: true,
     })
 
     res.status(200).json({
         success: true,
         user
     })
 })
 
 //Admin: Delete User - admin/user/:id
 exports.deleteUser = catchAsyncError(async (req, res, next) => {
     const user = await User.findById(req.params.id);
     if(!user) {
         return next(new ErrorHandler(`User not found with this id ${req.params.id}`))
     }
     await user.deleteOne();
     res.status(200).json({
         success: true,
     })
 })


 exports.addToWatchlist = async (req, res, next) => {
    try {
      const userId = req.user.id;
  
      const user = await User.findById(userId);
      
      const movie = await Movie.findById(req.params.id);
      
  
      if (!user || !movie) {
        return next(new ErrorHandler('User or movie not found', 404));
      }
  
      if (user.watchlist.includes(movie._id)) {
        return res.status(200).json({ success: true, message: 'Movie already in watchlist' });
      }
  
      user.watchlist.push(movie._id);
      await user.save();
  
      // Populate the movie details in the user's watchlist
      await user.populate('watchlist').execPopulate();
  
      res.status(200).json({ success: true, message: 'Movie added to watchlist', watchlist: user.watchlist });
    } catch (error) {
      return next(new ErrorHandler('Something went wrong', 500));
    }
  };
  