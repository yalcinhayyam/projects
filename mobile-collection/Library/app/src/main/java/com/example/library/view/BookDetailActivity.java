package com.example.library.view;

import android.app.DatePickerDialog;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import com.example.library.R;
import com.example.library.data.DatabaseHelper;
import com.example.library.model.Book;
import com.example.library.model.User;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.List;
import java.util.Locale;

public class BookDetailActivity extends AppCompatActivity {
    private TextView tvTitle, tvPages, tvStatus, tvBorrower;
    private Button btnBorrow, btnReturn, btnDelete, btnManageUsers;
    private DatabaseHelper databaseHelper;
    private Book currentBook;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_book_detail);
        initViews();
        updateUI();
    }

    private void updateUI() {
        loadBookData(); // Kitap bilgilerini yenile
        updateBookStatus(); // Durum bilgisini güncelle
        checkBookStatus(); // Silme butonu durumunu kontrol et
    }
    private void initViews() {
        tvTitle = findViewById(R.id.tvDetailTitle);
        tvPages = findViewById(R.id.tvDetailPages);
        tvStatus = findViewById(R.id.tvDetailStatus);
        tvBorrower = findViewById(R.id.tvDetailBorrower);
        btnBorrow = findViewById(R.id.btnBorrow);
        btnReturn = findViewById(R.id.btnReturn);
        btnDelete = findViewById(R.id.btnDelete);
        btnManageUsers = findViewById(R.id.btnManageUsers);
        databaseHelper =  DatabaseHelper.getInstance(this);

        btnBorrow.setOnClickListener(v -> showBorrowDialog());
        btnReturn.setOnClickListener(v -> returnBook());
        btnDelete.setOnClickListener(v -> showDeleteConfirmation());
        btnManageUsers.setOnClickListener(v -> showUserManagement());

        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        }
    }

    private void checkBookStatus() {
        if (databaseHelper.isBookBorrowed(currentBook.getId())) {
            btnDelete.setEnabled(false);
            btnDelete.setAlpha(0.5f);
            btnDelete.setText("Kitap Ödünç Verilmiş (Silinemez)");
        }else {
            btnDelete.setEnabled(true);
            btnDelete.setAlpha(1f);
            btnDelete.setText("Kitabı Sil");
        }
    }
    private void loadBookData() {
        int bookId = getIntent().getIntExtra("book_id", -1);
        String bookTitle = getIntent().getStringExtra("book_title");
        int bookPages = getIntent().getIntExtra("book_pages", 0);
        currentBook = new Book(bookId, bookTitle, bookPages);
        tvTitle.setText(bookTitle);
        tvPages.setText(bookPages + " sayfa");
    }

    private void updateBookStatus() {
        if (databaseHelper.isBookBorrowed(currentBook.getId())) {
            tvStatus.setText("Durum: Ödünç Verildi");
            tvStatus.setTextColor(getColor(android.R.color.holo_red_dark));
            User borrower = databaseHelper.getBookBorrower(currentBook.getId());
            if (borrower != null) {
                String borrowerInfo = borrower.getName() + (borrower.isBanned() ? " (Yasaklı)" : "");
                tvBorrower.setText("Ödünç alan: " + borrowerInfo);
                tvBorrower.setVisibility(View.VISIBLE);
            }
            btnBorrow.setVisibility(View.GONE);
            btnReturn.setVisibility(View.VISIBLE);
        } else {
            tvStatus.setText("Durum: Mevcut");
            tvStatus.setTextColor(getColor(android.R.color.holo_green_dark));
            tvBorrower.setVisibility(View.GONE);
            btnBorrow.setVisibility(View.VISIBLE);
            btnReturn.setVisibility(View.GONE);
        }
    }

    private void showBorrowDialog() {
        List<User> users = databaseHelper.getAllUsers();
        if (users.isEmpty()) {
            Toast.makeText(this, "Önce kullanıcı eklemelisiniz!", Toast.LENGTH_SHORT).show();
            return;
        }
        users.removeIf(User::isBanned);
        if (users.isEmpty()) {
            Toast.makeText(this, "Ödünç verebileceğiniz aktif kullanıcı yok!", Toast.LENGTH_SHORT).show();
            return;
        }

        String[] userNames = new String[users.size()];
        for (int i = 0; i < users.size(); i++) {
            userNames[i] = users.get(i).getName() + (users.get(i).getStudentNumber() != null && !users.get(i).getStudentNumber().isEmpty() ? " (" + users.get(i).getStudentNumber() + ")" : "");
        }

        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Kullanıcı Seçin");
        final int[] selectedUser   = {0};
        builder.setSingleChoiceItems(userNames, 0, (dialog, which) -> selectedUser  [0] = which);
        builder.setPositiveButton("Devam", (dialog, which) -> showDatePickerForBorrow(users.get(selectedUser  [0])));
        builder.setNegativeButton("İptal", null);
        builder.show();
    }

    private void showDatePickerForBorrow(User user) {
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.DAY_OF_MONTH, 14);
        DatePickerDialog datePickerDialog = new DatePickerDialog(this, (view, year, month, dayOfMonth) -> {
            Calendar selectedDate = Calendar.getInstance();
            selectedDate.set(year, month, dayOfMonth);
            String dueDate = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(selectedDate.getTime());
            borrowBook(user.getId(), dueDate);
        }, calendar.get(Calendar.YEAR), calendar.get(Calendar.MONTH), calendar.get(Calendar.DAY_OF_MONTH));
        datePickerDialog.setTitle("Teslim Tarihi Seçin");
        datePickerDialog.show();
    }

    private void borrowBook(int userId, String dueDate) {
        if (databaseHelper.borrowBook(currentBook.getId(), userId, dueDate)) {
            Toast.makeText(this, "Kitap ödünç verildi!", Toast.LENGTH_SHORT).show();
            updateUI();
        } else {
            Toast.makeText(this, "Hata oluştu!", Toast.LENGTH_SHORT).show();
        }
    }

    private void returnBook() {
        if (databaseHelper.returnBook(currentBook.getId())) {
            Toast.makeText(this, "Kitap iade edildi!", Toast.LENGTH_SHORT).show();
            updateUI();
        } else {
            Toast.makeText(this, "Hata oluştu!", Toast.LENGTH_SHORT).show();
        }
    }

    private void showDeleteConfirmation() {
        new AlertDialog.Builder(this)
                .setTitle("Kitabı Sil")
                .setMessage("Bu kitabı silmek istediğinizden emin misiniz?")
                .setPositiveButton("Sil", (dialog, which) -> {
                    if (databaseHelper.deleteBook(currentBook.getId()) > 0) {
                        Toast.makeText(this, "Kitap silindi!", Toast.LENGTH_SHORT).show();
                        setResult(RESULT_OK); // Ana aktiviteye sonuç gönder
                        finish();
                    } else {
                        Toast.makeText(this, "Silme işlemi başarısız!", Toast.LENGTH_SHORT).show();
                    }
                })
                .setNegativeButton("İptal", null)
                .show();
    }

    private void showUserManagement() {
        startActivity(new Intent(this, UserManagementActivity.class));
    }

    @Override
    public boolean onSupportNavigateUp() {
        onBackPressed();
        return true;
    }
}
