const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname,'/public/notes.html'))
})

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
})