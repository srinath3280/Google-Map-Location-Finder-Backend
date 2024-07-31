const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 4050;

// Database connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Srinath@3280',
    database: 'location',
});

connection.connect((err) => {
    if (err) {
        console.error('Database connection error:', err);
        return;
    }
    console.log('Connected to the database.');
});

// Middleware
app.use(bodyParser.json());
app.use(cors());

// API endpoint to receive coordinates
app.post('/savecoordinates', async (req, res) => {
    const { lat, lng } = req.body;
    if (!lat || !lng) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Fetch the highest ID
        const [rows] = await connection.promise().query('SELECT MAX(sid) AS maxId FROM coordinates');
        const maxId = rows[0].maxId || 0;
        const newId = maxId + 1;

        const accept_flag = "N";
        const rider_name = `Rider${newId}`;

        // Insert the new record with incremented ID
        const query = 'INSERT INTO coordinates (sid, rider_name, latitude, longitude, accept_flag) VALUES (?, ?, ?, ?, ?)';
        const values = [newId, rider_name, lat, lng, accept_flag];

        connection.query(query, values, (err, results) => {
            if (err) {
                console.error('Error inserting data:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            res.status(201).json({ message: 'Location saved', id: newId });
        });
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// API endpoint to fetch all locations
app.get('/findLocations', (req, res) => {
    const query = 'SELECT * FROM coordinates';
    
    connection.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching data:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.status(200).json(results);
    });
  });

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
