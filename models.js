const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * Movie schema for storing movie information.
 */
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

/**
 * User schema for storing user information.
 */
let userSchema = mongoose.Schema({
    Username: {type: String, required: true},
    Password: {type: String, required: true},
    Email: {type: String},
    Birthday: {type: Date},
    FavoriteMovies: [{type: mongoose.Schema.Types.ObjectId, ref: 'Movie'}],
    ProfilePicture: {type: String},
    Bio: {type: String}
});

/**
 * Hashes the provided password.
 * @param {string} Password - The password to be hashed.
 * @returns {string} - The hashed password.
 */
userSchema.statics.hashPassword = (Password) => {
    return bcrypt.hashSync(Password,10);
};

/**
 * Validates the provided password against the stored hashed password.
 * @param {string} Password - The password to validate.
 * @returns {boolean} - True if the provided password matches the stored hashed password, false otherwise.
 */
userSchema.methods.validatePassword = function(Password) {
    return bcrypt.compareSync(Password, this.Password);
};

// Model definitions
/**
 * Movie model for interacting with the movies collection.
 */
let Movie = mongoose.model('Movie', movieSchema);

/**
 * User model for interacting with the users collection.
 */
let User = mongoose.model('User', userSchema);

// Export models for usage in other files
module.exports.Movie = Movie;
module.exports.User = User;
