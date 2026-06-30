Act as an expert Node.js developer. I am building a "Tourist Guide" web application. 

Here is my tech stack and requirement:
- Frontend: Basic HTML and CSS.
- Backend: Node.js with Express.js (JavaScript).
- Feature: A user types in a destination/city name on the frontend. The backend needs to fetch information about that city from Wikipedia using a free Google/MediaWiki API endpoint and return it to the frontend.

Please write the backend code (`server.js`) that:
1. Sets up a basic Express server.
2. Serves the static HTML/CSS files.
3. Creates a POST or GET API route (e.g., `/api/guide`) that takes a `city` name from the frontend request.
4. Uses `fetch` or `axios` to call the Wikipedia API to retrieve a short summary/extract of that city.
5. Handles errors gracefully if the city isn't found.

Provide clean, commented code and briefly explain how to structure the project files.
