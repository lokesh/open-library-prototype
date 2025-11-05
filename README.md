# Open Library Design Vision

A minimal web app built with Lit web components and Vite, inspired by Open Library.

## Features

- **Homepage** - Welcome page with quick action buttons
- **Sign Up** - User registration form with new ol-input and ol-field components
- **Add a Book** - Form to submit new books to the library
- **Trending Books** - Display of currently popular books
- **Heading Demo** - Showcase of the ol-heading component with various sizes
- **Input Demo** - Comprehensive demo of ol-input and ol-field components

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
├── heading-demo.html   # Heading component demo
├── input-demo.html     # Input & field component demo
├── src/
│   └── components/
│       ├── index.js         # Component registry
│       ├── ol-button.js     # Button component
│       ├── ol-heading.js    # Heading component
│       ├── ol-input.js      # Form input component (FACE)
│       ├── ol-field.js      # Field wrapper component
│       └── ol-theme-toggle.js  # Theme toggle component
├── styles/
│   ├── index.css        # Main styles entry point
│   ├── vars.css         # Design tokens (Tier 1: primitives)
│   ├── semantic.css     # Semantic tokens (Tier 2)
│   ├── components.css   # Component tokens (Tier 3)
│   └── primitives.css   # Base element styles
├── package.json        # Dependencies and scripts
├── vite.config.js      # Vite configuration for multi-page app
└── README.md           # This file
```

## Web Components

This project uses Lit-based web components for reusable UI elements. All components follow Open Library's design tokens and support light/dark themes.

### ol-button

A reusable button component with form submission support.

**Attributes:**
- `type` - Button type: `button` (default), `submit`, or `reset`

**Usage:**
```html
<ol-button type="submit">Submit Form</ol-button>
```

When `type="submit"`, the button will automatically submit its parent form.

### ol-heading

A flexible heading component that separates semantic HTML from visual appearance.

**Attributes:**
- `element` - The semantic HTML tag: `h1`, `h2`, `h3`, etc. (default: `h1`)
- `size` - The visual size: `display-1`, `display-2`, `display-3`, `title-1`, `title-2`, `title-3`, `title-4`, `title-5` (default: `title-1`)
- `icon` - Optional icon or emoji to display before the heading text

**Usage:**
```html
<ol-heading element="h1" size="display-2">Welcome</ol-heading>
<ol-heading element="h3" size="title-1" icon="📚">Books</ol-heading>
```

### ol-input

A low-level, form-associated input component (FACE) with shadow DOM. Handles native form semantics, focus delegation, and validation.

**Attributes:**
- `type` - Input type: `text`, `email`, `password`, `url`, `number`, `date`, etc. (default: `text`)
- `name` - Form field name for submission
- `value` - Current input value
- `placeholder` - Placeholder text
- `disabled` - Disables the input
- `required` - Marks field as required
- `readonly` - Makes field read-only
- `autocomplete` - Autocomplete hint

**Usage:**
```html
<ol-input name="email" type="email" placeholder="you@example.com" required></ol-input>
```

**Form Integration:**
The component implements `ElementInternals` API and properly participates in form submission and validation.

### ol-field

A higher-level field component that composes label, hint, error message, and an input. Handles proper accessibility linking with `aria-labelledby` and `aria-describedby`.

**Attributes:**
- `label` - Label text for the field
- `hint` - Optional hint text shown below the label
- `error` - Error message (shows error state when present)
- `required` - Shows required indicator (*)

**Usage:**
```html
<ol-field label="Email" hint="We'll never share your email" required>
  <ol-input name="email" type="email"></ol-input>
</ol-field>

<ol-field label="Password" error="Password must be at least 8 characters" required>
  <ol-input name="password" type="password"></ol-input>
</ol-field>
```

**Accessibility:**
The field component automatically handles:
- `aria-labelledby` - Links input to label
- `aria-describedby` - Links input to hint and error messages
- `aria-invalid` - Sets invalid state when error is present
- `role="alert"` - Announces errors to screen readers

### ol-theme-toggle

A theme toggle component that switches between light and dark modes.

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

