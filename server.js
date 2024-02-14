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

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
})