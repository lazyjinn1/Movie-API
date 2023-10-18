// defining error for whenever something wrong happens.
const { error } = require('console');

// defining express to a variable. Express is used as a way to make writing node easier
const express = require('express');

// defining mongoose which is an object data modeling (ODM) library that allows you to 
// utilize and work with the data stored in MongoDB (our database)
const mongoose = require('mongoose');

// connects us to our models.js file which is where our different Schemas for our Movies and Users are
const Models = require('./models.js');

// imports our models.js file where our different Schemas for our Movies and Users are
const { Movie } = require('./models');

// defines the port that we are going to listen to for the server
const port = 8080;

// defines a Movies variable that relates to each movie in the Models' Movie Schema.
const Movies = Models.Movie;

// defines a USers variable that relates to each user in the Models' User Schema.
const Users = Models.User;

// defining a variable app as express's many functions
const app = express();

// connects our server to the MongoDB Database
mongoose.connect('mongodb://127.0.0.1:27017/test', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true
});

// parses data in the body of the document
bodyParser = require('body-parser');

// uses bodyParser's urlencoded function.
app.use(bodyParser.urlencoded({extended: true}));

// importing the auth.js file.
let auth = require('./auth.js')(app);

//importing the passport.js file.
const passport = require('passport');
require('./passport');

// defining path. path is the last part of the url
path = require('path');

// activates bodyParser
app.use(bodyParser.json());

// activates the ability to use public folders using express
app.use(express.static('public'));

// default page with no path brings you to documentation
app.get('/', (request, response) => {
    response.sendFile('public/documentation.html', {root: __dirname});
});

// if user loads into /movies, this returns the movies in JSON
// Request: See all movies
app.get('/movies', passport.authenticate('jwt', { session: false }), async (request, response) => {
    await Movies.find()
        // if movies are found, it responds with a positive status code and a list of the 
        // movies written in Json
        .then ((movies)=>{
            response.status(201).json(movies);
        })
        // if movies are not found, sends back an error.
        .catch((error) => {
            console.error(error);
            response.status(500).send('Error: ' + error);
        });
});

// Request: See specific movie details
app.get('/movies/title/:title', passport.authenticate('jwt', { session: false }), async (request, response) => {
    await Movies.findOne({Title: request.params.title})
        // if a movie is found with the given title, said movie is returned.
        .then((movies)=> {
            response.status(201).json(movies);
        })
        // if no movies are found, sends back an error.
        .catch((error) => {
            console.error(error);
            response.status(500).send('Error: ' + error);
        });
})

// Request: See movies by genre
app.get('/movies/genre/:genre', passport.authenticate('jwt', { session: false }), async (request, response) =>{
    await Movies.find({'Genre.Name': request.params.genre})
        // if movies are found with the given genre, said movies is returned.
        .then((movie) => {
            response.json(movie);
        })
        // if no movies are found, sends back an error.
        .catch((error) => {
            console.error(error);
            response.status(500).send('Error: ' + error);
        })
})

// Request: See movies by director
app.get('/movies/director/:director', passport.authenticate('jwt', { session: false}),async (request, response) =>{
    await Movies.find({'Director.Name': request.params.director})
        // if movies are found with the given director, said movies is returned.
        .then((movie) => {
            response.json(movie);
        })
        // if no movies are found, sends back an error.
        .catch((error) => {
            console.error(error);
            response.status(500).send('Error: ' + error);
        })
})

// Request: Registration
app.post('/user/user-info/register', async (request, response) => {
    await Users.findOne({Username: request.body.Username})
        // if username already exists on the database then an error is sent.
        .then((user)=> {
            if (user) {
                return response.status(400).send(request.body.Username + ' already exists');
            } else {
                // if the username DOESN'T exist, then a username, password,
                // email and birthday are taken to create a new user.
                Users.create({
                    Username: request.body.Username,
                    Password: request.body.Password,
                    Email: request.body.Email,
                    Birthday: request.body.Birthday
                })
                // after the new user is created, a code is sent out and 
                // a message that tells the user of their successful registration
                    .then ((user) => {
                        response.status(201).send(request.body.Username + ' has been successfully registered!');
                    })
                // otherwise, an error occurs
                .catch((error) => {
                    console.error(error);
                    response.status(500).send('Error: ' + error);
                })
            }     
        })
        // if any unforeseen errors occur, this is here to adress them.
        .catch((error) => {
            console.error(error);
            response.status(500).send('Error: ' + error);
        });
});

//Request: See all users
app.get('/users', passport.authenticate('jwt', {session: false}), async (request, response) => {
    await Users.find()
        // if there are users to be found, this will bring you to all of them.
        .then ((users)=>{
            response.status(201).json(users);
        })
        // if there are none, an error is sent.
        .catch((error) => {
            console.error(error);
            response.status(500).send('Error: ' + error);
        });
});

// Request: See specific users
app.get('/users/:username', passport.authenticate('jwt', {session: false}), async (request, response) => {
    await Users.findOne({Username: request.params.username})
        // If this username exist in the database, this returns their info.
        .then ((user) => {
            response.json(user);
        })
        // otherwise, an error is sent.
        .catch ((error)=>{
            console.error(error);
            response.status(500).send('Error: ' + error);
        });
}); 

// Request: Change Account Information
app.put('/users/user-info/:username', passport.authenticate('jwt',{session: false}), async (request, response) => {
    if (request.user.Username !== request.params.username){
        return response.status(400).send('Permission denied');
    }
        // this finds and updates a single document. That document is found by using the Username.
        await Users.findOneAndUpdate({Username: request.params.username}, 
        {
            // Using the above username, we are now going to update ('$ set) new information.
            $set:{
                Username: request.body.Username,
                Password: request.body.Password,
                Email: request.body.Email,
                Birthday: request.body.Birthday
            }
        },
        { // This just states that this is new information.
            new: true 
        })
        // updatedUser is the user after the $set.
        .then((updatedUser) => {
            response.json(updatedUser);
        })
        // otherwise, an error is sent.
        .catch((error) => {
            console.error(error);
            response.status(500).send('Error: ' + error);
        });
});

// Request: Delete specific users
app.delete('/users/user-info/:username/deregister', passport.authenticate('jwt', {session: false}), async (request, response) => {
    // this looks to see if there are any people with this username AND deletes it.
    await Users.findOneAndRemove({ Username: request.params.username })
      .then((user) => {
        // if username is not found, then an error is sent.
        if (!user) {
            response.status(400).send(request.params.username + ' was not found');
        } else {
            // If username IS found, then the username and document is deleted.
            response.status(200).send(request.params.username + ' was deleted.');
        }
      })
      .catch((error) => {
        console.error(error);
        response.status(500).send('Error: ' + error);
      });
  });

// Request: Add movie to favorites
app.put('/users/:username/favorites/:movie', passport.authenticate('jwt', {session: false}), async (request, response) => {
    try{
        // defines user as someone in the Users database with the username stated in :username
        const user = await Users.findOne({Username: request.params.username})
        // checks to see if the User is IN the database.
        if (!user) {
            return response.status(404).send('User not found.');
        }
        //defines movie as a movie with the title in :movie
        const movie = await Movies.findOne({Title: request.params.movie})
        
        // if movies does not exist, then an error is sent.
        if (!movie){
            response.status(400).send(request.params.movie + ' was not found in the database.');
        // if movie dodes exist but is already in the user's Favorites list, then this error is sent.
        } else if (user.FavoriteMovies.includes(movie._id)){
            response.status(400).send(request.params.movie + ' is already in your Favorites.');
        } else {
        // otherwise, it all goes through and a new movie is added to Favorites.
            user.FavoriteMovies.push(movie._id);
            response.status(200).json(request.params.movie + ' has been added to Favorites.');
            // this saves the data.
            await user.save();
        }

    } catch(error) {
        console.error(error);
        response.status(500).send('Error: ' + error);
    }
    
});

// Request: Remove movie from favorites
app.delete('/users/:username/favorites/:movie', passport.authenticate('jwt', {session: false}), async (request, response) => {
    try{
        // defines user as someone in the Users database with the username stated in :username
        const user = await Users.findOne({Username: request.params.username})
        // if user does not exist then an error will occur.
        if (!user) {
            return response.status(404).send('User not found.');
        }

        //defines movie as a movie with the title in :movie
        const movie = await Movies.findOne({Title: request.params.movie})
        // if movie does not exist, then this error will occur.
        if (!movie){
            response.status(400).send(request.params.movie + ' was not found in the database.');
            // if this movie was not in your favorites, then this error occurs.
        } else if (!user.FavoriteMovies.includes(movie._id)){
            response.status(400).send(request.params.movie + ' was not found in your Favorites.');
        } else {
            // otherwise, this pulls the old movie id away and removes it from your Favorites List.
            user.FavoriteMovies.pull(movie._id);
            response.status(200).json(request.params.movie + ' has been removed to Favorites.');
            // saves the data.
            await user.save();
        }

    } catch(error) {
        console.error(error);
        response.status(500).send('Error: ' + error);
    }
    
});

// error logger just in case something wrong happens
app.use((error, request, response, next) => {
    console.error(error.stack);
    console.log('Whoops, something broke');
    response.status(500).send('Something Broke Oh no!');
});

//default port
app.listen(port, () => {
    console.log(`You are listening on port ${port}`)
});