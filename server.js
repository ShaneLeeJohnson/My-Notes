// imports express
const express = require('express');
// imports the file system
const fs = require('fs');
// imports the path module
const path = require('path');
// imports the version 4 universally unique identifier module
const { v4: uuid } = require('uuid');
// initializes the uuid module
uuid();

// creates the app variable and sets it equal to the express function call
const app = express();
// creates the port variable and sets it equal to PORT environment variable from heroku or to local host 3001
const port = process.env.PORT || 3001;

// middleware for express.json
app.use(express.json());
// custom middleware that serves the index.html page in the public directory
app.use(express.static('public'));

// get route for the notes.html file
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/notes.html'))
})

// get route for api/notes. Fetches and returns all notes from the database
app.get('/api/notes', (req, res) => {
    // Read notes from the database file (db.json)
    fs.readFile('./db/db.json', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error reading notes');
            return; // Early exit if there's an error
        }

        // Parse the JSON data into an array of note objects
        const notes = JSON.parse(data);
        // Send the array of notes as a JSON response to the client
        res.json(notes);
    });
});

// post route for api/notes. Handles creating a new note
app.post('/api/notes', (req, res) => {
    // Receives the new note data from the client's request body
    const newNote = req.body;
    // Generates a unique identifier for the new note
    newNote.id = uuid();

    // Reads existing notes from the database file (db.json)
    fs.readFile('./db/db.json', (err, data) => {
        if (err) {
            console.error(err); // Logs any errors reading the file
            res.status(500).send('Error reading notes'); // Sends an error response
            return; // Exit the function early if there's an error
        }

        // Parse the JSON data into an array of note objects
        const notes = JSON.parse(data);
        // Adds the new note to the existing notes array
        notes.push(newNote);

        // Writes the updated notes back to the database file
        fs.writeFile('./db/db.json', JSON.stringify(notes), (err) => {
            if (err) {
                console.error(err); // Logs any errors writing the file
                res.status(500).send('Error saving notes'); // Sends an error response
                return; // Exits the function early if there's an error
            }

            // Send the newly created note back to the client as a JSON response
            res.json(newNote);
        });
    });
});

// delete route for api/notes/:id. Handles deleting a specific note
app.delete('/api/notes/:id', (req, res) => {
    // Extracts the note ID from the request parameters
    const noteId = req.params.id;

    // Reads existing notes from the database file
    fs.readFile('./db/db.json', (err, data) => {
        if (err) {
            console.error(err); // Logs any errors reading the file
            res.status(500).send('Error reading notes'); // Sends an error response
            return; // Exits the function early if there's an error
        }

        // Parses the JSON data into an array of notes objects
        const notes = JSON.parse(data);

        try {
            // Finds the index of the note to delete
            const index = notes.findIndex((note) => note.id === noteId);
            if (index !== -1) {
                // Removes the note from the array
                notes.splice(index, 1);

                // Writes the updated notes back to the database file
                fs.writeFile('./db/db.json', JSON.stringify(notes), (err) => {
                    if (err) {
                        console.error(err); // Logs any errors writing to the file
                        res.status(500).send('Error deleting note'); // Sends an error response
                    } else {
                        // Indicates successful deletion with a 200 status code
                        res.sendStatus(200);
                    }
                });
            } else {
                // Note not found, send a 404 response
                res.status(404).send('Note not found');
            }
        } catch (error) {
            // Handles any unexpected errors during deletion
            console.error(error);
            res.status(500).send('Error deleting note');
        }
    });
});

// Listens for the port to start the server on and logs to the console what port it's listening on
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
})