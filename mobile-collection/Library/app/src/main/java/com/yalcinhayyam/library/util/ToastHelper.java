package com.yalcinhayyam.library.util;

import android.content.Context;
import android.widget.Toast;

public class ToastHelper {
    public static void showToast(Context context, String message) {
        Toast.makeText(context, message, Toast.LENGTH_SHORT).show();
    }

    public static void showSuccess(Context context, String message) {
        showToast(context, message);
    }

    public static void showError(Context context, String message) {
        showToast(context, message);
    }

    public static void showInfo(Context context, String message) {
        showToast(context, message);
    }
}
