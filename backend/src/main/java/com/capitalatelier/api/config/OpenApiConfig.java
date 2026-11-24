package com.capitalatelier.api.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

	@Bean
	public OpenAPI capitalAtelierOpenAPI() {
		String schemeName = "bearerAuth";
		return new OpenAPI()
				.info(new Info()
						.title("Capital Atelier API")
						.version("1.0.0")
						.description(
								"API REST para gestão financeira pessoal e compartilhada com SSE em tempo real, relatórios CSV, integração com IA (Google Gemini) e controles de segurança OWASP."))
				.addSecurityItem(new SecurityRequirement().addList(schemeName))
				.components(new Components().addSecuritySchemes(schemeName,
						new SecurityScheme()
								.name(schemeName)
								.type(SecurityScheme.Type.HTTP)
								.scheme("bearer")
								.bearerFormat("JWT")));
	}
}
