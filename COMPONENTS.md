# Component Architecture

This document explains the architecture and design patterns used in the Open Library Design Vision component system.

## Design Principles

### 1. Separation of Concerns
We separate low-level form controls from high-level field composition:
- **Low-level components** (e.g., `ol-input`) handle native form behavior, validation, and value management
- **High-level components** (e.g., `ol-field`) handle layout, labeling, hints, errors, and accessibility

### 2. Form-Associated Custom Elements (FACE)
Our input components use the FACE API (`ElementInternals`) to:
- Participate natively in form submission
- Support native validation
- Work with FormData API
- Handle form reset and state restoration
- Enable proper focus delegation

### 3. Accessibility First
All components include proper ARIA attributes and semantic HTML:
- `aria-labelledby` - Links inputs to labels
- `aria-describedby` - Links inputs to hints and errors
- `aria-invalid` - Indicates validation state
- `role="alert"` - Announces errors to screen readers

### 4. Design Token Architecture
Components use a three-tier token system:
- **Tier 1: Primitives** - Raw values (colors, spacing, etc.)
- **Tier 2: Semantic** - Purpose-based tokens (text colors, backgrounds)
- **Tier 3: Component** - Component-specific tokens (input padding, button sizes)

## Component Patterns

### ol-input (Low-Level Input)

**Purpose:** Handle native form behavior, focus, and validation.

**Key Features:**
- Shadow DOM for style encapsulation
- FACE implementation for form participation
- Type support (text, email, password, url, number, date, etc.)
- Native validation support
- Focus delegation
- Event bubbling for input/change

**When to Use:**
- When you need a basic input with native form behavior
- When building custom field compositions
- When you need direct control over the input element

**Example:**
```html
<ol-input name="email" type="email" required></ol-input>
```

### ol-field (High-Level Field)

**Purpose:** Compose label, hint, error, and input with proper accessibility.

**Key Features:**
- Automatic ARIA attribute management
- Error state handling
- Required field indicator
- Hint text support
- Flexible layout with design tokens

**When to Use:**
- For most form fields in your application
- When you need labeled inputs with hints/errors
- When you want automatic accessibility

**Example:**
```html
<ol-field label="Email" hint="We'll never share your email" required>
  <ol-input name="email" type="email"></ol-input>
</ol-field>
```

### Component Composition

The `ol-field` + `ol-input` pattern allows for:

1. **Ergonomic API:** Simple, declarative markup
2. **Flexibility:** Can use `ol-input` standalone when needed
3. **Maintainability:** Separation of concerns
4. **Extensibility:** Easy to add new field types or input variants

## Form Integration

### Basic Form

```html
<form id="myForm">
  <ol-field label="Name" required>
    <ol-input name="name" type="text"></ol-input>
  </ol-field>

  <ol-field label="Email" required>
    <ol-input name="email" type="email"></ol-input>
  </ol-field>

  <ol-button type="submit">Submit</ol-button>
</form>
```

### Accessing Form Data

```javascript
const form = document.getElementById('myForm');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  console.log(data); // { name: "...", email: "..." }
});
```

### Dynamic Validation

```javascript
const emailField = document.querySelector('ol-field[label="Email"]');
const emailInput = emailField.querySelector('ol-input');

emailInput.addEventListener('input', () => {
  if (emailInput.value && !emailInput.value.includes('@')) {
    emailField.error = 'Please include an @ in the email address';
  } else {
    emailField.error = '';
  }
});
```

## Validation Patterns

### Native HTML5 Validation

The components support native HTML5 validation attributes:

```html
<ol-field label="Password" required>
  <ol-input
    name="password"
    type="password"
    required
    minlength="8"
  ></ol-input>
</ol-field>
```

### Custom Validation

```javascript
const passwordInput = document.querySelector('[name="password"]');
const confirmInput = document.querySelector('[name="confirm"]');
const confirmField = confirmInput.closest('ol-field');

confirmInput.addEventListener('input', () => {
  if (passwordInput.value !== confirmInput.value) {
    confirmField.error = 'Passwords do not match';
  } else {
    confirmField.error = '';
  }
});
```

## Styling

### Using Design Tokens

Components automatically use design tokens. You can customize them:

```css
:root {
  --input-padding-x: 16px;
  --input-padding-y: 12px;
  --input-font-size: 16px;
  --input-border-width: 2px;
  --input-focus-ring: 0 0 0 3px rgba(59, 130, 246, 0.2);
  --input-min-height: 44px;
}
```

### Dark Mode

Components automatically adapt to dark mode via the `data-theme` attribute:

```html
<body data-theme="dark">
  <!-- Components will use dark mode colors -->
</body>
```

## Best Practices

### 1. Always Use Labels

```html
<!-- Good -->
<ol-field label="Email">
  <ol-input name="email" type="email"></ol-input>
</ol-field>

<!-- Avoid -->
<ol-input name="email" type="email" placeholder="Email"></ol-input>
```

### 2. Provide Helpful Hints

```html
<ol-field
  label="Password"
  hint="Must be at least 8 characters"
  required
>
  <ol-input name="password" type="password"></ol-input>
</ol-field>
```

### 3. Show Validation Errors

```html
<ol-field
  label="Email"
  error="Please enter a valid email address"
>
  <ol-input name="email" type="email" value="invalid"></ol-input>
</ol-field>
```

### 4. Mark Required Fields

```html
<ol-field label="Email" required>
  <ol-input name="email" type="email" required></ol-input>
</ol-field>
```

### 5. Use Appropriate Input Types

```html
<!-- Email validation -->
<ol-input type="email" name="email"></ol-input>

<!-- Number input with mobile keyboard -->
<ol-input type="number" name="age"></ol-input>

<!-- Date picker -->
<ol-input type="date" name="birthday"></ol-input>

<!-- URL validation -->
<ol-input type="url" name="website"></ol-input>
```

## Accessibility Checklist

- ✅ All inputs have associated labels via `ol-field`
- ✅ Labels are properly linked with `aria-labelledby`
- ✅ Hints and errors are linked with `aria-describedby`
- ✅ Error states use `aria-invalid`
- ✅ Errors are announced with `role="alert"`
- ✅ Focus is properly delegated to native inputs
- ✅ Required fields are marked visually and semantically
- ✅ Components work with keyboard navigation
- ✅ Components work with screen readers

## Testing

### Manual Testing Checklist

1. **Keyboard Navigation**
   - Tab through fields
   - Submit with Enter key
   - Navigate with arrow keys (for select/radio)

2. **Screen Reader Testing**
   - Verify labels are announced
   - Verify hints are announced
   - Verify errors are announced
   - Verify required state is announced

3. **Form Submission**
   - Verify FormData includes all fields
   - Verify validation works
   - Verify form reset works

4. **Visual Testing**
   - Test in light and dark modes
   - Test with different viewport sizes
   - Test error states
   - Test disabled states

## Future Enhancements

Potential additions to the component system:

- `ol-textarea` - Multi-line text input
- `ol-select` - Native select wrapper
- `ol-checkbox` - Checkbox component
- `ol-radio` - Radio button component
- `ol-switch` - Toggle switch
- `ol-file-input` - File upload component
- `ol-input-group` - Grouped inputs (e.g., with icons or buttons)
- `ol-password-input` - Password input with show/hide toggle

## Resources

- [Form-Associated Custom Elements](https://web.dev/more-capable-form-controls/)
- [ElementInternals API](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals)
- [ARIA Best Practices for Forms](https://www.w3.org/WAI/ARIA/apg/patterns/)
- [Lit Documentation](https://lit.dev/)

