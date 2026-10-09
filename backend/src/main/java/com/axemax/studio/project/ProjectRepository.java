package com.axemax.studio.project;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    Page<Project> findByStatus(String status, Pageable pageable);
    Page<Project> findByStatusAndTechnologiesContainingIgnoreCase(String status, String technology, Pageable pageable);
    Optional<Project> findBySlugAndStatus(String slug, String status);
}
