
const express = require('express');
const cors = require('cors');
const data = require('./Movie Data/data.json');
const axios = require('axios').default;
require('dotenv').config();


const myApiKey = process.env.API_KEY;

let url = "postgres://loai:1234@localhost:5432/movies";


const {Client} = require('pg');
let client = new Client(url);


const app = express();
app.use(cors());
app.use(express.json());

// Defining the port number for the server to listen on
const port = 3001;



client.connect().then(() => {

    // Starting the server to listen on the 3000 port
app.listen(port, () => {
    console.log(`the server is running on port: ${port}`);
});

});

//Create movie in the database (add)




// movie constructor
class Movie {
    constructor(title, poster_path, overview) {
        this.title = title;
        this.poster_path = poster_path;
        this.overview = overview;
    }
}

// movie constructor
class Movie2 {
    constructor(id, title, release_date, poster_path, overview) {
        this.id = id;
        this.title = title;
        this.release_date = release_date;
        this.poster_path = poster_path;
        this.overview = overview;
    }
}

app.post('/addMovie', addMovie);
app.get('/getMovies', getMovies);


function generateId() {
    // Get current timestamp in milliseconds
    const timestamp = new Date().getTime();
    
    // Generate two random numbers between 0 and 99
    const randomNum1 = Math.floor(Math.random() * 100);
    const randomNum2 = Math.floor(Math.random() * 100);
    
    // Combine the random numbers and timestamp
    const combinedId = randomNum1.toString().padStart(2, '0') +
                      randomNum2.toString().padStart(2, '0') +
                      timestamp.toString().slice(-3);
    
    // Ensure the total length of the ID is 5 characters
    const id = combinedId.slice(0, 5);
    
    return id;
}




function addMovie(req, res){

    let {title, release_date, overview} = req.body;

    //this is what I meant
    let id = generateId();

    let sqlQuery = 'INSERT INTO moviesList(id, title, release_date, overview) VALUES($1, $2, $3, $4)';
    let values = [id, title, release_date, overview];

    client.query(sqlQuery, values).then( () => {

        res.send('Data was added successfully');

    }).catch((e) => {
        res.send(`Something went wrong, the error: ${e}`);
    });
    
}

function getMovies(req, res){

    
    let sqlQuery = 'SELECT * FROM moviesList';

    client.query(sqlQuery).then( (reslut) => {

        //console.log(reslut);

        res.json(reslut.rows);

    }).catch((e) => {
        res.send(`Something went wrong, the error: ${e}`);
    });
    
}


// Setting up a route for the root URL
app.get('/', (req, res) => {

    let result = new Movie(data.title, data.poster_path, data.overview);

    res.json(result);

});


// Setting up a route for the favorite URL
app.get('/favorite', (req, res) => {

    res.send('Welcome to Favorite Page');

});



// Setting up a route for the trending movies URL
app.get('/trending', (req, res) => {

    const url = `https://api.themoviedb.org/3/trending/all/week?api_key=${myApiKey}`;
    try{
        axios.get(url)
        .then(result => {
            let movies = result.data.results.map(movie => {
                return new Movie2(movie.id, movie.title, movie.release_date, movie.poster_path, movie.overview);
            });
            res.json(movies);
        })
        .catch((error) => {
            console.log(error);
           
        });
    }
    catch (error) {
        handleError500(error,req,res);
    }
 
});


// Setting up a route for 'searching in movies' URL
app.get('/search', (req, res) => {

    let queryName = req.query.movieName;

    let url = `https://api.themoviedb.org/3/search/movie?api_key=${myApiKey}&language=en-US&query=${queryName}&page=2`;

    axios.get(url)
    .then(result => {

        let moviesResult = result.data.results.map(movie => {
            return new Movie2(movie.id, movie.title, movie.release_date, movie.poster_path, movie.overview);
        });
        res.json(moviesResult);

    })
    .catch(error => {
        console.log(error);
    });
});

// Setting up a route for 'now playing movies' URL
app.get('/nowPlayingMovies', (req, res) => {

    let url = `https://api.themoviedb.org/3/movie/now_playing?api_key=${myApiKey}`;
    axios.get(url).then(reslut => {

        let nowPlayingMoviesResult = reslut.data.results.map((movie) => {
            return new Movie2(movie.id, movie.title, movie.release_date, movie.poster_path, movie.overview);
        });

        res.json(nowPlayingMoviesResult);

    })
    .catch(error =>{
    console.log(error)
});
});

// Setting up a route for 'top rated movies' URL
app.get('/topRatedMovies', (req, res) => {

    let url = `https://api.themoviedb.org/3/movie/top_rated?api_key=${myApiKey}`;
    axios.get(url).then(reslut => {

        let topRatedMoviesResult = reslut.data.results.map((movie) => {
            return new Movie2(movie.id, movie.title, movie.release_date, movie.poster_path, movie.overview);
        });

        res.json(topRatedMoviesResult);

    })
    .catch(error =>{
    console.log(error)
});
});


//Handling 500 status code error
app.use((err, req, res, next) => {
    handleError500(err, req, res);
});


//Handling 404 status code error (NOT Found)
app.use((req, res) => {

    handleError404(req, res);

});


function handleError500(err,req,res){

    console.error(err.stack);

    res.status(500).json({
        "status": 500,
        "responseText": "Sorry, something went wrong"
    });

}

function handleError404(req,res){

    res.status(404).json({
        "status": 404,
        "responseText": "Sorry, rount not found"
    });
}