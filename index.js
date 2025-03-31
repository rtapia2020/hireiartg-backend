
const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const analyzeRoute = require('./routes/analyze');

const app = express();
app.use(cors());
app.use(fileUpload());
app.use(express.json());

app.get('/health', (req, res) => res.send('HireBot API is running'));
app.post('/analyze', analyzeRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
