package com.example.library.model;

import java.util.Objects;

/**
 * Represents a book lending transaction in the library system.
 */
public class Entity {
    private int id;
    private int bookId;
    private int userId;
    private String issueDate;
    private String dueDate;
    private String returnDate;  // Added this field
    private boolean isReturned;

    public Entity(int id, int bookId, int userId, String issueDate, String dueDate, boolean isReturned) {
        if (issueDate == null || dueDate == null) {
            throw new IllegalArgumentException("Dates cannot be null");
        }

        this.id = id;
        this.bookId = bookId;
        this.userId = userId;
        this.issueDate = issueDate;
        this.dueDate = dueDate;
        this.isReturned = isReturned;
    }

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getBookId() { return bookId; }
    public void setBookId(int bookId) { this.bookId = bookId; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public String getIssueDate() { return issueDate; }
    public void setIssueDate(String issueDate) {
        if (issueDate == null) throw new IllegalArgumentException("Issue date cannot be null");
        this.issueDate = issueDate;
    }

    public String getDueDate() { return dueDate; }
    public void setDueDate(String dueDate) {
        if (dueDate == null) throw new IllegalArgumentException("Due date cannot be null");
        this.dueDate = dueDate;
    }

    public String getReturnDate() { return returnDate; }
    public void setReturnDate(String returnDate) {
        this.returnDate = returnDate;
    }

    public boolean isReturned() { return isReturned; }
    public void setReturned(boolean returned) { isReturned = returned; }

    @Override
    public String toString() {
        return "Entity{" +
                "id=" + id +
                ", bookId=" + bookId +
                ", userId=" + userId +
                ", issueDate='" + issueDate + '\'' +
                ", dueDate='" + dueDate + '\'' +
                ", returnDate='" + returnDate + '\'' +
                ", isReturned=" + isReturned +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Entity entity = (Entity) o;
        return id == entity.id;
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}