package com.example.library.view;

import android.app.AlertDialog;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.example.library.R;
import com.example.library.data.DatabaseHelper;
import com.example.library.model.User;
import com.example.library.view.adapter.UserAdapter;
import com.google.android.material.floatingactionbutton.FloatingActionButton;
import java.util.List;

public class UserManagementActivity extends AppCompatActivity implements UserAdapter.OnUserClickListener {
    private RecyclerView recyclerView;
    private UserAdapter userAdapter;
    private DatabaseHelper databaseHelper;
    private FloatingActionButton fabAddUser ;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_user_management);
        initViews();
        setupRecyclerView();
        loadUsers();
    }

    private void initViews() {
        recyclerView = findViewById(R.id.recyclerViewUsers);
        fabAddUser  = findViewById(R.id.fabAddUser );
        databaseHelper = DatabaseHelper.getInstance(this);
        fabAddUser .setOnClickListener(v -> showAddUserDialog());
    }

    private void setupRecyclerView() {
        userAdapter = new UserAdapter(this);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        recyclerView.setAdapter(userAdapter);
    }

    private void loadUsers() {
        List<User> users = databaseHelper.getAllUsers();
        userAdapter.setUsers(users);
    }

    private void showAddUserDialog() {
        AlertDialog.Builder dialogBuilder = new AlertDialog.Builder(this);
        LayoutInflater inflater = this.getLayoutInflater();
        View dialogView = inflater.inflate(R.layout.dialog_add_user, null);
        dialogBuilder.setView(dialogView);

        EditText etStudentNumber = dialogView.findViewById(R.id.etStudentNumber);
        EditText etName = dialogView.findViewById(R.id.etName);
        Button btnAdd = dialogView.findViewById(R.id.btnAdd);
        Button btnCancel = dialogView.findViewById(R.id.btnCancel);

        AlertDialog alertDialog = dialogBuilder.create();
        alertDialog.show();

        btnAdd.setOnClickListener(v -> {
            String studentNumber = etStudentNumber.getText().toString().trim();
            String name = etName.getText().toString().trim();
            if (studentNumber.isEmpty() || name.isEmpty()) {
                Toast.makeText(this, "Tüm alanları doldurun", Toast.LENGTH_SHORT).show();
                return;
            }
            User newUser  = new User(0, name, studentNumber, false);
            long result = databaseHelper.addUser (newUser );
            if (result != -1) {
                loadUsers();
                Toast.makeText(this, "Kullanıcı eklendi", Toast.LENGTH_SHORT).show();
                alertDialog.dismiss();
            } else {
                Toast.makeText(this, "Ekleme başarısız", Toast.LENGTH_SHORT).show();
            }
        });

        btnCancel.setOnClickListener(v -> alertDialog.dismiss());
    }

    @Override
    public void onUserClick(User user) {
        showEditUserDialog(user);
    }

    @Override
    public void onUserBanClick(User user) {
        boolean newBanStatus = !user.isBanned();
        boolean success = databaseHelper.toggleUserBan(user.getId(), newBanStatus);
        if (success) {
            user.setBanned(newBanStatus);
            userAdapter.notifyDataSetChanged();
            Toast.makeText(this, newBanStatus ? "Kullanıcı yasaklandı" : "Yasak kaldırıldı", Toast.LENGTH_SHORT).show();
        } else {
            Toast.makeText(this, "İşlem başarısız", Toast.LENGTH_SHORT).show();
        }
    }

    @Override
    public void onUserDeleteClick(User user) {
        int result = databaseHelper.deleteUser(user.getId());
        if (result > 0) {
            loadUsers();
            Toast.makeText(this, "Kullanıcı silindi", Toast.LENGTH_SHORT).show();
        } else {
            Toast.makeText(this, "Silme işlemi başarısız", Toast.LENGTH_SHORT).show();
        }
    }

    private void showEditUserDialog(User user) {
        AlertDialog.Builder dialogBuilder = new AlertDialog.Builder(this);
        LayoutInflater inflater = this.getLayoutInflater();
        View dialogView = inflater.inflate(R.layout.dialog_edit_user, null);
        dialogBuilder.setView(dialogView);

        EditText etStudentNumber = dialogView.findViewById(R.id.etStudentNumber);
        EditText etName = dialogView.findViewById(R.id.etName);
        Button btnUpdate = dialogView.findViewById(R.id.btnUpdate);
        Button btnCancel = dialogView.findViewById(R.id.btnCancel);

        etStudentNumber.setText(user.getStudentNumber());
        etName.setText(user.getName());

        AlertDialog alertDialog = dialogBuilder.create();
        alertDialog.show();

        btnUpdate.setOnClickListener(v -> {
            String studentNumber = etStudentNumber.getText().toString().trim();
            String name = etName.getText().toString().trim();
            if (studentNumber.isEmpty() || name.isEmpty()) {
                Toast.makeText(this, "Tüm alanları doldurun", Toast.LENGTH_SHORT).show();
                return;
            }
            user.setStudentNumber(studentNumber);
            user.setName(name);
            int result = databaseHelper.updateUser (user);
            if (result > 0) {
                loadUsers();
                Toast.makeText(this, "Kullanıcı güncellendi", Toast.LENGTH_SHORT).show();
                alertDialog.dismiss();
            } else {
                Toast.makeText(this, "Güncelleme başarısız", Toast.LENGTH_SHORT).show();
            }
        });

        btnCancel.setOnClickListener(v -> alertDialog.dismiss());
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadUsers();
    }
}
