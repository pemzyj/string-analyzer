import express, { urlencoded } from 'express';
import crypto from 'crypto';
import 'dotenv/config';
import nlp from 'compromise';


const app = express();
app.use(express.json());
app.use(urlencoded({ extended: true }));

const PORT = process.env.PORT;

// Helper functions
function isPalindrome(str) {
  const word = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  const reversedWord = word.split('').reverse().join('');
  return word === reversedWord;
}

function getSHA256Hash(message) {
  return crypto.createHash('sha256').update(message).digest('hex');
}

function getCharacterFrequencyMap(str) {
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  const map = {};
  for (const char of cleaned) {
    map[char] = (map[char] || 0) + 1;
  }
  return map;
}

function uniqueCharacters(str) {
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  const uniqueChars = new Set(cleaned);
  return uniqueChars.size;
}

const storedString = [];


app.get('/strings', (req, res) => {
  res.status(200).json(storedString);
})

app.post('/strings', (req, res) => {
  const { value } = req.body;

  if (!value) {
    return res.status(400).json({ error: 'String is missing' });
  }

  if (typeof value !== 'string') {
    return res.status(422).json({ error: `${value} must be a string` });
  }

  const sha256_hash = getSHA256Hash(value);
  const existingString = storedString.find(item => item.id === sha256_hash);

  if (existingString) {
    return res.status(409).json({ error: 'String already exists in system' });
  }

  const properties = {
    length: value.length,
    is_palindrome: isPalindrome(value),
    unique_characters: uniqueCharacters(value),
    word_count: value.trim().split(/\s+/).length,
    sha256_hash: sha256_hash,
    character_frequency_map: getCharacterFrequencyMap(value)
  };

  const created_at = new Date().toISOString();
  const data = {
    id: sha256_hash,
    value,
    properties,
    created_at
  };

  storedString.push(data);
  return res.status(201).json(data);
});

app.get('/strings/:string_value', (req, res) => {
    const string_value = req.params.string_value;
    const sha256_hash = getSHA256Hash(string_value);
    const found = storedString.find(item => item.id === sha256_hash);
    if (!found) {
        return res.status(404).json({error: 'String doesn\'t exist in system'});
    }
    return res.status(200).json(found);
})

app.get('/strings', (req, res) => {
  
    const { is_palindrome, min_length, max_length, word_count, contains_character } = req.query;
    let results = storedString;

    
    if (
      (is_palindrome && !['true', 'false'].includes(is_palindrome)) ||
      (min_length && isNaN(min_length)) ||
      (max_length && isNaN(max_length)) ||
      (word_count && isNaN(word_count)) ||
      (contains_character && (contains_character.length !== 1))
    ) {
      return res.status(400).json({ error: 'Invalid query parameter values or types' });
    }

    
    if (is_palindrome !== undefined) {
      const isTrue = is_palindrome === 'true';
      results = results.filter(item => item.properties.is_palindrome === isTrue);
    }

    if (min_length !== undefined) {
      results = results.filter(item => item.properties.length >= parseInt(min_length));
    }

    if (max_length !== undefined) {
      results = results.filter(item => item.properties.length <= parseInt(max_length));
    }

    if (word_count !== undefined) {
      results = results.filter(item => item.properties.word_count === parseInt(word_count));
    }

    if (contains_character !== undefined) {
      const char = contains_character.toLowerCase();
      results = results.filter(item => item.value.toLowerCase().includes(char));
    }

    
    const filters_applied = {};
    if (is_palindrome !== undefined) filters_applied.is_palindrome = is_palindrome === 'true';
    if (min_length !== undefined) filters_applied.min_length = parseInt(min_length);
    if (max_length !== undefined) filters_applied.max_length = parseInt(max_length);
    if (word_count !== undefined) filters_applied.word_count = parseInt(word_count);
    if (contains_character !== undefined) filters_applied.contains_character = contains_character;

    
    res.status(200).json({
      data: results,
      count: results.length,
      filters_applied
    });
});

app.get('/strings/filter-by-natural-language', (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: 'Missing natural language query' });
  }

  const doc = nlp(query.toLowerCase().trim());
  const terms = doc.terms().out('array');
  const numbers = doc.numbers().toNumber().out('array');
  const filters = {};

  // --- Palindrome detection ---
  if (doc.has('palindrome') || doc.has('palindromic')) {
    filters.is_palindrome = true;
  }

  // --- Word count detection (single word, two words, etc.) ---
  if (doc.has('single word')) {
    filters.word_count = 1;
  } else if (numbers.length && doc.has('word')) {
    filters.word_count = parseInt(numbers[0]);
  }

  // --- Character length detection ---
  if (doc.has('longer than') && numbers.length) {
    filters.min_length = numbers[0] + 1;
  }
  if (doc.has('shorter than') && numbers.length) {
    filters.max_length = numbers[0] - 1;
  }

  // --- Contains letter detection ---
  const letterMatch = query.match(/letter\s+([a-z])/i);
  if (letterMatch) {
    filters.contains_character = letterMatch[1].toLowerCase();
  }

  // --- “First vowel” heuristic ---
  if (doc.has('first vowel')) {
    filters.contains_character = 'a';
  }

  // --- Error handling for no parsed filters ---
  if (Object.keys(filters).length === 0) {
    return res.status(400).json({ error: 'Unable to parse natural language query' });
  }

  // --- Apply parsed filters (reuse your existing logic here) ---
  let results = storedString;

  if (filters.is_palindrome !== undefined) {
    results = results.filter(item => item.properties.is_palindrome === filters.is_palindrome);
  }
  if (filters.word_count !== undefined) {
    results = results.filter(item => item.properties.word_count === filters.word_count);
  }
  if (filters.min_length !== undefined) {
    results = results.filter(item => item.properties.length >= filters.min_length);
  }
  if (filters.max_length !== undefined) {
    results = results.filter(item => item.properties.length <= filters.max_length);
  }
  if (filters.contains_character !== undefined) {
    const char = filters.contains_character.toLowerCase();
    results = results.filter(item => item.value.toLowerCase().includes(char));
  }

  if (filters.min_length && filters.max_length && filters.min_length > filters.max_length) {
    return res.status(422).json({ error: 'Query parsed but resulted in conflicting filters' });
  }

  res.status(200).json({
    data: results,
    count: results.length,
    interpreted_query: {
      original: query,
      parsed_filters: filters
    }
  });
});





app.delete('/strings/:string_value', (req, res) => {
    const string_value = req.params.string_value;
    const sha256_hash = getSHA256Hash(string_value);
    const found = storedString.findIndex(item => item.id === sha256_hash);
    if (found === -1) {
        return res.status(404).json({error: 'String doesn\'t exist in system'});
    }
    storedString.splice(found, 1);
    res.status(204).end();
})


app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
