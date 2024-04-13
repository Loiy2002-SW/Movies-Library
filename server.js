

const express = require('express');

const data = require('./Movie Data/data.json');


const app = express();

// Defining the port number for the server to listen on
const port = 3000;


// Starting the server to listen on the 3000 port
app.listen(port, ()=>{
    console.log(`the server is running on port: ${port}`);
});


// movie constructor
class Movie{
    constructor(title, poster_path, overview){
        this.title = title;
        this.poster_path = poster_path;
        this.overview = overview;
    }
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


//Handling 500 status code error
app.use((err, req, res, next)=>{

    console.error(err.stack);

    res.status(500).json({
        "status": 500,
        "responseText": "Sorry, something went wrong"
        });

});


//Handling 404 status code error (NOT Found)
app.use((req, res) => {

    res.status(404).json({
        "status": 404,
        "responseText": "Sorry, rount not found"
    });

})