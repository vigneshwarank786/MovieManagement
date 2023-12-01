const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please enter your email'],   
     unique: true,
  },
  fullName: {
    type: String,
    required: [true, 'Please enter your full name'],   
  },
  email: {
    type: String,
    required: [true, 'Please enter email'],
        unique: true,
        validate: [validator.isEmail, 'Please enter valid email address']
  },
  password: {
    type: String,
    required: [true, 'Please enter password'],
    maxlength: [8, 'Password cannot exceed 8 characters'],
    select: false
},
avatar: {
    type: String
},
role :{
    type: String,
    default: 'user'
},
resetPasswordToken: String,
resetPasswordTokenExpire: Date,
phoneNumber: {
    type: String,
    validate: {
      validator: function (v) {
        return /^(\+971|0)?[1-9]\d{8}$/.test(v);
      },
      message: props => `${props.value} is not a valid UAE phone number!`,
    },
    required: [true, 'Please enter your phone number'],
    unique: true,
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
  },
  preferences: {
    genres: [{
      type: String,
      enum: ['Action', 'Drama', 'Comedy', 'Thriller', 'Sci-Fi', 'Horror', 'Romance', 'Other'],
    }],
    languages: [{
      type: String,
      enum: ['English', 'Spanish', 'French', 'Hindi', 'Other'],
    }],
  },
  watchlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
  }],
}, { timestamps: true });

userSchema.pre('save', async function (next){
    if(!this.isModified('password')){
        next();
    }
    this.password  = await bcrypt.hash(this.password, 10)
})

userSchema.methods.getJwtToken = function(){
   return jwt.sign({id: this.id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_TIME
    })
}

userSchema.methods.isValidPassword = async function(enteredPassword){
    return  bcrypt.compare(enteredPassword, this.password)
}

userSchema.methods.getResetToken = function(){
    const token = crypto.randomBytes(20).toString('hex');

   this.resetPasswordToken =  crypto.createHash('sha256').update(token).digest('hex');

    this.resetPasswordTokenExpire = Date.now() + 30 * 60 * 1000;

    return token
}
let model =  mongoose.model('User', userSchema);


module.exports = model;