package com.example.library.view;

import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import com.example.library.R;
import com.example.library.data.DatabaseHelper;
import com.example.library.model.Book;

public class AddBookActivity extends AppCompatActivity {
    private EditText etBookTitle, etBookPages;
    private Button btnSave, btnCancel;
    private DatabaseHelper databaseHelper;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_add_book);
        initViews();
        setupClickListeners();
    }

    private void initViews() {
        etBookTitle = findViewById(R.id.etBookTitle);
        etBookPages = findViewById(R.id.etBookPages);
        btnSave = findViewById(R.id.btnSave);
        btnCancel = findViewById(R.id.btnCancel);
        databaseHelper =  DatabaseHelper.getInstance(this);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setTitle("Yeni Kitap Ekle");
        }
    }

    private void setupClickListeners() {
        btnSave.setOnClickListener(v -> saveBook());
        btnCancel.setOnClickListener(v -> finish());
    }

    private void saveBook() {
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
            Book newBook = new Book(0, title, pages);
            long result = databaseHelper.addBook(newBook);
            if (result != -1) {
                Toast.makeText(this, "Kitap başarıyla eklendi!", Toast.LENGTH_SHORT).show();
                finish();
            } else {
                Toast.makeText(this, "Kitap eklenirken hata oluştu!", Toast.LENGTH_SHORT).show();
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
