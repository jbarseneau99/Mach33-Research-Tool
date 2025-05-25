package com.mach33.research;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
@EnableJpaRepositories
@EnableTransactionManagement
public class ResearchPlatformApplication {

    public static void main(String[] args) {
        SpringApplication.run(ResearchPlatformApplication.class, args);
    }
} 