package com.careerdock.global.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@Configuration
@EnableJpaAuditing
@ConditionalOnProperty(name = "careerdock.jpa-auditing.enabled", havingValue = "true", matchIfMissing = true)
public class JpaAuditingConfig {
}
