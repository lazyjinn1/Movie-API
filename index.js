// 1. defining express to a variable. Express is used as a way to make writing node easier
const express = require('express'),

// defining morgan. morgan allows you to have an easier time in handling logging
morgan = require('morgan'),

// defining fs. fs is the file system and has access to your computer's files
fs = require('fs'),

// defining path. path is the last part of the url
path = require('path');

// defining a variable app as express's many functions
const app = express();

// creating an empty log stream  @ __dirname/txt.log
//__dirname = directory name. In this case movie_api cus thats where index is //txt.log is a new file
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'txt.log'), {flags: 'a'})

// 5. accessing morgan's 'combined' preset and logging what it finds directly into the previously created file
app.use(morgan('combined', {stream: accessLogStream}));

//requests the time whenever it is called
let timeKeeper = (req,res,next) =>{
    req.timeKeeper = Date.now();
    //next() opens up the next middleware
    next();
};

//activates timeKeeper
app.use(timeKeeper);
//activates morgan's ('common') preset
app.use(morgan('common'));
// 4. opens up static files in the public folder 
app.use(express.static('public'));

//sample array for top ten movies
let topTenMovies = [
    {
        movieName: 'movie1',
        movieDirector: 'director1'
    },
    {
        movieName: 'movie2',
        movieDirector: 'director2'
    },
    {
        movieName: 'movie3',
        movieDirector: 'director3'
    },
    {
        movieName: 'movie4',
        movieDirector: 'director4'
    },
    {
        movieName: 'movie5',
        movieDirector: 'director5'
    },
    {
        movieName: 'movie6',
        movieDirector: 'director6'
    },
    {
        movieName: 'movie7',
        movieDirector: 'director7'
    },
    {
        movieName: 'movie8',
        movieDirector: 'director8'
    },
    {
        movieName: 'movie9',
        movieDirector: 'director9'
    },
    {
        movieName: 'movie10',
        movieDirector: 'director10'
    },
];

// 3. default page with no path
app.get('/', (req, res) => {
    let responseText = 'Welcome to my app. \n This is the default page!';
    responseText += '\n<small>Requested at: ' + req.timeKeeper +'</small>';
    res.send(responseText);
});

// if user loads into /documentation, this file opens up the documentation.html file in the public folder
app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', {root: __dirname});
});

// 2. if user loads into /movies, this returns the topTenMovies array in JSON
app.get('/movies', (req, res) => {
    res.json(topTenMovies);
});

// if user loads into /secreturl, this gives a statement and provides time info on when this happened.
app.get('/secreturl', (req, res) => {
    let responseText = 'This is a super secret URL. \n How did you get in here?';
    responseText += '\n<small>Requested at: ' + req.timeKeeper + '</small>';
    res.send(responseText);
})

// 6. error logger just in case something wrong happens
app.use((err, req, res, next) => {
    console.error(err.stack);
    console.log('Whoops, something broke');
    res.status(500).send('Something Broke Oh no!');
})

//default port
app.listen(8080, () => {
    console.log('You are listening on port 8080');
});