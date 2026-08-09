package com.careerdock.auth.oauth;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Properties;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.config.YamlPropertiesFactoryBean;
import org.springframework.core.io.ClassPathResource;

class GoogleOAuthScopeConfigurationTest {

    @Test
    void googleLoginScopesDoNotContainOpenidSoCustomOauthUserServiceIsUsed() {
        YamlPropertiesFactoryBean yaml = new YamlPropertiesFactoryBean();
        yaml.setResources(new ClassPathResource("application.yml"));

        Properties properties = yaml.getObject();

        assertThat(properties).isNotNull();
        assertThat(properties.getProperty("spring.security.oauth2.client.registration.google.scope[0]"))
                .isEqualTo("profile");
        assertThat(properties.getProperty("spring.security.oauth2.client.registration.google.scope[1]"))
                .isEqualTo("email");
        assertThat(properties.values()).doesNotContain("openid");
    }
}
