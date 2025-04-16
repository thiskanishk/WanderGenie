const express = require('express');
const app = express(); const PORT = 5000; app.get('/', (req, res) => { res.json({ success: true, message: 'WanderGenie Auth API' }); }); app.listen(PORT, () => { console.log('Server running on port ' + PORT); });
