package com.yalcinhayyam.library.view.dialog;

import android.app.AlertDialog;
import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.EditText;
import com.yalcinhayyam.library.R;
import com.yalcinhayyam.library.data.DatabaseHelper;
import com.yalcinhayyam.library.model.User;
import com.yalcinhayyam.library.util.ToastHelper;

public class UserDialog {
    public interface OnUserActionListener {
        void onUserAdded(User user);
        void onUserUpdated(User user);
    }

    public static void showAddUserDialog(Context context, OnUserActionListener listener) {
        View dialogView = LayoutInflater.from(context).inflate(R.layout.dialog_add_user, null);
        EditText etName = dialogView.findViewById(R.id.etName);
        EditText etStudentNumber = dialogView.findViewById(R.id.etStudentNumber);

        new AlertDialog.Builder(context)
                .setTitle("Yeni Kullanıcı Ekle")
                .setView(dialogView)
                .setPositiveButton("Ekle", (dialog, which) -> {
                    String name = etName.getText().toString().trim();
                    String studentNumber = etStudentNumber.getText().toString().trim();
                    if (name.isEmpty() || studentNumber.isEmpty()) {
                        ToastHelper.showError(context, "Tüm alanları doldurun");
                        return;
                    }
                    DatabaseHelper db = DatabaseHelper.getInstance(context);
                    User user = new User(0, name, studentNumber, false);
                    long id = db.addUser (user);
                    if (id != -1) {
                        user.setId((int) id);
                        listener.onUserAdded(user);
                        ToastHelper.showSuccess(context, "Kullanıcı eklendi");
                    } else {
                        ToastHelper.showError(context, "Bu öğrenci numarası zaten kayıtlı");
                    }
                })
                .setNegativeButton("İptal", null)
                .show();
    }

    public static void showEditUserDialog(Context context, User user, OnUserActionListener listener) {
        View dialogView = LayoutInflater.from(context).inflate(R.layout.dialog_add_user, null);
        EditText etName = dialogView.findViewById(R.id.etName);
        EditText etStudentNumber = dialogView.findViewById(R.id.etStudentNumber);
        etName.setText(user.getName());
        etStudentNumber.setText(user.getStudentNumber());
        etStudentNumber.setEnabled(false);

        new AlertDialog.Builder(context)
                .setTitle("Kullanıcı Düzenle")
                .setView(dialogView)
                .setPositiveButton("Güncelle", (dialog, which) -> {
                    String name = etName.getText().toString().trim();
                    if (name.isEmpty()) {
                        ToastHelper.showError(context, "İsim boş olamaz");
                        return;
                    }
                    DatabaseHelper db = DatabaseHelper.getInstance(context);
                    user.setName(name);
                    int result = db.updateUser (user);
                    if (result > 0) {
                        listener.onUserUpdated(user);
                        ToastHelper.showSuccess(context, "Kullanıcı güncellendi");
                    } else {
                        ToastHelper.showError(context, "Güncelleme başarısız");
                    }
                })
                .setNegativeButton("İptal", null)
                .show();
    }
}
