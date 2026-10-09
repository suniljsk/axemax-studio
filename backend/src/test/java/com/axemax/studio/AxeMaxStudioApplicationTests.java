package com.axemax.studio;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AxeMaxStudioApplicationTests {
    @Test void applicationModuleIsConfigured() {
        assertTrue(AxeMaxStudioApplication.class.isAnnotationPresent(
            org.springframework.boot.autoconfigure.SpringBootApplication.class));
    }
}
