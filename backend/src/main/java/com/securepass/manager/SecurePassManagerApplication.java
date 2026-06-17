package com.securepass.manager;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class SecurePassManagerApplication {

    public static void main(String[] args) {
        SpringApplication.run(SecurePassManagerApplication.class, args);
    }
}
