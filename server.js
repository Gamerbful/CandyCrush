// Imports
const express = require('express')
const app = express()
const port = 5000

// Listen on Port 5000
app.listen(process.env.PORT || port, () => console.info(`App listening on port ${port}`))
app.use(express.static('public'));

app.use('/css', express.static(__dirname + 'public/css'))
app.use('/js', express.static(__dirname + 'public/js'))
app.use('/img', express.static(__dirname + 'public/images'))
// Set View's
app.set('views', './views');    
app.set('view engine', 'html');
// Navigation
app.get('', (req, res) => {
    res.sendFile(__dirname + '/views/index.html')
})
