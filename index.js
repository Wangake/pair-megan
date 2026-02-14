const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint that uses Queen Anita's service
app.post('/api/start', async (req, res) => {
    try {
        const { phone } = req.body;
        const cleanPhone = phone.replace(/\D/g, '');
        
        console.log(`📱 Pairing request for: ${cleanPhone}`);
        
        // Use Queen Anita's API
        const home = await axios.get('https://pair.davidcyril.name.ng/pair');
        const cookies = home.headers['set-cookie'];
        
        // Submit phone
        await axios.post('https://pair.davidcyril.name.ng/pair',
            `number=${cleanPhone}`,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Cookie': cookies?.join('; '),
                    'User-Agent': 'Mozilla/5.0'
                }
            }
        );
        
        // Get code
        const codeRes = await axios.get(`https://pair.davidcyril.name.ng/code?number=${cleanPhone}`, {
            headers: { 'Cookie': cookies?.join('; ') }
        });
        
        res.json({ 
            success: true, 
            code: codeRes.data.code,
            phone: cleanPhone
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        res.json({ success: false, error: error.message });
    }
});

// Catch-all route to serve index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 MEGAN MD Pairing UI running on port ${PORT}`);
});