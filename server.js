const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();

// Middleware configuration
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const PORT = 3000;
const WIKI_API_URL = 'https://en.wikipedia.org/w/api.php';
const WIKI_HEADERS = {
    'User-Agent': 'TouristGuidePracticeApp/2.0 (https://example.com)'
};

// Helper function to format Wikipedia API results uniformally
function formatPage(page) {
    return {
        id: page.pageid ? page.pageid.toString() : '',
        name: page.title || 'Unknown Destination',
        img: page.thumbnail?.source || 'https://via.placeholder.com/500x300?text=No+Image',
        shortDesc: page.extract ? page.extract.substring(0, 140) + '...' : 'No description available.',
        fullDesc: page.extract || 'No details available from Wikipedia.',
        lat: page.coordinates?.[0]?.lat || null,
        lon: page.coordinates?.[0]?.lon || null,
        timings: 'Daily 09:00 AM - 06:00 PM (Varies)',
        rating: '⭐ 4.6/5',
        phone: 'Local Tourist Info Available Counter',
        website: page.fullurl || 'Not available'
    };
}

/* API: SEARCH TOURIST PLACES VIA WIKIPEDIA */
app.get('/api/places', async (req, res) => {
    const city = req.query.city?.trim();
    if (!city) return res.status(400).json({ message: 'Enter a valid location input.' });

    try {
        const response = await axios.get(WIKI_API_URL, {
            headers: WIKI_HEADERS,
            params: {
                action: 'query',
                format: 'json',
                origin: '*',
                generator: 'search',
                gsrlimit: 12,
                gsrsearch: `tourist attractions in ${city}`,
                prop: 'pageimages|extracts|info|coordinates',
                exintro: true,
                explaintext: true,
                pilimit: 'max',
                pithumbsize: 500,
                inprop: 'url'
            }
        });

        const pages = response.data.query?.pages || {};
        const places = Object.values(pages)
            .sort((a, b) => (a.index || 0) - (b.index || 0))
            .map(formatPage);
            
        res.json(places);
    } catch (error) {
        res.status(500).json({ message: 'Wikipedia API search failure' });
    }
});

/* API: PLACE DETAILS PROFILE QUERY */
app.get('/api/place/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const response = await axios.get(WIKI_API_URL, {
            headers: WIKI_HEADERS,
            params: {
                action: 'query',
                format: 'json',
                origin: '*',
                pageids: id,
                prop: 'pageimages|extracts|info|coordinates',
                explaintext: true,
                pithumbsize: 800,
                inprop: 'url'
            }
        });

        const pages = response.data.query?.pages || {};
        const page = pages[id];
        res.json(page ? formatPage(page) : null);
    } catch (error) {
        res.status(500).json({ message: 'Wikipedia details failure' });
    }
});

/* API: SHOP EXTRACTS WITH GEOLOCATION MAP COORDINATES (OVERPASS API) */
app.get('/api/shops', async (req, res) => {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ message: 'Coordinates missing' });

    try {
        const overpassQuery = `
            [out:json][timeout:15];
            (
              node["shop"](around:1500, ${lat}, ${lon});
              way["shop"](around:1500, ${lat}, ${lon});
            );
            out tags center 35;
        `;
        
        const response = await axios.post('https://overpass-api.de/api/interpreter', overpassQuery, {
            headers: { 'Content-Type': 'text/plain' }
        });

        const shops = (response.data.elements || []).map(element => ({
            name: element.tags.name || `${element.tags.shop ? element.tags.shop.charAt(0).toUpperCase() + element.tags.shop.slice(1) : 'Local'} Outlet`,
            type: element.tags.shop || 'Store',
            lat: element.lat || element.center?.lat || null,
            lon: element.lon || element.center?.lon || null,
            street: element.tags['addr:street'] || 'Nearby'
        }));

        res.json(shops);
    } catch (error) {
        console.error('Shops Fetch Error:', error.message);
        res.json([]);
    }
});

/* CATCH-ALL ROUTE FOR VIRTUAL SINGLE PAGE ROUTING */
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// App Initiation
app.listen(PORT, () => {
    console.log(`Server running at http://127.0.0.1:${PORT}`);
});