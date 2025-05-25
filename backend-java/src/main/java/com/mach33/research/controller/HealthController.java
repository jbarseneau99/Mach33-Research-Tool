package com.mach33.research.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Multi-Agent Research Platform");
        response.put("version", "1.0.0");
        response.put("timestamp", LocalDateTime.now());
        response.put("backend", "Spring Boot + Java 17");
        response.put("database", "PostgreSQL");
        response.put("cache", "Redis");
        
        return ResponseEntity.ok(response);
    }
} 