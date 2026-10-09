package com.axemax.studio.project;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProjectService {
    private final ProjectRepository repository;
    public ProjectService(ProjectRepository repository) { this.repository = repository; }

    public Page<Project> publicList(int page, int size, String technology) {
        int safePage = Math.max(0, page);
        int safeSize = Math.min(Math.max(1, size), 50);
        var pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        if (technology != null && !technology.isBlank())
            return repository.findByStatusAndTechnologiesContainingIgnoreCase("PUBLISHED", technology.trim(), pageable);
        return repository.findByStatus("PUBLISHED", pageable);
    }

    public Project publicBySlug(String slug) {
        return repository.findBySlugAndStatus(slug, "PUBLISHED")
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
    }

    public Page<Project> adminList(int page, int size) {
        return repository.findAll(PageRequest.of(Math.max(0,page), Math.min(Math.max(1,size),50),
            Sort.by(Sort.Direction.DESC, "createdAt")));
    }

    @Transactional public Project create(ProjectRequest request) {
        if (repository.findBySlugAndStatus(request.slug(), "PUBLISHED").isPresent()
            || repository.findAll().stream().anyMatch(p -> p.getSlug().equals(request.slug()))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Slug already exists");
        }
        return repository.save(new Project(request.title(), request.slug(), request.summary(), request.description(),
            request.githubUrl(), request.demoUrl(), request.imageUrl(), request.technologies(), request.status(), request.featured()));
    }

    @Transactional public Project update(long id, ProjectRequest request) {
        Project p = repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
        repository.findAll().stream().filter(other -> !other.getId().equals(id) && other.getSlug().equals(request.slug()))
            .findAny().ifPresent(other -> { throw new ResponseStatusException(HttpStatus.CONFLICT, "Slug already exists"); });
        p.update(request.title(), request.slug(), request.summary(), request.description(), request.githubUrl(),
            request.demoUrl(), request.imageUrl(), request.technologies(), request.status(), request.featured());
        return p;
    }

    public void delete(long id) {
        if (!repository.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found");
        repository.deleteById(id);
    }

    public record ProjectRequest(
        @jakarta.validation.constraints.NotBlank @jakarta.validation.constraints.Size(max=160) String title,
        @jakarta.validation.constraints.NotBlank @jakarta.validation.constraints.Pattern(regexp="[a-z0-9]+(?:-[a-z0-9]+)*") @jakarta.validation.constraints.Size(max=180) String slug,
        @jakarta.validation.constraints.NotBlank @jakarta.validation.constraints.Size(max=320) String summary,
        @jakarta.validation.constraints.NotBlank String description,
        @jakarta.validation.constraints.Size(max=500) String githubUrl,
        @jakarta.validation.constraints.Size(max=500) String demoUrl,
        @jakarta.validation.constraints.Size(max=1000) String imageUrl,
        @jakarta.validation.constraints.Size(max=1000) String technologies,
        @jakarta.validation.constraints.Pattern(regexp="DRAFT|PUBLISHED") String status,
        boolean featured
    ) {}
}
