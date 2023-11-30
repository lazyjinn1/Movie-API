// allows us to use the different Schemas used for our movies and users.
const mongoose = require('mongoose');
//allows us to use hashPassword so we can hash out private information such as passwords
const bcrypt = require('bcrypt');


// this is the schema (schematics) for our movies
let movieSchema = mongoose.Schema({
    Title: {type: String, required: true},
    Description: {type: String, required: true},
    Genre: {
        Name: String,
        Description: String,
    },
    Director: {
        Name: String,
        Bio: String,
    },
    ImagePath: String,
    Featured: Boolean,
});

// this is the schema (schematics) for our users
let userSchema = mongoose.Schema({
    Username: {type: String, required: true},
    Password: {type: String, required: true},
    Email: {type: String},
    Birthday: {type: Date},
    FavoriteMovies: [{type: mongoose.Schema.Types.ObjectId, ref: 'Movie'}],
    profilePic: {type: String},
})

// this hashes the password that is inputted for the userSchema. Hashing means that it gets 
// essentially codified and impossible to revert back to normal
userSchema.statics.hashPassword = (Password) => {
    return bcrypt.hashSync(Password,10);
};

// However, the hashed password can be compared to the hashed password that is in the database to allow login.
userSchema.methods.validatePassword = function(Password) {
    return bcrypt.compareSync(Password, this.Password);
};

// gives variables for the finalized model (movie and user)
let Movie = mongoose.model('Movie',movieSchema);
let User = mongoose.model('User', userSchema);

// exports said variables for usage in other files.
module.exports.Movie = Movie;
module.exports.User = User;

