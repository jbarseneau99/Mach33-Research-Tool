package com.mach33.research.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
public class SimpleController {
    
    @GetMapping("/")
    public Map<String, Object> root() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Multi-Agent Research Platform API");
        response.put("status", "UP");
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("backend", "Java Spring Boot");
        return response;
    }
    
    @GetMapping("/status")
    public Map<String, Object> status() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Multi-Agent Research Platform");
        response.put("version", "1.0.0");
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("backend", "Spring Boot + Java 17");
        return response;
    }
    

} 