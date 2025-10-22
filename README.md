# String Analyzer API 🧪

## Overview
The String Analyzer API is a robust Node.js Express backend service designed to process and analyze textual data. It leverages Express.js for routing, `crypto` for SHA256 hashing, and `compromise` for natural language processing, offering advanced string analysis, storage, and retrieval functionalities.

## Features
*   **String Persistence**: Stores strings along with their calculated properties in memory.
*   **Comprehensive Analysis**: Automatically calculates string length, palindrome status, unique character count, word count, and character frequency.
*   **Secure Identification**: Generates a unique SHA256 hash for each string to ensure integrity and serve as an identifier.
*   **Flexible Retrieval**: Supports fetching all stored strings or a specific string by its original value.
*   **Advanced Filtering**: Enables searching for strings based on multiple criteria like palindrome status, length, word count, or character presence via query parameters.
*   **Natural Language Query**: Filters strings using intuitive natural language sentences, powered by the `compromise` NLP library.
*   **String Deletion**: Allows for removal of strings from the system.

## Technologies Used
| Technology         | Description                                                                 |
| :----------------- | :-------------------------------------------------------------------------- |
| **Node.js**        | JavaScript runtime for server-side execution.                               |
| **Express.js**     | Fast, unopinionated, minimalist web framework for Node.js.                  |
| **crypto**         | Node.js built-in module for cryptographic functionality (SHA256 hashing).   |
| **dotenv**         | Zero-dependency module that loads environment variables from a `.env` file. |
| **compromise**     | A JavaScript natural language processing (NLP) library for parsing text.    |
| **nodemon**        | Development utility that monitors for any changes in source and restarts.   |

## Getting Started

### Installation
To get this project up and running on your local machine, follow these steps:

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/pemzyj/string-analyzer.git
    cd Stage\ 1 
    ```

2.  **Install Dependencies**:
    Navigate into the project directory and install the necessary npm packages.
    ```bash
    npm install
    ```

3.  **Start the Development Server**:
    To run the application in development mode with `nodemon` for automatic restarts:
    ```bash
    npm run dev
    ```

4.  **Start the Production Server**:
    To run the application in production mode:
    ```bash
    npm start
    ```
    The API will be available at `http://0.0.0.0:[PORT]` (default is `8000`).

### Environment Variables
The project uses environment variables managed by `dotenv`. Create a `.env` file in the root directory of the project with the following variable:

-   `PORT`: The port number on which the Express server will listen.
    ```
    PORT=8000
    ```

## API Documentation

### Base URL
`http://localhost:8000` (or your configured `PORT`)

### Endpoints

#### POST /strings
Adds a new string to the system and calculates its properties.

**Request**:
```json
{
  "value": "string"
}
```
**Response**:
```json
{
  "id": "e4e941740b2e84d43e26487e8e50b925b44d34c114e9f7831d36d41870183b10",
  "value": "madam",
  "properties": {
    "length": 5,
    "is_palindrome": true,
    "unique_characters": 3,
    "word_count": 1,
    "sha256_hash": "e4e941740b2e84d43e26487e8e50b925b44d34c114e9f7831d36d41870183b10",
    "character_frequency_map": {
      "m": 2,
      "a": 2,
      "d": 1
    }
  },
  "created_at": "2023-10-27T10:00:00.000Z"
}
```
**Errors**:
-   `400 Bad Request`: String is missing.
    ```json
    { "error": "String is missing" }
    ```
-   `422 Unprocessable Entity`: Value provided is not a string.
    ```json
    { "error": "123 must be a string" }
    ```
-   `409 Conflict`: String already exists in the system.
    ```json
    { "error": "String already exists in system" }
    ```

#### GET /strings
Retrieves all stored strings or filters them based on query parameters.

**Request**:
Optional query parameters:
-   `is_palindrome`: `true` or `false`
-   `min_length`: Integer
-   `max_length`: Integer
-   `word_count`: Integer
-   `contains_character`: Single character

Example (no query parameters): `GET /strings`
Example (with query parameters): `GET /strings?is_palindrome=true&min_length=5&contains_character=a`

**Response**:
```json
{
  "data": [
    {
      "id": "e4e941740b2e84d43e26487e8e50b925b44d34c114e9f7831d36d41870183b10",
      "value": "madam",
      "properties": {
        "length": 5,
        "is_palindrome": true,
        "unique_characters": 3,
        "word_count": 1,
        "sha256_hash": "e4e941740b2e84d43e26487e8e50b925b44d34c114e9f7831d36d41870183b10",
        "character_frequency_map": {
          "m": 2, "a": 2, "d": 1
        }
      },
      "created_at": "2023-10-27T10:00:00.000Z"
    },
    {
      "id": "1d80327e52dd040b07b8b2e59e6c99c3cf0c17ae5107e38ee129188a87b1897d",
      "value": "hello world",
      "properties": {
        "length": 11,
        "is_palindrome": false,
        "unique_characters": 8,
        "word_count": 2,
        "sha256_hash": "1d80327e52dd040b07b8b2e59e6c99c3cf0c17ae5107e38ee129188a87b1897d",
        "character_frequency_map": {
          "h": 1, "e": 1, "l": 3, "o": 2, "w": 1, "r": 1, "d": 1
        }
      },
      "created_at": "2023-10-27T10:05:00.000Z"
    }
  ],
  "count": 2,
  "filters_applied": {
    "min_length": 5,
    "contains_character": "a"
  }
}
```
**Errors**:
-   `400 Bad Request`: Invalid query parameter values or types.
    ```json
    { "error": "Invalid query parameter values or types" }
    ```

#### GET /strings/filter-by-natural-language
Filters strings based on a natural language query.

**Request**:
Query parameter:
-   `query`: Natural language string (e.g., "strings that are palindromes and have two words", "strings longer than 5 letters")

Example: `GET /strings/filter-by-natural-language?query=strings that are palindromes`

**Response**:
```json
{
  "data": [
    {
      "id": "e4e941740b2e84d43e26487e8e50b925b44d34c114e9f7831d36d41870183b10",
      "value": "madam",
      "properties": {
        "length": 5,
        "is_palindrome": true,
        "unique_characters": 3,
        "word_count": 1,
        "sha256_hash": "e4e941740b2e84d43e26487e8e50b925b44d34c114e9f7831d36d41870183b10",
        "character_frequency_map": {
          "m": 2, "a": 2, "d": 1
        }
      },
      "created_at": "2023-10-27T10:00:00.000Z"
    }
  ],
  "count": 1,
  "interpreted_query": {
    "original": "strings that are palindromes",
    "parsed_filters": {
      "is_palindrome": true
    }
  }
}
```
**Errors**:
-   `400 Bad Request`: Missing natural language query.
    ```json
    { "error": "Missing natural language query" }
    ```
-   `400 Bad Request`: Unable to parse natural language query.
    ```json
    { "error": "Unable to parse natural language query" }
    ```
-   `422 Unprocessable Entity`: Query parsed but resulted in conflicting filters.
    ```json
    { "error": "Query parsed but resulted in conflicting filters" }
    ```

#### GET /strings/:string_value
Retrieves a single string by its original value's SHA256 hash. The `:string_value` in the path should be the *original string* itself, which the API then hashes to find the stored entry.

**Request**:
Path parameter: `string_value` (e.g., `madam`)

Example: `GET /strings/madam`

**Response**:
```json
{
  "id": "e4e941740b2e84d43e26487e8e50b925b44d34c114e9f7831d36d41870183b10",
  "value": "madam",
  "properties": {
    "length": 5,
    "is_palindrome": true,
    "unique_characters": 3,
    "word_count": 1,
    "sha256_hash": "e4e941740b2e84d43e26487e8e50b925b44d34c114e9f7831d36d41870183b10",
    "character_frequency_map": {
      "m": 2, "a": 2, "d": 1
    }
  },
  "created_at": "2023-10-27T10:00:00.000Z"
}
```
**Errors**:
-   `404 Not Found`: String doesn't exist in system.
    ```json
    { "error": "String doesn't exist in system" }
    ```

#### DELETE /strings/:string_value
Deletes a string from the system by its original value's SHA256 hash. The `:string_value` in the path should be the *original string* itself.

**Request**:
Path parameter: `string_value` (e.g., `madam`)

Example: `DELETE /strings/madam`

**Response**:
`204 No Content` (Successful deletion, no response body)

**Errors**:
-   `404 Not Found`: String doesn't exist in system.
    ```json
    { "error": "String doesn't exist in system" }
    ```

## Usage
Once the server is running, you can interact with the API using tools like `curl`, Postman, Insomnia, or any HTTP client.

1.  **Add a String**:
    ```bash
    curl -X POST -H "Content-Type: application/json" -d '{"value": "hello world"}' http://localhost:8000/strings
    ```

2.  **Retrieve All Strings**:
    ```bash
    curl http://localhost:8000/strings
    ```

3.  **Filter Strings by Properties**:
    ```bash
    curl 'http://localhost:8000/strings?is_palindrome=true&min_length=3'
    ```

4.  **Filter Strings with Natural Language**:
    ```bash
    curl 'http://localhost:8000/strings/filter-by-natural-language?query=show me words with one word'
    ```

5.  **Retrieve a Specific String**:
    ```bash
    curl http://localhost:8000/strings/madam
    ```

6.  **Delete a String**:
    ```bash
    curl -X DELETE http://localhost:8000/strings/madam
    ```

## Contributing
We welcome contributions to enhance the String Analyzer API! If you have ideas for new features, improvements, or bug fixes, please follow these guidelines:

*   **Fork the Repository**: Start by forking the project to your GitHub account.
*   **Create a New Branch**: Create a descriptive branch for your feature or bug fix (e.g., `feature/add-new-analysis`, `fix/palindrome-logic`).
*   **Write Clear Commits**: Ensure your commit messages are concise and informative.
*   **Submit a Pull Request**: Open a pull request against the `main` branch of this repository. Clearly describe your changes and the problem they solve.

## License
This project is licensed under the ISC License.

## Author Info
Developed by **Olamide**.

*   **LinkedIn**: [Your LinkedIn Profile]
*   **Twitter**: [Your Twitter Handle]

## Badges
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![NPM Dependencies](https://img.shields.io/david/pemzyj/string-analyzer.svg?style=for-the-badge)](https://david-dm.org/pemzyj/string-analyzer)

[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)