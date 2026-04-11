/**
 * CSV/TSV parser and provider-specific column mapping for book imports.
 * Supports Goodreads, StoryGraph, and LibraryThing export formats.
 */

const PROVIDERS = {
  goodreads: {
    separator: ',',
    columns: {
      title: 'Title',
      author: 'Author',
      isbn: 'ISBN',
      isbn13: 'ISBN13',
      rating: 'My Rating',
      dateRead: 'Date Read',
      shelf: 'Exclusive Shelf',
      review: 'My Review',
    },
    /** Goodreads wraps ISBNs in ="..." to prevent Excel mangling.
     *  After CSV quote-stripping, this becomes =VALUE, so handle both forms. */
    cleanValue(key, value) {
      if (key === 'isbn' || key === 'isbn13') {
        if (value.startsWith('="') && value.endsWith('"')) {
          return value.slice(2, -1);
        }
        if (value.startsWith('=')) {
          return value.slice(1);
        }
      }
      return value;
    },
  },
  storygraph: {
    separator: ',',
    columns: {
      title: 'Title',
      author: 'Authors',
      isbn: 'ISBN/UID',
      isbn13: null,
      rating: 'Star Rating',
      dateRead: 'Last Date Read',
      shelf: 'Read Status',
      review: 'Review',
    },
    cleanValue(_key, value) {
      return value;
    },
  },
  librarything: {
    separator: '\t',
    columns: {
      title: 'Title',
      author: 'Primary Author',
      isbn: 'ISBN',
      isbn13: null,
      rating: 'Rating',
      dateRead: 'Date Read',
      shelf: 'Collections',
      review: 'Review',
    },
    cleanValue(_key, value) {
      return value;
    },
  },
};

/**
 * Parse a row from a CSV/TSV, handling quoted fields with embedded separators and newlines.
 * Returns an array of field values.
 */
function parseRow(line, separator) {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === separator) {
      fields.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

/**
 * Split file text into rows, handling quoted fields that span multiple lines.
 */
function splitRows(text, separator) {
  const rows = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      current += ch;
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (current.trim()) rows.push(current);
      // skip \r\n
      if (ch === '\r' && i + 1 < text.length && text[i + 1] === '\n') i++;
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) rows.push(current);
  return rows;
}

/**
 * Parse an import file from a known provider.
 *
 * @param {File} file - The uploaded file
 * @param {string} source - Provider key: 'goodreads' | 'storygraph' | 'librarything'
 * @returns {Promise<{books: Array, stats: Object, errors: Array}>}
 */
export async function parseImportFile(file, source) {
  const provider = PROVIDERS[source];
  if (!provider) {
    return { books: [], stats: {}, errors: [{ row: 0, message: `Unknown source: ${source}` }] };
  }

  let text = await file.text();

  // Strip BOM
  if (text.charCodeAt(0) === 0xfeff) {
    text = text.slice(1);
  }

  const rows = splitRows(text, provider.separator);
  if (rows.length < 2) {
    return { books: [], stats: {}, errors: [{ row: 0, message: 'File appears to be empty or has no data rows.' }] };
  }

  // Parse header row to build column index
  const headerFields = parseRow(rows[0], provider.separator);
  const colIndex = {};
  for (const [normalizedKey, sourceCol] of Object.entries(provider.columns)) {
    if (sourceCol) {
      const idx = headerFields.findIndex(
        (h) => h.toLowerCase() === sourceCol.toLowerCase()
      );
      colIndex[normalizedKey] = idx;
    }
  }

  // Validate required columns
  if (colIndex.title === -1 || colIndex.title === undefined) {
    return {
      books: [],
      stats: {},
      errors: [{ row: 0, message: `Could not find a "Title" column. Are you sure this is a ${source} export?` }],
    };
  }

  const books = [];
  const errors = [];
  const shelfCounts = {};
  let withRatings = 0;
  let withReviews = 0;

  for (let i = 1; i < rows.length; i++) {
    const fields = parseRow(rows[i], provider.separator);

    const get = (key) => {
      const idx = colIndex[key];
      if (idx === undefined || idx === -1 || idx >= fields.length) return '';
      const raw = fields[idx];
      return provider.cleanValue(key, raw);
    };

    const title = get('title');
    if (!title) {
      errors.push({ row: i + 1, message: 'Missing title, skipped.' });
      continue;
    }

    const rating = parseFloat(get('rating')) || 0;
    const shelf = get('shelf') || 'to-read';
    const review = get('review');

    books.push({
      title,
      author: get('author'),
      isbn: get('isbn'),
      isbn13: get('isbn13'),
      rating: Math.min(Math.max(rating, 0), 5),
      dateRead: get('dateRead'),
      shelf,
      review,
    });

    shelfCounts[shelf] = (shelfCounts[shelf] || 0) + 1;
    if (rating > 0) withRatings++;
    if (review) withReviews++;
  }

  return {
    books,
    stats: {
      total: books.length,
      shelves: shelfCounts,
      withRatings,
      withReviews,
    },
    errors,
  };
}

/**
 * Validate that a file looks like it could be from the given source.
 * Returns an error message string, or null if valid.
 */
export function validateFile(file, source) {
  const provider = PROVIDERS[source];
  if (!provider) return `Unknown source: ${source}`;

  const ext = file.name.split('.').pop().toLowerCase();
  if (source === 'librarything') {
    if (ext !== 'tsv' && ext !== 'csv' && ext !== 'txt') {
      return 'LibraryThing exports are typically .tsv files. Please check your file.';
    }
  } else {
    if (ext !== 'csv') {
      return `${source} exports should be .csv files. This file appears to be .${ext}.`;
    }
  }

  if (file.size > 10 * 1024 * 1024) {
    return 'File is larger than 10MB. Please try a smaller export.';
  }

  if (file.size === 0) {
    return 'File appears to be empty.';
  }

  return null;
}

/** Get human-readable name for a provider */
export function getProviderName(source) {
  const names = { goodreads: 'Goodreads', storygraph: 'StoryGraph', librarything: 'LibraryThing' };
  return names[source] || source;
}
