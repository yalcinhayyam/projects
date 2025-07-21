package com.yalcinhayyam.library.data;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.SQLException;
import android.database.sqlite.SQLiteConstraintException;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.util.Log;

import com.yalcinhayyam.library.model.Book;
import com.yalcinhayyam.library.model.Entity;
import com.yalcinhayyam.library.model.User;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class DatabaseHelper extends SQLiteOpenHelper {
    private static final String TAG = "DatabaseHelper";
    private static final String DATABASE_NAME = "library.db";
    private static final int DATABASE_VERSION = 2; // Incremented version for new indexes

    // Table names
    private static final String TABLE_BOOKS = "books";
    private static final String TABLE_USERS = "users";
    private static final String TABLE_ENTITIES = "entities";

    // Common column
    private static final String COLUMN_ID = "id";

    // Books table columns
    private static final String COLUMN_BOOK_TITLE = "title";
    private static final String COLUMN_BOOK_PAGE_COUNT = "page_count";
    private static final String COLUMN_BOOK_AVAILABLE = "is_available";
    private static final String COLUMN_BOOK_IS_DELETED = "is_deleted";


    // Users table columns
    private static final String COLUMN_USER_NAME = "name";
    private static final String COLUMN_USER_STUDENT_NUMBER = "student_number";
    private static final String COLUMN_USER_IS_BANNED = "is_banned";

    // Entities table columns
    private static final String COLUMN_ENTITY_BOOK_ID = "book_id";
    private static final String COLUMN_ENTITY_USER_ID = "user_id";
    private static final String COLUMN_ENTITY_ISSUE_DATE = "issue_date";
    private static final String COLUMN_ENTITY_DUE_DATE = "due_date";
    private static final String COLUMN_ENTITY_RETURN_DATE = "return_date";
    private static final String COLUMN_ENTITY_IS_RETURNED = "is_returned";

    // Singleton instance
    private static DatabaseHelper instance;

    public static synchronized DatabaseHelper getInstance(Context context) {
        if (instance == null) {
            instance = new DatabaseHelper(context.getApplicationContext());
        }
        return instance;
    }

    private DatabaseHelper(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        createBooksTable(db);
        createUsersTable(db);
        createEntitiesTable(db);
        createIndexes(db);
    }

    private void createBooksTable(SQLiteDatabase db) {
        String CREATE_BOOKS_TABLE = "CREATE TABLE " + TABLE_BOOKS + "("
                + COLUMN_ID + " INTEGER PRIMARY KEY AUTOINCREMENT,"
                + COLUMN_BOOK_TITLE + " TEXT NOT NULL,"
                + COLUMN_BOOK_PAGE_COUNT + " INTEGER NOT NULL DEFAULT 0,"
                + COLUMN_BOOK_AVAILABLE + " INTEGER DEFAULT 1," // 1 = available, 0 = borrowed
                + COLUMN_BOOK_IS_DELETED + " INTEGER DEFAULT 0)";
        db.execSQL(CREATE_BOOKS_TABLE);
    }

    private void createUsersTable(SQLiteDatabase db) {
        String CREATE_USERS_TABLE = "CREATE TABLE " + TABLE_USERS + "("
                + COLUMN_ID + " INTEGER PRIMARY KEY AUTOINCREMENT,"
                + COLUMN_USER_NAME + " TEXT NOT NULL,"
                + COLUMN_USER_STUDENT_NUMBER + " TEXT UNIQUE,"
                + COLUMN_USER_IS_BANNED + " INTEGER DEFAULT 0)"; // 0 = not banned, 1 = banned
        db.execSQL(CREATE_USERS_TABLE);
    }

    private void createEntitiesTable(SQLiteDatabase db) {
        String CREATE_ENTITIES_TABLE = "CREATE TABLE " + TABLE_ENTITIES + "("
                + COLUMN_ID + " INTEGER PRIMARY KEY AUTOINCREMENT,"
                + COLUMN_ENTITY_BOOK_ID + " INTEGER NOT NULL,"
                + COLUMN_ENTITY_USER_ID + " INTEGER NOT NULL,"
                + COLUMN_ENTITY_ISSUE_DATE + " TEXT NOT NULL,"
                + COLUMN_ENTITY_DUE_DATE + " TEXT NOT NULL,"
                + COLUMN_ENTITY_RETURN_DATE + " TEXT,"
                + COLUMN_ENTITY_IS_RETURNED + " INTEGER DEFAULT 0,"
                + "FOREIGN KEY(" + COLUMN_ENTITY_BOOK_ID + ") REFERENCES " + TABLE_BOOKS + "(" + COLUMN_ID + ") ON DELETE CASCADE,"
                + "FOREIGN KEY(" + COLUMN_ENTITY_USER_ID + ") REFERENCES " + TABLE_USERS + "(" + COLUMN_ID + ") ON DELETE CASCADE)";
        db.execSQL(CREATE_ENTITIES_TABLE);
    }

    private void createIndexes(SQLiteDatabase db) {
        db.execSQL("CREATE INDEX idx_entities_book_id ON " + TABLE_ENTITIES + "(" + COLUMN_ENTITY_BOOK_ID + ")");
        db.execSQL("CREATE INDEX idx_entities_user_id ON " + TABLE_ENTITIES + "(" + COLUMN_ENTITY_USER_ID + ")");
        db.execSQL("CREATE INDEX idx_users_student_number ON " + TABLE_USERS + "(" + COLUMN_USER_STUDENT_NUMBER + ")");
        db.execSQL("CREATE INDEX idx_books_available ON " + TABLE_BOOKS + "(" + COLUMN_BOOK_AVAILABLE + ")");
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_BOOKS);
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_USERS);
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_ENTITIES);
        onCreate(db);
    }

    @Override
    public void onConfigure(SQLiteDatabase db) {
        super.onConfigure(db);
        db.setForeignKeyConstraintsEnabled(true);
    }

    // ==================== BOOK OPERATIONS ====================

    public long addBook(Book book) {
        SQLiteDatabase db = this.getWritableDatabase();
        ContentValues values = new ContentValues();
        values.put(COLUMN_BOOK_TITLE, book.getTitle());
        values.put(COLUMN_BOOK_PAGE_COUNT, book.getPageCount());

        try {
            return db.insertOrThrow(TABLE_BOOKS, null, values);
        } catch (SQLException e) {
            Log.e(TAG, "Error adding book", e);
            return -1;
        } 
    }

    public Book getBook(long id) {
        SQLiteDatabase db = this.getReadableDatabase();
        Book book = null;

        try (Cursor cursor = db.query(TABLE_BOOKS,
                new String[]{COLUMN_ID, COLUMN_BOOK_TITLE, COLUMN_BOOK_PAGE_COUNT, COLUMN_BOOK_AVAILABLE},
                COLUMN_ID + "=?",
                new String[]{String.valueOf(id)}, null, null, null)) {

            if (cursor != null && cursor.moveToFirst()) {
                book = new Book(
                        cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_ID)),
                        cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_BOOK_TITLE)),
                        cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_BOOK_PAGE_COUNT)));
                book.setAvailable(cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_BOOK_AVAILABLE)) == 1);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error getting book", e);
        } 

        return book;
    }

    public List<Book> getAllBooks() {
        List<Book> books = new ArrayList<>();
        SQLiteDatabase db = this.getReadableDatabase();

        try (Cursor cursor = db.query(TABLE_BOOKS,
                new String[]{COLUMN_ID, COLUMN_BOOK_TITLE, COLUMN_BOOK_PAGE_COUNT, COLUMN_BOOK_AVAILABLE},
                null, null, null, null, COLUMN_BOOK_TITLE + " ASC")) {

            if (cursor != null && cursor.moveToFirst()) {
                do {
                    var isDeleted = cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_BOOK_IS_DELETED));
                    if(isDeleted == 1) {
                        continue;
                    }
                    Book book = new Book(
                            cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_ID)),
                            cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_BOOK_TITLE)),
                            cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_BOOK_PAGE_COUNT)));
                    book.setAvailable(cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_BOOK_AVAILABLE)) == 1);
                    books.add(book);
                } while (cursor.moveToNext());
            }
        } catch (Exception e) {
            Log.e(TAG, "Error getting all books", e);
        }

        return books;
    }

    public int updateBook(Book book) {
        SQLiteDatabase db = this.getWritableDatabase();
        ContentValues values = new ContentValues();
        values.put(COLUMN_BOOK_TITLE, book.getTitle());
        values.put(COLUMN_BOOK_PAGE_COUNT, book.getPageCount());
        values.put(COLUMN_BOOK_AVAILABLE, book.isAvailable() ? 1 : 0);

        try {
            return db.update(TABLE_BOOKS, values, COLUMN_ID + " = ?",
                    new String[]{String.valueOf(book.getId())});
        } catch (Exception e) {
            Log.e(TAG, "Error getting user", e);
            return 0;
        }
    }

    public int removeBook(long bookId) {
        SQLiteDatabase db = this.getWritableDatabase();
        try {
            return db.delete(TABLE_BOOKS, COLUMN_ID + " = ?",
                    new String[]{String.valueOf(bookId)});
        }
        catch (Exception e) {
            Log.e(TAG, "Error getting user", e);
            return 0;
        }
    }

    public int deleteBook(long bookId) {
        SQLiteDatabase db = this.getWritableDatabase();
        ContentValues values = new ContentValues();
        values.put(COLUMN_BOOK_IS_DELETED, 1); // Mark as deleted
        values.put(COLUMN_BOOK_AVAILABLE, 0);  // Also mark as unavailable

        try {
            return db.update(TABLE_BOOKS, values,
                    COLUMN_ID + " = ? AND " + COLUMN_BOOK_IS_DELETED + " = 0",
                    new String[]{String.valueOf(bookId)});
        } catch (Exception e) {
            Log.e(TAG, "Error soft deleting book", e);
            return 0;
        }
    }

    // ==================== USER OPERATIONS ====================

    public long addUser(User user) {
        SQLiteDatabase db = this.getWritableDatabase();
        ContentValues values = new ContentValues();
        values.put(COLUMN_USER_NAME, user.getName());
        values.put(COLUMN_USER_STUDENT_NUMBER, user.getStudentNumber());
        values.put(COLUMN_USER_IS_BANNED, user.isBanned() ? 1 : 0);

        try {
            return db.insertOrThrow(TABLE_USERS, null, values);
        } catch (SQLiteConstraintException e) {
            Log.e(TAG, "Student number already exists", e);
            return -1;
        } 
    }

    public User getUser(long id) {
        SQLiteDatabase db = this.getReadableDatabase();
        User user = null;

        try (Cursor cursor = db.query(TABLE_USERS,
                new String[]{COLUMN_ID, COLUMN_USER_NAME, COLUMN_USER_STUDENT_NUMBER, COLUMN_USER_IS_BANNED},
                COLUMN_ID + "=?",
                new String[]{String.valueOf(id)}, null, null, null)) {

            if (cursor != null && cursor.moveToFirst()) {
                user = new User(
                        cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_ID)),
                        cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_USER_NAME)),
                        cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_USER_STUDENT_NUMBER)),
                        cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_USER_IS_BANNED)) == 1);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error getting user", e);
        } 

        return user;
    }

    public List<User> getAllUsers() {
        List<User> users = new ArrayList<>();
        SQLiteDatabase db = this.getReadableDatabase();

        try (Cursor cursor = db.query(TABLE_USERS,
                new String[]{COLUMN_ID, COLUMN_USER_NAME, COLUMN_USER_STUDENT_NUMBER, COLUMN_USER_IS_BANNED},
                null, null, null, null, COLUMN_USER_NAME + " ASC")) {

            if (cursor != null && cursor.moveToFirst()) {
                do {
                    User user = new User(
                            cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_ID)),
                            cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_USER_NAME)),
                            cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_USER_STUDENT_NUMBER)),
                            cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_USER_IS_BANNED)) == 1);
                    users.add(user);
                } while (cursor.moveToNext());
            }
        } catch (Exception e) {
            Log.e(TAG, "Error getting all users", e);
        } 

        return users;
    }

    public int updateUser(User user) {
        SQLiteDatabase db = this.getWritableDatabase();
        ContentValues values = new ContentValues();
        values.put(COLUMN_USER_NAME, user.getName());
        values.put(COLUMN_USER_STUDENT_NUMBER, user.getStudentNumber());
        values.put(COLUMN_USER_IS_BANNED, user.isBanned() ? 1 : 0);

        try {
            return db.update(TABLE_USERS, values, COLUMN_ID + " = ?",
                    new String[]{String.valueOf(user.getId())});
        } catch (Exception e) {
            Log.e(TAG, "Error getting user", e);
            return 0;
        }
    }

    public int deleteUser(long userId) {
        SQLiteDatabase db = this.getWritableDatabase();
        try {
            return db.delete(TABLE_USERS, COLUMN_ID + " = ?",
                    new String[]{String.valueOf(userId)});
        } catch (Exception e) {
            Log.e(TAG, "Error getting user", e);
            return 0;
        }
    }

    public User getUserByStudentNumber(String studentNumber) {
        SQLiteDatabase db = this.getReadableDatabase();
        User user = null;

        try (Cursor cursor = db.query(TABLE_USERS,
                new String[]{COLUMN_ID, COLUMN_USER_NAME, COLUMN_USER_STUDENT_NUMBER, COLUMN_USER_IS_BANNED},
                COLUMN_USER_STUDENT_NUMBER + "=?",
                new String[]{studentNumber}, null, null, null)) {

            if (cursor != null && cursor.moveToFirst()) {
                user = new User(
                        cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_ID)),
                        cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_USER_NAME)),
                        cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_USER_STUDENT_NUMBER)),
                        cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_USER_IS_BANNED)) == 1);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error getting user by student number", e);
        } 

        return user;
    }

    public boolean toggleUserBan(long userId, boolean ban) {
        SQLiteDatabase db = this.getWritableDatabase();
        ContentValues values = new ContentValues();
        values.put(COLUMN_USER_IS_BANNED, ban ? 1 : 0);

        try {
            int rowsAffected = db.update(TABLE_USERS, values, COLUMN_ID + "=?",
                    new String[]{String.valueOf(userId)});
            return rowsAffected > 0;
        } catch (Exception e) {
            Log.e(TAG, "Error getting user", e);
            return false;
        }
    }

    // ==================== ENTITY (LENDING) OPERATIONS ====================

    public long addEntity(Entity entity) {
        SQLiteDatabase db = this.getWritableDatabase();
        ContentValues values = new ContentValues();
        values.put(COLUMN_ENTITY_BOOK_ID, entity.getBookId());
        values.put(COLUMN_ENTITY_USER_ID, entity.getUserId());
        values.put(COLUMN_ENTITY_ISSUE_DATE, entity.getIssueDate());
        values.put(COLUMN_ENTITY_DUE_DATE, entity.getDueDate());
        values.put(COLUMN_ENTITY_IS_RETURNED, entity.isReturned() ? 1 : 0);

        if (entity.isReturned()) {
            values.put(COLUMN_ENTITY_RETURN_DATE, entity.getReturnDate());
        }

        try {
            return db.insertOrThrow(TABLE_ENTITIES, null, values);
        } catch (SQLException e) {
            Log.e(TAG, "Error adding entity", e);
            return -1;
        } 
    }

    public Entity getEntity(long id) {
        SQLiteDatabase db = this.getReadableDatabase();
        Entity entity = null;

        try (Cursor cursor = db.query(TABLE_ENTITIES,
                new String[]{COLUMN_ID, COLUMN_ENTITY_BOOK_ID, COLUMN_ENTITY_USER_ID,
                        COLUMN_ENTITY_ISSUE_DATE, COLUMN_ENTITY_DUE_DATE,
                        COLUMN_ENTITY_RETURN_DATE, COLUMN_ENTITY_IS_RETURNED},
                COLUMN_ID + "=?",
                new String[]{String.valueOf(id)}, null, null, null)) {

            if (cursor != null && cursor.moveToFirst()) {
                entity = new Entity(
                        cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_ID)),
                        cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_ENTITY_BOOK_ID)),
                        cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_ENTITY_USER_ID)),
                        cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_ENTITY_ISSUE_DATE)),
                        cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_ENTITY_DUE_DATE)),
                        cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_ENTITY_IS_RETURNED)) == 1);
                entity.setReturnDate(cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_ENTITY_RETURN_DATE)));
            }
        } catch (Exception e) {
            Log.e(TAG, "Error getting entity", e);
        } 

        return entity;
    }

    public List<Entity> getAllEntities() {
        List<Entity> entities = new ArrayList<>();
        SQLiteDatabase db = this.getReadableDatabase();

        try (Cursor cursor = db.query(TABLE_ENTITIES,
                new String[]{COLUMN_ID, COLUMN_ENTITY_BOOK_ID, COLUMN_ENTITY_USER_ID,
                        COLUMN_ENTITY_ISSUE_DATE, COLUMN_ENTITY_DUE_DATE,
                        COLUMN_ENTITY_RETURN_DATE, COLUMN_ENTITY_IS_RETURNED},
                null, null, null, null, COLUMN_ENTITY_ISSUE_DATE + " DESC")) {

            if (cursor != null && cursor.moveToFirst()) {
                do {
                    Entity entity = new Entity(
                            cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_ID)),
                            cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_ENTITY_BOOK_ID)),
                            cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_ENTITY_USER_ID)),
                            cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_ENTITY_ISSUE_DATE)),
                            cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_ENTITY_DUE_DATE)),
                            cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_ENTITY_IS_RETURNED)) == 1);
                    entity.setReturnDate(cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_ENTITY_RETURN_DATE)));
                    entities.add(entity);
                } while (cursor.moveToNext());
            }
        } catch (Exception e) {
            Log.e(TAG, "Error getting all entities", e);
        } 

        return entities;
    }

    public int updateEntity(Entity entity) {
        SQLiteDatabase db = this.getWritableDatabase();
        ContentValues values = new ContentValues();
        values.put(COLUMN_ENTITY_BOOK_ID, entity.getBookId());
        values.put(COLUMN_ENTITY_USER_ID, entity.getUserId());
        values.put(COLUMN_ENTITY_ISSUE_DATE, entity.getIssueDate());
        values.put(COLUMN_ENTITY_DUE_DATE, entity.getDueDate());
        values.put(COLUMN_ENTITY_IS_RETURNED, entity.isReturned() ? 1 : 0);
        values.put(COLUMN_ENTITY_RETURN_DATE, entity.getReturnDate());

        try {
            return db.update(TABLE_ENTITIES, values, COLUMN_ID + " = ?",
                    new String[]{String.valueOf(entity.getId())});
        } catch (Exception e) {
            Log.e(TAG, "Error getting user", e);
            return 0;
        }
    }

    public int deleteEntity(long entityId) {
        SQLiteDatabase db = this.getWritableDatabase();
        try {
            return db.delete(TABLE_ENTITIES, COLUMN_ID + " = ?",
                    new String[]{String.valueOf(entityId)});
        }
        catch (Exception e) {
            Log.e(TAG, "Error getting user", e);
            return 0;
        }
    }

    // ==================== LIBRARY OPERATIONS ====================

    public boolean borrowBook(long bookId, long userId, String dueDate) {
        SQLiteDatabase db = this.getWritableDatabase();
        db.beginTransaction();

        try {
            // Check if book is available
            if (isBookBorrowed(bookId)) {
                return false;
            }

            // Check if user is banned
            User user = getUser(userId);
            if (user == null || user.isBanned()) {
                return false;
            }

            // Create new lending record
            String currentDate = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(new Date());
            ContentValues values = new ContentValues();
            values.put(COLUMN_ENTITY_BOOK_ID, bookId);
            values.put(COLUMN_ENTITY_USER_ID, userId);
            values.put(COLUMN_ENTITY_ISSUE_DATE, currentDate);
            values.put(COLUMN_ENTITY_DUE_DATE, dueDate);
            values.put(COLUMN_ENTITY_IS_RETURNED, 0);

            long result = db.insert(TABLE_ENTITIES, null, values);
            if (result == -1) {
                return false;
            }

            // Mark book as unavailable
            ContentValues bookValues = new ContentValues();
            bookValues.put(COLUMN_BOOK_AVAILABLE, 0);
            int updateResult = db.update(TABLE_BOOKS, bookValues, COLUMN_ID + " = ?",
                    new String[]{String.valueOf(bookId)});

            if (updateResult <= 0) {
                return false;
            }

            db.setTransactionSuccessful();
            return true;
        } catch (Exception e) {
            Log.e(TAG, "Error borrowing book", e);
            return false;
        } finally {
            db.endTransaction();
            db.close();
        }
    }

    public boolean returnBook(long bookId) {
        SQLiteDatabase db = this.getWritableDatabase();
        db.beginTransaction();

        try {
            // Get the active lending record
            Entity activeLending = getActiveLendingForBook(bookId);
            if (activeLending == null) {
                return false;
            }

            // Update the lending record
            String returnDate = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(new Date());
            ContentValues values = new ContentValues();
            values.put(COLUMN_ENTITY_IS_RETURNED, 1);
            values.put(COLUMN_ENTITY_RETURN_DATE, returnDate);

            int updateResult = db.update(TABLE_ENTITIES, values, COLUMN_ID + " = ?",
                    new String[]{String.valueOf(activeLending.getId())});

            if (updateResult <= 0) {
                return false;
            }

            // Mark book as available
            ContentValues bookValues = new ContentValues();
            bookValues.put(COLUMN_BOOK_AVAILABLE, 1);
            updateResult = db.update(TABLE_BOOKS, bookValues, COLUMN_ID + " = ?",
                    new String[]{String.valueOf(bookId)});

            if (updateResult <= 0) {
                return false;
            }

            db.setTransactionSuccessful();
            return true;
        } catch (Exception e) {
            Log.e(TAG, "Error returning book", e);
            return false;
        } finally {
            db.endTransaction();
            db.close();
        }
    }

    public boolean isBookBorrowed(long bookId) {
        SQLiteDatabase db = this.getReadableDatabase();
        boolean isBorrowed = false;

        try (Cursor cursor = db.query(TABLE_ENTITIES,
                new String[]{COLUMN_ID},
                COLUMN_ENTITY_BOOK_ID + " = ? AND " + COLUMN_ENTITY_IS_RETURNED + " = 0",
                new String[]{String.valueOf(bookId)},
                null, null, null)) {

            isBorrowed = cursor != null && cursor.getCount() > 0;
        } catch (Exception e) {
            Log.e(TAG, "Error checking if book is borrowed", e);
        } 

        return isBorrowed;
    }

    public Entity getActiveLendingForBook(long bookId) {
        SQLiteDatabase db = this.getReadableDatabase();
        Entity entity = null;

        try (Cursor cursor = db.query(TABLE_ENTITIES,
                new String[]{COLUMN_ID, COLUMN_ENTITY_BOOK_ID, COLUMN_ENTITY_USER_ID,
                        COLUMN_ENTITY_ISSUE_DATE, COLUMN_ENTITY_DUE_DATE,
                        COLUMN_ENTITY_RETURN_DATE, COLUMN_ENTITY_IS_RETURNED},
                COLUMN_ENTITY_BOOK_ID + " = ? AND " + COLUMN_ENTITY_IS_RETURNED + " = 0",
                new String[]{String.valueOf(bookId)},
                null, null, COLUMN_ENTITY_ISSUE_DATE + " DESC", "1")) {

            if (cursor != null && cursor.moveToFirst()) {
                entity = new Entity(
                        cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_ID)),
                        cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_ENTITY_BOOK_ID)),
                        cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_ENTITY_USER_ID)),
                        cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_ENTITY_ISSUE_DATE)),
                        cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_ENTITY_DUE_DATE)),
                        cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_ENTITY_IS_RETURNED)) == 1);
                entity.setReturnDate(cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_ENTITY_RETURN_DATE)));
            }
        } catch (Exception e) {
            Log.e(TAG, "Error getting active lending for book", e);
        } 

        return entity;
    }

    public User getBookBorrower(long bookId) {
        Entity activeLending = getActiveLendingForBook(bookId);
        if (activeLending == null) {
            return null;
        }
        return getUser(activeLending.getUserId());
    }

    public List<Entity> getUserLendingHistory(long userId) {
        List<Entity> entities = new ArrayList<>();
        SQLiteDatabase db = this.getReadableDatabase();

        try (Cursor cursor = db.query(TABLE_ENTITIES,
                new String[]{COLUMN_ID, COLUMN_ENTITY_BOOK_ID, COLUMN_ENTITY_USER_ID,
                        COLUMN_ENTITY_ISSUE_DATE, COLUMN_ENTITY_DUE_DATE,
                        COLUMN_ENTITY_RETURN_DATE, COLUMN_ENTITY_IS_RETURNED},
                COLUMN_ENTITY_USER_ID + " = ?",
                new String[]{String.valueOf(userId)},
                null, null, COLUMN_ENTITY_ISSUE_DATE + " DESC")) {

            if (cursor != null && cursor.moveToFirst()) {
                do {
                    Entity entity = new Entity(
                            cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_ID)),
                            cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_ENTITY_BOOK_ID)),
                            cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_ENTITY_USER_ID)),
                            cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_ENTITY_ISSUE_DATE)),
                            cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_ENTITY_DUE_DATE)),
                            cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_ENTITY_IS_RETURNED)) == 1);
                    entity.setReturnDate(cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_ENTITY_RETURN_DATE)));
                    entities.add(entity);
                } while (cursor.moveToNext());
            }
        } catch (Exception e) {
            Log.e(TAG, "Error getting user lending history", e);
        } 

        return entities;
    }

    public List<Book> getBorrowedBooksByUser(long userId) {
        List<Book> books = new ArrayList<>();
        SQLiteDatabase db = this.getReadableDatabase();

        String query = "SELECT b.* FROM " + TABLE_BOOKS + " b " +
                "INNER JOIN " + TABLE_ENTITIES + " e ON b." + COLUMN_ID + " = e." + COLUMN_ENTITY_BOOK_ID + " " +
                "WHERE e." + COLUMN_ENTITY_USER_ID + " = ? AND e." + COLUMN_ENTITY_IS_RETURNED + " = 0";

        try (Cursor cursor = db.rawQuery(query, new String[]{String.valueOf(userId)})) {
            if (cursor != null && cursor.moveToFirst()) {
                do {
                    Book book = new Book(
                            cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_ID)),
                            cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_BOOK_TITLE)),
                            cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_BOOK_PAGE_COUNT)));
                    book.setAvailable(cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_BOOK_AVAILABLE)) == 1);
                    books.add(book);
                } while (cursor.moveToNext());
            }
        } catch (Exception e) {
            Log.e(TAG, "Error getting borrowed books by user", e);
        } 

        return books;
    }
}