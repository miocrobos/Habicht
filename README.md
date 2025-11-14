# UniSports 🏃‍♂️

**Connect. Play. Achieve.**

UniSports is a sports-focused social platform designed for Swiss universities and Hochschulen. It brings together students passionate about sports, providing a space to connect, chat, share achievements, and build a vibrant sports community.

## 🎯 Features

### Core Functionality
- **University Chat Rooms**: Dedicated chat rooms for each Swiss university/Hochschule
- **Real-time Messaging**: Instant communication powered by Socket.io
- **Admin Management**: School officials can manage their university's chat room
- **User Profiles**: Comprehensive profiles showcasing sports participation and achievements

### Profile Features
- **Bio Section**: Tell your sports story
- **Sports & Levels**: List sports you participate in with skill levels (Beginner, Intermediate, Advanced, Professional)
- **Achievements**: Track and showcase your sports accomplishments
- **5-Star Rating System**: Rate and be rated by other athletes
- **University Affiliation**: Connect with your university community

### User Experience
- **Intuitive Interface**: Clean, modern, and easy-to-navigate design
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Updates**: Instant message delivery and notifications

## 🏫 Supported Swiss Universities

- ETH Zürich
- EPFL (École Polytechnique Fédérale de Lausanne)
- University of Zürich
- University of Geneva
- University of Basel
- University of Bern
- University of Lausanne
- University of St. Gallen
- University of Fribourg
- University of Lucerne

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/miocrobos/UniSports.git
   cd UniSports
   ```

2. **Set up the Backend**
   ```bash
   cd backend
   npm install
   
   # Create environment file
   cp .env.example .env
   # Edit .env with your settings
   
   # Start the server
   npm start
   ```
   
   The backend will run on `http://localhost:5000`

3. **Set up the Frontend**
   ```bash
   cd ../frontend
   npm install
   
   # Create environment file
   cp .env.example .env
   # Edit .env if needed
   
   # Start the development server
   npm start
   ```
   
   The frontend will run on `http://localhost:3000`

### Default Configuration

**Backend (.env)**
```
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
CLIENT_URL=http://localhost:3000
```

**Frontend (.env)**
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

## 📖 Usage Guide

### Getting Started

1. **Register**: Create an account with your university email
2. **Choose Your University**: Select your Swiss university/Hochschule
3. **Complete Your Profile**: Add your bio, sports, and achievements
4. **Join Chat Rooms**: Connect with students from your university
5. **Build Your Reputation**: Earn ratings from fellow athletes

### Profile Management

- Navigate to "My Profile" from the navbar
- Click "Edit Profile" to update your information
- Add sports with skill levels
- Document your achievements with dates and descriptions
- View your rating from other users

### Chat Rooms

- Access chat rooms from the Dashboard or Chat page
- Select your university's chat room from the sidebar
- Send messages and interact in real-time
- See who joins and leaves the chat

### Rating System

- Visit other users' profiles
- Click on stars to rate (1-5 stars)
- View average ratings and total rating count
- Cannot rate your own profile

## 🛠️ Technology Stack

### Frontend
- **React** 18.2.0 - Modern UI library
- **React Router** 6.15.0 - Client-side routing
- **Socket.io Client** 4.6.1 - Real-time communication
- **Axios** 1.5.0 - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express** 4.18.2 - Web framework
- **Socket.io** 4.6.1 - Real-time bidirectional communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 🏗️ Project Structure

```
UniSports/
├── backend/
│   ├── server.js           # Main server file with API routes
│   ├── package.json        # Backend dependencies
│   └── .env.example        # Environment variables template
├── frontend/
│   ├── public/
│   │   └── index.html      # HTML template
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   └── Navbar.js
│   │   ├── pages/          # Page components
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Profile.js
│   │   │   └── Chat.js
│   │   ├── services/       # API and socket services
│   │   │   ├── api.js
│   │   │   └── socket.js
│   │   ├── styles/
│   │   │   └── index.css
│   │   ├── App.js          # Main app component
│   │   └── index.js        # Entry point
│   └── package.json        # Frontend dependencies
└── README.md
```

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT-based authentication
- Token-based API authorization
- CORS protection
- Input validation

## 🚀 Deployment

### Backend Deployment
1. Set environment variables on your hosting platform
2. Ensure JWT_SECRET is changed from default
3. Configure CLIENT_URL to match frontend domain
4. Deploy to platforms like Heroku, DigitalOcean, or AWS

### Frontend Deployment
1. Update REACT_APP_API_URL and REACT_APP_SOCKET_URL
2. Run `npm run build`
3. Deploy build folder to platforms like Vercel, Netlify, or AWS S3

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 🌟 Future Enhancements

- Event scheduling for sports activities
- Direct messaging between users
- Photo sharing in chat rooms
- Sports statistics tracking
- Tournament organization features
- Mobile app (iOS/Android)
- Integration with university sports departments
- Multi-language support (German, French, Italian)

## 📧 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Made with ❤️ for the Swiss university sports community**
