package com.yalcinhayyam.library.model;

/**
 * Represents a book in the library system.
 */
public class Book {
    private int id;
    private String title;
    private int pageCount;
    private boolean available;
    private boolean isDeleted;

    public Book(int id, String title, int pageCount) {
        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Title cannot be null or empty");
        }
        if (pageCount <= 0) {
            throw new IllegalArgumentException("Page count must be positive");
        }

        this.id = id;
        this.title = title;
        this.pageCount = pageCount;
        this.available = true; // Default to available
    }

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) {
        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Title cannot be null or empty");
        }
        this.title = title;
    }

    public int getPageCount() { return pageCount; }
    public void setPageCount(int pageCount) {
        if (pageCount <= 0) {
            throw new IllegalArgumentException("Page count must be positive");
        }
        this.pageCount = pageCount;
    }

    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }
    public boolean getIsDeleted(){
        return isDeleted;
    }

    public void setIsDeleted(boolean isDeleted){
        this.isDeleted = isDeleted;
    }

    @Override
    public String toString() {
        return "Book{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", pageCount=" + pageCount +
                ", available=" + available +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Book book = (Book) o;
        return id == book.id;
    }

    @Override
    public int hashCode() {
        return Integer.hashCode(id);
    }
}