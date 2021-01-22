const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcryt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please enter an email'],
        lowercase: true,
        unique: true,
        validate: [isEmail, 'Please enter an valid email']
    },
    password: {
        type: String,
        required: [true, 'Please enter an password'],
        minlength: [6, 'Password should be atleast 6 characters length']
    }
});

//fire a function before doc saved to db
userSchema.pre('save', async function(next) {
    const salt = await bcryt.genSalt();
    this.password = await bcryt.hash(this.password, salt);
    next();
});

//static method to login user
userSchema.statics.login = async function(email, password) {
    const user = await this.findOne({ email });
    if(user) {
        const auth = await bcryt.compare(password, user.password); //comparing user given pass with db hash pass
        if(auth) {
            return user;
        }
        throw Error('Incorrect Password');
    }
    throw Error('Incorrect email');
}

const User = mongoose.model('user', userSchema);

module.exports = User;