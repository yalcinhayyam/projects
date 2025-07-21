package com.yalcinhayyam.library.view.adapter;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.yalcinhayyam.library.R;
import com.yalcinhayyam.library.data.DatabaseHelper;
import com.yalcinhayyam.library.model.Book;
import com.yalcinhayyam.library.model.User;
import java.util.ArrayList;
import java.util.List;

public class BookAdapter extends RecyclerView.Adapter<BookAdapter.BookViewHolder> {
    private List<Book> books = new ArrayList<>();
    private OnBookClickListener listener;
    private DatabaseHelper databaseHelper;

    public interface OnBookClickListener {
        void onBookClick(Book book);
        void onBookLongClick(Book book);
    }

    public BookAdapter(OnBookClickListener listener) {
        this.listener = listener;
        this.databaseHelper =  DatabaseHelper.getInstance(listener instanceof android.content.Context ? (android.content.Context) listener : null);
    }

    @NonNull
    @Override
    public BookViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_book, parent, false);
        return new BookViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull BookViewHolder holder, int position) {
        Book book = books.get(position);
        holder.bind(book);
    }

    @Override
    public int getItemCount() {
        return books.size();
    }

    public void setBooks(List<Book> books) {
        this.books = books;
        notifyDataSetChanged();
    }

    public class BookViewHolder extends RecyclerView.ViewHolder {
        private TextView tvTitle, tvPages, tvStatus, tvBorrower;

        public BookViewHolder(@NonNull View itemView) {
            super(itemView);
            tvTitle = itemView.findViewById(R.id.tvBookTitle);
            tvPages = itemView.findViewById(R.id.tvBookPages);
            tvStatus = itemView.findViewById(R.id.tvBookStatus);
            tvBorrower = itemView.findViewById(R.id.tvBookBorrower);

            itemView.setOnClickListener(v -> {
                int position = getAdapterPosition();
                if (position != RecyclerView.NO_POSITION && listener != null) {
                    listener.onBookClick(books.get(position));
                }
            });

            itemView.setOnLongClickListener(v -> {
                int position = getAdapterPosition();
                if (position != RecyclerView.NO_POSITION && listener != null) {
                    listener.onBookLongClick(books.get(position));
                    return true;
                }
                return false;
            });
        }

        public void bind(Book book) {
            tvTitle.setText(book.getTitle());
            tvPages.setText(book.getPageCount() + " sayfa");
            if (databaseHelper != null && databaseHelper.isBookBorrowed(book.getId())) {
                tvStatus.setText("Ödünç Verildi");
                tvStatus.setTextColor(itemView.getContext().getColor(android.R.color.holo_red_dark));
                User borrower = databaseHelper.getBookBorrower(book.getId());
                tvBorrower.setText(borrower != null ? "Ödünç alan: " + borrower.getName() : "");
                tvBorrower.setVisibility(borrower != null ? View.VISIBLE : View.GONE);
            } else {
                tvStatus.setText("Mevcut");
                tvStatus.setTextColor(itemView.getContext().getColor(android.R.color.holo_green_dark));
                tvBorrower.setVisibility(View.GONE);
            }
        }
    }
}
