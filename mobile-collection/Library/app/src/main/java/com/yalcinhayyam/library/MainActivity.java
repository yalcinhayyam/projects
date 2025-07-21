package com.yalcinhayyam.library;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.yalcinhayyam.library.util.ToastHelper;
import com.yalcinhayyam.library.view.AddBookActivity;
import com.yalcinhayyam.library.view.BookDetailActivity;
import com.yalcinhayyam.library.view.EditBookActivity;
import com.yalcinhayyam.library.view.UserManagementActivity;
import com.yalcinhayyam.library.view.adapter.BookAdapter;
import com.yalcinhayyam.library.data.DatabaseHelper;
import com.yalcinhayyam.library.model.Book;
import com.google.android.material.floatingactionbutton.FloatingActionButton;
import java.util.List;

public class MainActivity extends AppCompatActivity implements BookAdapter.OnBookClickListener {
    private RecyclerView recyclerView;
    private BookAdapter bookAdapter;
    private DatabaseHelper databaseHelper;
    private FloatingActionButton fabAddBook;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        initDatabase();
        initViews();
        setupRecyclerView();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (resultCode == RESULT_OK) {
            loadBooks();
        }
    }

    @Override
    protected void onStart() {
        super.onStart();
        loadBooks();
    }

    private void initDatabase() {
        try {
            databaseHelper = DatabaseHelper.getInstance(this);
        } catch (Exception e) {
            ToastHelper.showError(this, "Database initialization failed");
            Log.e("MainActivity", "Database init error", e);
            finish();
        }
    }

    private void initViews() {
        recyclerView = findViewById(R.id.recyclerViewBooks);
        fabAddBook = findViewById(R.id.fabAddBook);
        fabAddBook.setOnClickListener(v -> startActivity(new Intent(MainActivity.this, AddBookActivity.class)));
    }

    private void setupRecyclerView() {
        bookAdapter = new BookAdapter(this);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        recyclerView.setAdapter(bookAdapter);
        recyclerView.setHasFixedSize(true);
    }

    private void loadBooks() {
        if (databaseHelper == null) return;
        try {
            List<Book> books = databaseHelper.getAllBooks();
            if (books != null && !books.isEmpty()) {
                bookAdapter.setBooks(books);
            } else {
                ToastHelper.showInfo(this, "No books available");
            }
        } catch (Exception e) {
            ToastHelper.showError(this, "Failed to load books");
        }
    }

    @Override
    public void onBookClick(Book book) {
        if (book != null) {
            Intent intent = new Intent(this, BookDetailActivity.class);
            intent.putExtra("book_id", book.getId());
            intent.putExtra("book_title", book.getTitle());
            intent.putExtra("book_pages", book.getPageCount());
            startActivityForResult(intent,1);
        }
    }

    @Override
    public void onBookLongClick(Book book) {
        if (book != null) {
            Intent intent = new Intent(this, EditBookActivity.class);
            intent.putExtra("book_id", book.getId());
            intent.putExtra("book_title", book.getTitle());
            intent.putExtra("book_pages", book.getPageCount());
            startActivity(intent);
        }
    }
    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.main_menu, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        if (item.getItemId() == R.id.menu_user_management) {
            openUserManagement();
            return true;
        }
        return super.onOptionsItemSelected(item);
    }
    public void openUserManagement() {
        startActivity(new Intent(this, UserManagementActivity.class));
    }

    @Override
    protected void onDestroy() {
        if (databaseHelper != null) {
            databaseHelper.close();
        }
        super.onDestroy();
    }
}
