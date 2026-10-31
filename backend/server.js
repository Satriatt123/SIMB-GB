const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(cors());
app.use(express.json());

app.listen(5000, () => console.log('Backend berjalan di port 5000'));