# LittleSprout - Baby Tracker

A clean, modern, and intuitive baby tracking application built with vanilla JavaScript, HTML, and CSS. Perfect for parents who want to track their baby's daily activities, growth, and milestones without the complexity of large frameworks.

## 🌟 Features

### Core Functionality
- **Activity Logging**: Quick log feeds, diaper changes, sleep, naps, tummy time, and mood
- **Timer**: Built-in timer for tracking sleep, naps, and tummy time sessions
- **Daily Stats**: View today's feeding, diaper, and sleep statistics
- **Baby Info**: Track baby's name, birth date, and calculated age

### User Interface
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Dark Mode**: Toggle between light and dark themes
- **Real-time Clock**: Always know the current time
- **Modern UI**: Clean, intuitive interface with smooth animations

### Data Management
- **Local Storage**: All data is stored locally in your browser
- **No Registration**: Start using immediately without any sign-up
- **Privacy First**: Your data never leaves your device

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No additional software or dependencies required

### Installation
1. Download or clone this repository
2. Open `index.html` in your web browser
3. Start tracking your baby's activities!

### Alternative: Live Demo
You can also run the app locally using a simple HTTP server:

```bash
# Using Python 3
python3 -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (if you have http-server installed)
npx http-server
```

Then open `http://localhost:8000` in your browser.

## 📱 How to Use

### First Time Setup
1. Click the "Setup" button in the top right
2. Enter your baby's name and birth date
3. Click "Save" to get started

### Quick Actions
- **Feed**: Click the feed button to quickly log a feeding
- **Diaper**: Log diaper changes with one click
- **Sleep/Nap**: Track sleep sessions
- **Tummy Time**: Monitor tummy time activities
- **Mood**: Record your baby's mood

### Timer Feature
1. Click "Start Timer" in the timer section
2. The timer will begin counting up
3. Click "Stop Timer" when the activity ends
4. The session will be automatically logged

### Adding Detailed Activities
1. Click "Add Activity" in the activity log section
2. Select the activity type
3. Add optional notes
4. Click "Add Activity" to save

## 🛠️ Technical Details

### Architecture
- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: Tailwind CSS for utility-first styling
- **Icons**: Font Awesome for beautiful icons
- **Storage**: LocalStorage for data persistence

### File Structure
```
littlesprout/
├── index.html          # Main HTML file
├── styles.css          # Custom CSS styles
├── app.js             # Main JavaScript application
└── README.md          # This file
```

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🎨 Customization

### Adding New Activity Types
To add new activity types, modify the `defaultActivities` array in `app.js`:

```javascript
const defaultActivities = [
  // ... existing activities
  { id: 'new-activity', name: 'New Activity', icon: 'fas fa-icon', color: 'purple-500' }
];
```

### Styling
The app uses Tailwind CSS classes. You can customize the appearance by:
- Modifying `styles.css` for custom styles
- Updating Tailwind classes in `index.html`
- Adding new CSS animations and transitions

## 🔧 Development

### Local Development
1. Clone the repository
2. Make your changes
3. Test in your browser
4. Commit and push your changes

### Building for Production
Since this is a vanilla JavaScript app, no build process is required. Simply:
1. Ensure all files are in the same directory
2. Open `index.html` in a web browser
3. The app is ready to use!

## 📊 Data Export/Import

Currently, the app stores data locally in your browser's localStorage. To backup your data:

1. Open your browser's Developer Tools (F12)
2. Go to the Application/Storage tab
3. Find Local Storage for your domain
4. Copy the `littlesprout_data` value
5. Save it as a backup file

To restore data:
1. Replace the `littlesprout_data` value in localStorage
2. Refresh the page

## 🤝 Contributing

Contributions are welcome! Here are some ways you can help:

1. **Report Bugs**: Open an issue with detailed bug reports
2. **Feature Requests**: Suggest new features or improvements
3. **Code Contributions**: Submit pull requests with improvements
4. **Documentation**: Help improve this README or add code comments

### Development Guidelines
- Keep the code simple and readable
- Add comments for complex logic
- Test on multiple browsers
- Follow existing code style

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Tailwind CSS** for the beautiful utility-first CSS framework
- **Font Awesome** for the comprehensive icon library
- **All parents** who provided feedback and suggestions

## 📞 Support

If you need help or have questions:
1. Check the browser console for error messages
2. Ensure you're using a modern browser
3. Try clearing your browser's localStorage if you encounter issues
4. Open an issue on GitHub for bugs or feature requests

---

**Made with ❤️ for parents everywhere** 