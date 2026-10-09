package com.axemax.studio.project;

import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
public class ProjectController {
    private final ProjectService service;
    public ProjectController(ProjectService service) { this.service = service; }

    @GetMapping("/api/v1/projects")
    public Page<Project> publicList(@RequestParam(defaultValue="0") int page,
        @RequestParam(defaultValue="12") int size, @RequestParam(required=false) String technology) {
        return service.publicList(page, size, technology);
    }

    @GetMapping("/api/v1/projects/{slug}")
    public Project publicBySlug(@PathVariable String slug) { return service.publicBySlug(slug); }

    @GetMapping("/api/v1/admin/projects")
    public Page<Project> adminList(@RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="50") int size) {
        return service.adminList(page, size);
    }

    @PostMapping("/api/v1/admin/projects")
    public Project create(@Valid @RequestBody ProjectService.ProjectRequest request) { return service.create(request); }

    @PutMapping("/api/v1/admin/projects/{id}")
    public Project update(@PathVariable long id, @Valid @RequestBody ProjectService.ProjectRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/api/v1/admin/projects/{id}")
    public void delete(@PathVariable long id) { service.delete(id); }
}
