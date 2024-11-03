## WWWOpoly

Welcome to **WWWOpoly**, a web-based game inspired by Monopoly, where players "own" internet links and earn points by claiming and sharing URLs. Players gain credits from visitors who access their owned links through the platform. It's an engaging, competitive game designed for players to build virtual empires on the web!

---

### Table of Contents
1. [Game Mechanics](#game-mechanics)
2. [Project Overview](#project-overview)
3. [Installation](#installation)
4. [Environment Variables](#environment-variables)
5. [API Endpoints](#api-endpoints)
6. [Contributing](#contributing)

---

### Game Mechanics

The core gameplay of WWWOpoly revolves around link ownership, tolls, and strategic sharing:

- **Claim Links**: Players receive random web links from a database and can "claim" ownership by visiting and claiming them. Claimed links become part of the player's "empire."
- **Tolls**: When other players visit a claimed link, a small credit (or "toll") is deducted from the visitor’s account and credited to the owner.
- **Points and Leaderboard**: Players earn points for claiming links and collecting tolls. A leaderboard ranks players based on points, fostering competition.
- **Credits**: Players start with a set amount of credits, which they spend to pay tolls and earn through toll collection from other users visiting their links.

---

### Project Overview

**WWWOpoly** is built with a traditional web stack:

- **Backend**: Node.js and Express are used to handle API requests and game logic.
- **Database**: MongoDB stores user profiles, link data, and transaction logs.
- **Frontend**: (To be developed) React or Vue.js will provide the game's user interface.

---

### Installation

Follow these steps to set up the project locally:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yourusername/WWWOpoly.git
   cd WWWOpoly
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Setup MongoDB**:
   - Ensure MongoDB is running locally or set up a cloud instance (e.g., MongoDB Atlas).
   - Add the MongoDB URI to your environment variables as shown below.

4. **Run the Server**:
   - To start the server, run:
     ```bash
     npm start
     ```
   - For development with auto-reload:
     ```bash
     npx nodemon server.js
     ```

---

### Environment Variables

Create a `.env` file in the root directory and add the following variables:

```plaintext
MONGODB_URI=your_mongodb_uri_here
PORT=5000  # Or any other port you prefer
```

---

### API Endpoints

#### User Management

- **`POST /api/users/register`**  
  Register a new player. Returns a user object with starting credits and points.

#### Link Management

- **`GET /api/links/random-link`**  
  Retrieves a random link from the database for the player to view and potentially claim.

- **`POST /api/links/claim`**  
  Allows the player to claim ownership of a link, adding it to their empire.

- **`POST /api/links/visit`**  
  Simulates another player visiting a claimed link, transferring a toll to the link owner.

#### Leaderboard

- **`GET /api/leaderboard`**  
  Retrieves the top 10 players based on points.

---

### Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/new-feature`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature/new-feature`).
5. Open a pull request.

---

### License

This project is licensed under the GNUAGPL3 License.

---

Feel free to edit and amend this README as the project evolves / as you desire.