package com.yalcinhayyam.library.view.adapter;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageButton;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.RecyclerView;
import com.yalcinhayyam.library.R;
import com.yalcinhayyam.library.model.User;
import java.util.ArrayList;
import java.util.List;

public class UserAdapter extends RecyclerView.Adapter<UserAdapter.UserViewHolder> {
    private List<User> users;
    private final OnUserClickListener listener;

    public interface OnUserClickListener {
        void onUserClick(User user);
        void onUserBanClick(User user);
        void onUserDeleteClick(User user);
    }

    public UserAdapter(OnUserClickListener listener) {
        this.listener = listener;
        this.users = new ArrayList<>();
    }

    public void setUsers(List<User> users) {
        this.users = users != null ? users : new ArrayList<>();
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public UserViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_user, parent, false);
        return new UserViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull UserViewHolder holder, int position) {
        User user = users.get(position);
        holder.bind(user,listener);
    }

    @Override
    public int getItemCount() {
        return users.size();
    }

    static class UserViewHolder extends RecyclerView.ViewHolder {
        private final TextView tvUserName;
        private final TextView tvStudentNumber;
        private final TextView tvBanStatus;
        private final ImageButton btnBan;
        private final ImageButton btnDelete;

        public UserViewHolder(@NonNull View itemView) {
            super(itemView);
            tvUserName = itemView.findViewById(R.id.tvUserName);
            tvStudentNumber = itemView.findViewById(R.id.tvStudentNumber);
            tvBanStatus = itemView.findViewById(R.id.tvBanStatus);
            btnBan = itemView.findViewById(R.id.btnBan);
            btnDelete = itemView.findViewById(R.id.btnDelete);
        }

        public void bind(User user, OnUserClickListener listener) {
            tvUserName.setText(user.getName());
            tvStudentNumber.setText(user.getStudentNumber());
            tvBanStatus.setText(user.isBanned() ? "Yasaklı" : "Aktif");
            tvBanStatus.setTextColor(ContextCompat.getColor(itemView.getContext(), user.isBanned() ? R.color.red : R.color.green));
            btnBan.setImageResource(user.isBanned() ? R.drawable.ic_unban : R.drawable.ic_ban);

            itemView.setOnClickListener(v -> listener.onUserClick(user));
            btnBan.setOnClickListener(v -> listener.onUserBanClick(user));
            btnDelete.setOnClickListener(v -> listener.onUserDeleteClick(user));
        }
    }
}
