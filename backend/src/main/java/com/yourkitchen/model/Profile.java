package com.yourkitchen.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "profiles")
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(columnDefinition = "TEXT")
    private String answers;

    @Column(name = "weekly_plan", columnDefinition = "TEXT")
    private String weeklyPlan;

    @Column(name = "saved_recipes", columnDefinition = "TEXT")
    private String savedRecipes;

    // Constructors
    public Profile() {
        this.createdAt = Instant.now();
        this.savedRecipes = "[]";
    }

    public Profile(String name, String answers) {
        this();
        this.name = name;
        this.answers = answers;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public String getAnswers() {
        return answers;
    }

    public void setAnswers(String answers) {
        this.answers = answers;
    }

    public String getWeeklyPlan() {
        return weeklyPlan;
    }

    public void setWeeklyPlan(String weeklyPlan) {
        this.weeklyPlan = weeklyPlan;
    }

    public String getSavedRecipes() {
        return savedRecipes;
    }

    public void setSavedRecipes(String savedRecipes) {
        this.savedRecipes = savedRecipes;
    }
}
