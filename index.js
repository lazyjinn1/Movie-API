// defining express to a variable. Express is used as a way to make writing node easier
const express = require('express');
const mongoose = require('mongoose');
const Models = require('./models.js');
const port = 8080;

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://127.0.0.1:27017/test', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true
});

bodyParser = require('body-parser');

// defining path. path is the last part of the url
path = require('path');

// defining a variable app as express's many functions
const app = express();

app.use(bodyParser.json());

app.use(express.static('public'));

// default page with no path brings you to documentation
app.get('/', (request, response) => {
    response.sendFile('public/documentation.html', {root: __dirname});
});

// if user loads into /movies, this returns the movies in JSON
// Request: See all movies
app.get('/movies',async (request, response) => {
    await Movies.find()
        .then ((movies)=>{
            response.status(201).json(movies);
        })
        .catch((error) => {
            console.error(error);
            response.status(500).send('Error: ' + error);
        });
});

// Request: See specific movie details
app.get('/movies/title/:title', async (request, response) => {
    await Movies.findOne({Title: request.params.title})
        .then((movies)=> {
            response.status(201).json(movies);
        })
        .catch((error) => {
            console.error(error);
            response.status(500).send('Error: ' + error);
        });
})

// Request: See movies by genre
app.get('/movies/genre/:genre', async (request, response) =>{
    await Movies.find({'Genre.Name': request.params.genre})
        .then((movie) => {
            response.json(movie);
        })
        .catch((error) => {
            console.error(error);
            response.status(500).send('Error: ' + error);
        })
})

// Request: See movies by director
app.get('/movies/director/:director', async (request, response) =>{
    await Movies.find({'Director.Name': request.params.director})
        .then((movie) => {
            response.json(movie);
        })
        .catch((error) => {
            console.error(error);
            response.status(500).send('Error: ' + error);
        })
})

// Request: Registration
app.post('/account/user-info/register', async (request, response) => {
    await Users.findOne({Username: request.body.Username})
        .then((user)=> {
            if (user) {
                return response.status(400).send(request.body.Username + ' already exists');
            } else {
                Users.create({
                    Username: request.body.Username,
                    Password: request.body.Password,
                    Email: request.body.Email,
                    Birthday: request.body.Birthday
                })
                    .then ((user) => {
                        response.status(201).send(request.body.Username + ' has been successfully registered!');
                    })
                .catch((error) => {
                    console.error(error);
                    response.status(500).send('Error: ' + error);
                })
            }     
        })
        .catch((error) => {
            console.error(error);
            response.status(500).send('Error: ' + error);
        });
});

//Request: See all users
app.get('/users',async (request, response) => {
    await Users.find()
        .then ((users)=>{
            response.status(201).json(users);
        })
        .catch((error) => {
            console.error(error);
            response.status(500).send('Error: ' + error);
        });
});

// Request: See specific users
app.get('/users/:username', async (request, response) => {
    await Users.findOne({Username: request.params.username})
        .then ((user) => {
            response.json(user);
        })
        .catch ((error)=>{
            console.error(error);
            response.status(500).send('Error: ' + error);
        });
}); 

// Request: Change Account Information
app.put('/users/user-info/:username', async (request, response) => {
    await Users.findOneAndUpdate(
        { 
        Username: request.params.username
        }, 
        {
        $set:{
            Username: request.body.Username,
            Password: request.body.Password,
            Email: request.body.Email,
            Birthday: request.body.Birthday
        }
    },
    { 
        new: true 
    })
    .then((updatedUser) => {
        response.json(updatedUser);
    })
    .catch((error) => {
        console.error(error);
        response.status(500).send('Error: ' + error);
    });
});

// Request: Delete specific users
app.delete('/users/user-info/:username/deregister', async (request, response) => {
    await Users.findOneAndRemove({ Username: request.params.username })
      .then((user) => {
        if (!user) {
            response.status(400).send(request.params.username + ' was not found');
        } else {
            response.status(200).send(request.params.username + ' was deleted.');
        }
      })
      .catch((error) => {
        console.error(error);
        response.status(500).send('Error: ' + error);
      });
  });

// Request: Add movie to favorites
app.put('/users/:username/favorites/:movie', async (request, response) => {
    try{
        const user = await Users.findOne({Username: request.params.username})
        if (!user) {
            return response.status(404).send('User not found.');
        }

        const movie = await Movies.findOne({Title: request.params.movie})
        if (!movie){
            response.status(400).send(request.params.movie + ' was not found in the database.');
        } else if (user.FavoriteMovies.includes(movie._id)){
            response.status(400).send(request.params.movie + ' is already in your Favorites.');
        } else {
            user.FavoriteMovies.push(movie._id);
            response.status(200).json(request.params.movie + ' has been added to Favorites.');
            await user.save();
        }

    } catch(error) {
        console.error(error);
        response.status(500).send('Error: ' + error);
    }
    
});

// Request: Remove movie from favorites
app.delete('/users/:username/favorites/:movie', async (request, response) => {
    try{
        const user = await Users.findOne({Username: request.params.username})
        if (!user) {
            return response.status(404).send('User not found.');
        }

        const movie = await Movies.findOne({Title: request.params.movie})
        if (!movie){
            response.status(400).send(request.params.movie + ' was not found in the database.');
        } else if (!user.FavoriteMovies.includes(movie._id)){
            response.status(400).send(request.params.movie + ' was not found in your Favorites.');
        } else {
            user.FavoriteMovies.pull(movie._id);
            response.status(200).json(request.params.movie + ' has been removed to Favorites.');
            await user.save();
        }

    } catch(error) {
        console.error(error);
        response.status(500).send('Error: ' + error);
    }
    
});

// error logger just in case something wrong happens
app.use((error, request, response) => {
    console.error(error.stack);
    console.log('Whoops, something broke');
    response.status(500).send('Something Broke Oh no!');
})

//default port
app.listen(port, () => {
    console.log(`You are listening on port ${port}`);
});