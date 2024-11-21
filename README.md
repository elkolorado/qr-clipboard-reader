# QR Clip - QR Code Clipboard Reader

A lightweight, browser-based QR code reader that works directly with clipboard images. Simply take a screenshot of any QR code and paste it into the web app to instantly decode its contents.

## Features

- 📋 Direct clipboard paste support
- 🔗 Automatic URL detection and opening
- 📝 One-click text copying
- 🌓 Dark/Light mode support
- 💨 Instant QR code detection
- 📱 PWA support for mobile installation
- 🔒 Works offline
- 🎯 No upload needed - works directly with clipboard
- 🖥️ Cross-platform compatibility

## Usage

1. Visit [QR Clip](https://qr-clip.vercel.app)
2. Take a screenshot of any QR code
3. Press `Ctrl+V` (or `Cmd+V` on Mac) to paste
4. View the decoded content instantly

### Auto-Action Mode

Enable the checkbox to:
- Automatically open URLs in a new tab
- Automatically copy text content to clipboard

## Technology

- Pure JavaScript with no framework dependencies
- Uses [jsQR](https://github.com/cozmo/jsQR) for QR code detection
- PWA-enabled for mobile installation
- Clipboard API for direct image access

## Installation

### Local Development

1. Clone the repository: 
```bash
git clone https://github.com/elkolorado/qr-clipboard-reader.git
```

2. Navigate to the project directory:
```bash
cd qr-clipboard-reader
```

3. Serve the files using any HTTP server

4. Open `http://localhost:8000` in your browser
Using Python
```bash
python -m http.server 8000
```
Using Node.js
```bash
npx serve
```
### Production Deployment

- Deploy the files to any static hosting service
- Ensure HTTPS is enabled for clipboard access
- Configure proper cache headers for static assets

## Browser Support

- Chrome (recommended)
- Firefox
- Edge
- Safari
- Any modern browser with clipboard API support

## Privacy

- All processing is done locally in the browser
- No data is sent to any server
- No cookies except for theme preference, and checkbox state
- No tracking or analytics

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [jsQR](https://github.com/cozmo/jsQR) for QR code detection
- [Heroicons](https://heroicons.com/) for UI icons

## Author

elkolorado - [@elkolorado](https://github.com/elkolorado)

## Support

If you found this project helpful, please consider:
- Giving it a ⭐️ on GitHub
- Sharing it with others