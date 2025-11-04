# Open Library Design Vision

A minimal web app built with Lit web components and Vite, inspired by Open Library.

## Features

- **Homepage** - Welcome page with quick action buttons
- **Sign Up** - User registration form
- **Add a Book** - Form to submit new books to the library
- **Trending Books** - Display of currently popular books

## Tech Stack

- **Vite** - Fast build tool and dev server
- **Lit** - Lightweight web components library
- **Vanilla HTML/CSS** - Minimal, semantic markup

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/lokesh/open-library-design-vision.git
cd open-library-design-vision
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to the URL shown in the terminal (typically `http://localhost:5173`)

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
/
├── index.html          # Homepage
├── signup.html         # Sign up page
├── add-book.html       # Add book form page
├── trending.html       # Trending books page
├── src/
│   └── components/
│       └── app-button.js  # Reusable button web component
├── styles.css          # Global styles
├── package.json        # Dependencies and scripts
├── vite.config.js      # Vite configuration for multi-page app
└── README.md           # This file
```

## Web Components

### app-button

A reusable button component with form submission support.

**Attributes:**
- `type` - Button type: `button` (default), `submit`, or `reset`

**Usage:**
```html
<app-button type="submit">Submit Form</app-button>
```

When `type="submit"`, the button will automatically submit its parent form.

## GitHub Setup

To connect this project to your GitHub repository:

1. Create a new repository on GitHub at https://github.com/lokesh/open-library-design-vision

2. Connect your local repository:
```bash
git remote add origin https://github.com/lokesh/open-library-design-vision.git
git branch -M main
git push -u origin main
```

## License

MIT

## Author

Lokesh Dhakar - [@lokesh](https://github.com/lokesh)

