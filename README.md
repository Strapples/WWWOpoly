### `README.md`

# WWWOpoly

WWWOpoly is a web-based game where players compete to claim, upgrade, and trade websites in a Monopoly-like setting. Players earn credits by visiting, owning, and sharing links, while navigating a dynamic economy influenced by global and player-driven actions.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Configuration](#configuration)
- [Game Mechanics](#game-mechanics)
  - [Achievements and Badges](#achievements-and-badges)
  - [Daily Missions](#daily-missions)
  - [Global Economy](#global-economy)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Claim Links**: Players can claim website links, which then earn tolls whenever another player visits them.
- **Upgrades**: Players can upgrade their owned links to increase tolls and earning potential.
- **Achievements and Badges**: Unlock achievements for reaching milestones.
- **Daily Missions**: Complete daily tasks for bonus rewards.
- **Global Economy**: A dynamic economy where player actions impact the game environment, including toll rates and upgrade costs.
- **Community Fund**: Players can contribute to a global fund to unlock game-wide benefits.

---

## Technologies Used

- **Node.js**: Server-side JavaScript runtime.
- **Express.js**: Web framework for handling HTTP requests and routing.
- **MongoDB**: NoSQL database for storing user data, links, and global economy metrics.
- **Mongoose**: ORM for MongoDB to define models and interact with the database.
- **Nodemailer**: Email service for sending notifications and daily digests.
- **node-cron**: Scheduler for timed events and global economy modifiers.

---

## Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/WWWOpoly.git
   cd WWWOpoly
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Setup MongoDB**:
   - Make sure MongoDB is installed and running.
   - Configure the MongoDB URI in the `.env` file.

4. **Configure Environment Variables**:
   - Create a `.env` file in the root directory and specify the following variables:
     ```
     MONGO_URI=mongodb://localhost:27017/wwwopoly
     JWT_SECRET=your_jwt_secret
     EMAIL_USER=your_email@example.com
     EMAIL_PASS=your_email_password
     ```

5. **Start the Server**:
   ```bash
   npm start
   ```

---

## Configuration

- **Global Economy Settings**: You can configure the initial values and thresholds for the global economy in the `GlobalEconomy` model (located in `models/globaleconomy.js`).
- **Achievements and Missions**: Adjust available achievements and daily missions in the `utils/achievements.js` and `utils/dailymissions.js` files.

---

## Game Mechanics

### Achievements and Badges

Players earn achievements as they progress in the game, such as claiming a certain number of links or spending credits. Achievements are stored in the database and are awarded automatically based on in-game actions.

### Daily Missions

Daily missions reset each day at midnight UTC. Missions include tasks like:
- **Claiming Links**: Claim a specified number of links.
- **Visiting Links**: Visit a certain number of links to earn rewards.
- **Trading Links**: Make trades with other players.
- **Reporting Dead Links**: Help the community by reporting broken or inactive links.

Missions reward players with points or credits and are tracked in the `User` model. Players can opt to receive daily mission reminders via email.

### Global Economy

The game’s economy dynamically adjusts based on player actions:
- **Total Credits in Circulation**: As players accumulate credits, prices may rise (inflation).
- **Average Toll Rate**: Frequently visited links may experience toll increases, while rarely visited links may drop in toll.
- **Scheduled Events**: Periodic events like "High Toll Weekend" introduce variety by temporarily modifying the economy.
- **Global Fund**: Players can contribute to a global fund, which unlocks rewards or decreases costs when certain thresholds are met.

---

## API Endpoints

### User Management
- `POST /api/users/register` - Register a new user.
- `POST /api/users/login` - Log in an existing user.
- `PUT /api/users/update-email-preferences` - Update user email notification preferences.

### Game Actions
- `POST /api/links/claim` - Claim a link for a user (costs 2 points).
- `POST /api/links/visit` - Visit a link and pay a toll to the owner.
- `POST /api/links/trade` - Trade a link between two users.

### Global Economy
- `GET /api/economy/status` - Retrieve the current global economy metrics.
- `POST /api/economy/contribute` - Contribute credits to the global community fund.

---

## Contributing

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```
3. Make your changes and commit them:
   ```bash
   git commit -m "Add feature-name"
   ```
4. Push to your branch:
   ```bash
   git push origin feature-name
   ```
5. Create a pull request on GitHub.

---

## License

This project is licensed under the GNU AGPLv3. See the [LICENSE](./LICENSE) file for details.

---

## Contact

For questions or feedback, please contact [Alin Straps](mailto:your-email@example.com).

---

## Acknowledgements

- **MongoDB** for providing the NoSQL database backbone.
- **Express** for simplifying server-side code.
- **Nodemailer** for easy email integration.
- **node-cron** for reliable scheduling.
```

---

### Explanation of Key Sections

- **Features**: Highlights the core gameplay elements to give potential contributors or players an overview.
- **Installation**: Provides step-by-step setup instructions for local development.
- **Game Mechanics**: Breaks down the main components like achievements, missions, and the global economy, explaining each in a way that’s easy to understand.
- **API Endpoints**: Lists key API endpoints for interacting with the game, making it easier for developers to test or extend the game.
- **Contributing**: Guides potential contributors on how to make improvements to the project.
- **License**: Mentions that the project is under the GNU AGPLv3 license, linking to the full license file.

This `README.md will be updated as the same TXT file.