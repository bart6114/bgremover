# Background Remover

**🔗 Live at: [bgremover.xyz](https://bgremover.xyz)**

A lightweight Single Page Application (SPA) that provides a web interface for [imgly's open-source background removal library](https://github.com/imgly/background-removal-js). Remove backgrounds from images directly in your browser without uploading to any server.

## What This Is

This is a web interface built around imgly's OSS background removal tool. Rather than building background removal from scratch, this SPA provides:

- 🎨 **Web Interface** - Frontend for imgly's background removal engine
- ⚡ **Browser-based** - No installation required, runs in your browser
- 🔒 **Client-side Processing** - Uses imgly's client-side processing (no server uploads)
- 🌓 **Dark Mode** - Light and dark theme options
- 📱 **Responsive** - Works on desktop and mobile devices
- 🎯 **Drag & Drop** - File upload via drag/drop or file picker
- 💾 **Download Results** - Save processed images locally

## Key Benefits

- **Lightweight SPA** - Small bundle size, fast loading
- **Built on proven OSS** - Uses imgly's established background removal library
- **No backend required** - Pure frontend solution using WebAssembly
- **Easy deployment** - Can be hosted on static hosting platforms

## Tech Stack

### Core Engine
- **[@imgly/background-removal-js](https://github.com/imgly/background-removal-js)** - The heavy lifting (AI-powered background removal)

### SPA Wrapper
- **React 19** - Frontend framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - CSS framework
- **Lucide React** - Icon library

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/bart6114/bgremover.git
cd bgremover
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deployment

This project is configured for deployment on Cloudflare Pages. Simply connect your GitHub repository to Cloudflare Pages and it will automatically build and deploy.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **[imgly/background-removal-js](https://github.com/imgly/background-removal-js)** - The core OSS library that powers this tool
- [Lucide](https://lucide.dev) - Icon library
- [Tailwind CSS](https://tailwindcss.com) - CSS framework
