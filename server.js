const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuid } = require('uuid');
uuid();

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/notes.html'))
})

app.get('/api/notes', (req, res) => {
    fs.readFile('./db/db.json', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error reading notes');
            return;
        }

        const notes = JSON.parse(data);
        res.json(notes);
    });
});

app.post('/api/notes', (req, res) => {
    const newNote = req.body;
    newNote.id = uuid();

    fs.readFile('./db/db.json', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error reading notes');
            return;
        }

        const notes = JSON.parse(data);
        notes.push(newNote);

        fs.writeFile('./db/db.json', JSON.stringify(notes), (err) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error saving notes');
                return;
            }

            res.json(newNote);
        });
    });
});

app.delete('/api/notes/:id', (req, res) => {
    const noteId = req.params.id;

    fs.readFile('./db/db.json', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error reading notes');
            return;
        }

        const notes = JSON.parse(data);

        try {
            const index = notes.findIndex((note) => note.id === noteId);
            if (index !== -1) {
                notes.splice(index, 1);

                fs.writeFile('./db/db.json', JSON.stringify(notes), (err) => {
                    if (err) {
                        console.error(err);
                        res.status(500).send('Error deleting note');
                    } else {
                        res.sendStatus(200);
                    }
                });
            } else {
                res.status(404).send('Note not found');
            }
        } catch (error) {
            console.error(error);
            res.status(500).send('Error deleting note');
        }
    });
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
})