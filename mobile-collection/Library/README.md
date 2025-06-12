# Library 📚

**Library** is a simple Android application for tracking books in a personal library. It demonstrates the use of **SQLite** for local data storage and **RecyclerView** for dynamic list rendering. The app includes basic user and book management functionality using `User`, `Entity`, and `Book` classes.

## Features

- ➕ Add new books to your collection
- ✏️ Edit existing book details
- 🗑️ Delete books
- 📃 View books in a scrollable list with RecyclerView
- 💾 Persistent storage using SQLite

## Architecture

The app follows a basic layered structure:

- `User`: Represents application users (optional or extendable for login/multi-user support)
- `Entity`: Base class used for mapping common database fields
- `Book`: Represents individual book records, including fields like title, author, and page count

## Tech Stack

- 💻 Language: Java *(or Kotlin – update if necessary)*
- 🧱 Database: SQLite (using SQLiteOpenHelper)
- 📲 UI: RecyclerView, Buttons, EditText, etc.
<!-- - 🧩 Architecture: Simple MVC-inspired structure

## Database Schema

| Field      | Type     | Description           |
|------------|----------|-----------------------|
| `id`       | INTEGER  | Primary key (auto-increment) |
| `title`    | TEXT     | Title of the book     |
| `author`   | TEXT     | Author of the book    |
| `pages`    | INTEGER  | Number of pages       |

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/library.git -->
