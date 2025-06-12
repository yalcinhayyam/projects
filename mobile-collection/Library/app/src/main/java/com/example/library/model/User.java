package com.example.library.model;

/**
 * Represents a library user with basic information and ban status.
 */
public class User {
    private int id;
    private String name;
    private String studentNumber;
    private boolean banned;

    /**
     * Constructs a new User with the specified details.
     *
     * @param id            the user's unique identifier
     * @param name          the user's full name
     * @param studentNumber the user's student number (can be null)
     * @param banned        whether the user is currently banned
     */
    public User(int id, String name, String studentNumber, boolean banned) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Name cannot be null or empty");
        }

        this.id = id;
        this.name = name;
        this.studentNumber = studentNumber;
        this.banned = banned;
    }

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Name cannot be null or empty");
        }
        this.name = name;
    }

    public String getStudentNumber() { return studentNumber; }
    public void setStudentNumber(String studentNumber) {
        this.studentNumber = studentNumber;
    }

    public boolean isBanned() { return banned; }
    public void setBanned(boolean banned) { this.banned = banned; }

    // Utility Methods
    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", studentNumber='" + studentNumber + '\'' +
                ", banned=" + banned +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return id == user.id;
    }

    @Override
    public int hashCode() {
        return Integer.hashCode(id);
    }

    /**
     * Returns a formatted string with user information.
     * @return formatted user info string
     */
    public String getDisplayInfo() {
        StringBuilder builder = new StringBuilder(name);
        if (studentNumber != null && !studentNumber.isEmpty()) {
            builder.append(" (").append(studentNumber).append(")");
        }
        if (banned) {
            builder.append(" [BANNED]");
        }
        return builder.toString();
    }
}