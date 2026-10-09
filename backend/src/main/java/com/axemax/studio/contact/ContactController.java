package com.axemax.studio.contact;

import jakarta.persistence.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.Instant;

@RestController
@RequestMapping("/api/v1/contact")
public class ContactController {
    private final ContactRepository repository;
    public ContactController(ContactRepository repository) { this.repository = repository; }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MessageResponse create(@Valid @RequestBody ContactRequest request) {
        ContactMessage saved = repository.save(new ContactMessage(request.name().trim(), request.email().trim(),
            request.subject().trim(), request.message().trim()));
        return new MessageResponse(saved.getId(), "Thank you. Your message has been received.");
    }

    public record ContactRequest(@NotBlank @Size(max=120) String name, @Email @NotBlank @Size(max=255) String email,
        @NotBlank @Size(max=180) String subject, @NotBlank @Size(max=5000) String message) {}
    public record MessageResponse(Long id, String message) {}
}

@Entity
@Table(name="contact_messages")
class ContactMessage {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false,length=120) private String name;
    @Column(nullable=false,length=255) private String email;
    @Column(nullable=false,length=180) private String subject;
    @Column(nullable=false,columnDefinition="text") private String message;
    @Column(nullable=false,length=20) private String status="NEW";
    @Column(name="created_at",nullable=false,updatable=false) private Instant createdAt;
    protected ContactMessage() {}
    ContactMessage(String name,String email,String subject,String message) {
        this.name=name; this.email=email; this.subject=subject; this.message=message;
    }
    @PrePersist void prePersist(){createdAt=Instant.now();}
    Long getId(){return id;}
}
interface ContactRepository extends JpaRepository<ContactMessage,Long> {}
