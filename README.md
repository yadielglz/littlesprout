# LittleSprout - Baby Tracker App 🌱

A beautiful, modern baby tracking application built with vanilla JavaScript, featuring glass morphism design and comprehensive baby care management tools.

![LittleSprout Baby Tracker](https://img.shields.io/badge/LittleSprout-Baby%20Tracker-blue?style=for-the-badge&logo=heart)

## ✨ Features

### 🕐 **Real-time Clock & Weather**
- Live clock display with date
- Weather information integration
- Responsive design for all devices

### 📊 **Activity Tracking**
- Feed tracking (breast/formula with quantity)
- Sleep and nap monitoring
- Diaper change logging
- Tummy time tracking
- Mood recording with emoji analytics
- Custom activity creation

### ⏱️ **Activity Timer**
- Timer for sleep, naps, and tummy time
- Start/stop functionality
- Activity-specific tracking

### 📦 **Inventory Management**
- Track diapers, wipes, formula, and medicine
- Automatic deduction when activities are logged
- Low stock warnings
- Visual inventory display

### 🏆 **Milestone Tracking**
- Pre-defined milestone types
- Custom milestone creation
- Milestone ticker display
- Date tracking and history

### 📈 **Growth Monitoring**
- Height and weight tracking
- Multiple unit support (lbs/kg, in/cm, ft-in, m-cm)
- Growth history visualization
- Automatic activity logging

### 🗓️ **Scheduling & Reminders**
- Feeding schedule management
- Custom reminders
- Doctor appointment tracking
- Notification system

### 🎨 **Modern UI/UX**
- Glass morphism design
- Dark/light mode toggle
- Responsive mobile-first design
- Smooth animations and transitions
- Beautiful gradients and shadows

### 💾 **Data Management**
- Local storage for data persistence
- Multiple baby profiles support
- Data backup and export functionality
- Cross-device synchronization (via browser)

## 🚀 Quick Start

### Option 1: GitHub Pages (Recommended)
1. Fork this repository
2. Go to Settings > Pages
3. Select "Deploy from a branch"
4. Choose "main" branch and "/ (root)" folder
5. Your app will be available at `https://yourusername.github.io/littlesprout`

### Option 2: Local Development
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/littlesprout.git
   cd littlesprout
   ```

2. Open `index.html` in your browser or use a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

3. Navigate to `http://localhost:8000` in your browser

## 📱 Browser Support

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ⚠️ Internet Explorer (not supported)

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: Tailwind CSS + Custom CSS
- **Icons**: Font Awesome 6
- **Fonts**: Google Fonts (Quicksand)
- **Storage**: Local Storage API
- **Design**: Glass Morphism, Responsive Design

## 📁 Project Structure

```
littlesprout/
├── index.html          # Main HTML file
├── styles.css          # Custom CSS styles
├── app.js             # JavaScript application logic
├── README.md          # This file
└── .gitignore         # Git ignore file
```

## 🎯 Key Features Explained

### Activity Logging
Track various baby activities with timestamps, notes, and mood indicators. The app automatically deducts inventory items when relevant activities are logged.

### Inventory Management
- **Diapers**: Automatically deducted when diaper changes are logged
- **Wipes**: Used with diaper changes (2 wipes per change)
- **Formula**: Deducted based on feeding quantity (1 bottle = 4 oz)
- **Medicine**: Deducted when medication is logged

### Timer Functionality
Start timers for activities like sleep, naps, and tummy time. The timer displays elapsed time and can be stopped to log the activity.

### Growth Tracking
Monitor your baby's growth with support for multiple measurement units:
- Weight: lbs, kg
- Height: in, cm, ft-in, m-cm

### Dark Mode
Toggle between light and dark themes for comfortable viewing in any lighting condition.

## 🔧 Customization

### Adding Custom Activities
The app supports custom activity creation with custom icons and colors.

### Modifying Inventory Items
Edit the `inventory` object in `app.js` to add or modify inventory items.

### Styling Changes
Modify `styles.css` to customize the appearance and glass morphism effects.

## 📊 Data Storage

All data is stored locally in the browser's localStorage. This means:
- ✅ No server required
- ✅ Works offline
- ✅ Fast performance
- ⚠️ Data is device-specific
- ⚠️ Clearing browser data will remove all information

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Tailwind CSS** for the utility-first CSS framework
- **Font Awesome** for the beautiful icons
- **Google Fonts** for the Quicksand font family
- **Glass Morphism** design inspiration from modern UI trends

## 📞 Support

If you have any questions or need help:
- Create an issue on GitHub
- Check the browser console for error messages
- Ensure you're using a modern browser

## 🔮 Future Enhancements

- [ ] Cloud synchronization
- [ ] Photo upload for milestones
- [ ] Advanced analytics and charts
- [ ] Export to PDF/CSV
- [ ] Push notifications
- [ ] Multi-language support
- [ ] PWA (Progressive Web App) features

---

**Made with ❤️ for parents and caregivers everywhere**

*LittleSprout - Growing together, one milestone at a time* 