package com.yalcinhayyam.library.view;

import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import com.yalcinhayyam.library.R;
import com.yalcinhayyam.library.data.DatabaseHelper;
import com.yalcinhayyam.library.model.Book;

public class EditBookActivity extends AppCompatActivity {
    private EditText etBookTitle, etBookPages;
    private Button btnUpdate, btnCancel;
    private DatabaseHelper databaseHelper;
    private Book currentBook;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_edit_book);
        initViews();
        loadBookData();
        setupClickListeners();
    }

    private void initViews() {
        etBookTitle = findViewById(R.id.etBookTitle);
        etBookPages = findViewById(R.id.etBookPages);
        btnUpdate = findViewById(R.id.btnUpdate);
        btnCancel = findViewById(R.id.btnCancel);
        databaseHelper = DatabaseHelper.getInstance(this);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setTitle("Kitap Düzenle");
        }
    }

    private void loadBookData() {
        int bookId = getIntent().getIntExtra("book_id", -1);
        String bookTitle = getIntent().getStringExtra("book_title");
        int bookPages = getIntent().getIntExtra("book_pages", 0);
        currentBook = new Book(bookId, bookTitle, bookPages);
        etBookTitle.setText(bookTitle);
        etBookPages.setText(String.valueOf(bookPages));
    }

    private void setupClickListeners() {
        btnUpdate.setOnClickListener(v -> updateBook());
        btnCancel.setOnClickListener(v -> finish());
    }

    private void updateBook() {
        String title = etBookTitle.getText().toString().trim();
        String pagesStr = etBookPages.getText().toString().trim();

        if (title.isEmpty()) {
            etBookTitle.setError("Kitap adı boş olamaz");
            return;
        }
        if (pagesStr.isEmpty()) {
            etBookPages.setError("Sayfa sayısı boş olamaz");
            return;
        }

        try {
            int pages = Integer.parseInt(pagesStr);
            if (pages <= 0) {
                etBookPages.setError("Sayfa sayısı pozitif olmalı");
                return;
            }
            currentBook.setTitle(title);
            currentBook.setPageCount(pages);
            if (databaseHelper.updateBook(currentBook) > 0) {
                Toast.makeText(this, "Kitap başarıyla güncellendi!", Toast.LENGTH_SHORT).show();
                finish();
            } else {
                Toast.makeText(this, "Kitap güncellenirken hata oluştu!", Toast.LENGTH_SHORT).show();
            }
        } catch (NumberFormatException e) {
            etBookPages.setError("Geçerli bir sayı girin");
        }
    }

    @Override
    public boolean onSupportNavigateUp() {
        onBackPressed();
        return true;
    }
}
