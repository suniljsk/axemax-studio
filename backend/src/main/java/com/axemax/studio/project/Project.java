package com.axemax.studio.project;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "projects")
public class Project {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 160) private String title;
    @Column(nullable = false, unique = true, length = 180) private String slug;
    @Column(nullable = false, length = 320) private String summary;
    @Column(nullable = false, columnDefinition = "text") private String description;
    @Column(name = "github_url", length = 500) private String githubUrl;
    @Column(name = "demo_url", length = 500) private String demoUrl;
    @Column(name = "image_url", length = 1000) private String imageUrl;
    @Column(nullable = false, columnDefinition = "text") private String technologies = "";
    @Column(nullable = false, length = 20) private String status = "DRAFT";
    @Column(nullable = false) private boolean featured = false;
    @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt;
    @Column(name = "updated_at", nullable = false) private Instant updatedAt;

    @PrePersist void onCreate() { createdAt = Instant.now(); updatedAt = createdAt; }
    @PreUpdate void onUpdate() { updatedAt = Instant.now(); }

    protected Project() {}
    public Project(String title, String slug, String summary, String description, String githubUrl,
                   String demoUrl, String imageUrl, String technologies, String status, boolean featured) {
        this.title=title; this.slug=slug; this.summary=summary; this.description=description;
        this.githubUrl=githubUrl; this.demoUrl=demoUrl; this.imageUrl=imageUrl;
        this.technologies=technologies == null ? "" : technologies; this.status=status; this.featured=featured;
    }
    public Long getId(){return id;} public String getTitle(){return title;} public String getSlug(){return slug;}
    public String getSummary(){return summary;} public String getDescription(){return description;}
    public String getGithubUrl(){return githubUrl;} public String getDemoUrl(){return demoUrl;}
    public String getImageUrl(){return imageUrl;} public String getTechnologies(){return technologies;}
    public String getStatus(){return status;} public boolean isFeatured(){return featured;}
    public Instant getCreatedAt(){return createdAt;} public Instant getUpdatedAt(){return updatedAt;}
    public void update(String title,String slug,String summary,String description,String githubUrl,String demoUrl,
                       String imageUrl,String technologies,String status,boolean featured) {
        this.title=title; this.slug=slug; this.summary=summary; this.description=description;
        this.githubUrl=githubUrl; this.demoUrl=demoUrl; this.imageUrl=imageUrl;
        this.technologies=technologies == null ? "" : technologies; this.status=status; this.featured=featured;
    }
}
