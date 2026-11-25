package com.capitalatelier.api.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
public class MailSenderService {

	private static final String BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

	private final JavaMailSender mailSender;
	private final TemplateEngine templateEngine;
	private final RestClient restClient;
	private final String brevoApiKey;
	private final String senderEmail;
	private final String senderName;

	public MailSenderService(JavaMailSender mailSender, TemplateEngine templateEngine,
			@Value("${brevo.api.key:}") String brevoApiKey,
			@Value("${brevo.sender.email:}") String senderEmail,
			@Value("${brevo.sender.name:Capital Atelier}") String senderName) {
		this.mailSender = mailSender;
		this.templateEngine = templateEngine;
		this.restClient = RestClient.create();
		this.brevoApiKey = brevoApiKey;
		this.senderEmail = senderEmail;
		this.senderName = senderName;
	}

	public void sendMail(String to, String subject, String body) {
		if (isBrevoEnabled()) {
			sendViaBrevo(to, subject, body, false);
			return;
		}
		SimpleMailMessage message = new SimpleMailMessage();
		if (senderEmail != null && !senderEmail.isBlank()) {
			message.setFrom(senderEmail);
		}
		message.setTo(to);
		message.setSubject(subject);
		message.setText(body);
		mailSender.send(message);
	}

	@Async
	public void sendWelcomeMail(String to, String subject, String template, Context context) {
		String htmlContent = templateEngine.process(template, context);
		if (isBrevoEnabled()) {
			sendViaBrevo(to, subject, htmlContent, true);
			return;
		}

		MimeMessage message = mailSender.createMimeMessage();
		try {
			MimeMessageHelper helper = new MimeMessageHelper(message, true);
			if (senderEmail != null && !senderEmail.isBlank()) {
				helper.setFrom(senderEmail);
			}
			helper.setTo(to);
			helper.setSubject(subject);
			helper.setText(htmlContent, true);
			mailSender.send(message);
		} catch (MessagingException e) {
			throw new RuntimeException("Erro ao enviar e-mail", e);
		}
	}

	private boolean isBrevoEnabled() {
		return brevoApiKey != null && !brevoApiKey.isBlank() && senderEmail != null && !senderEmail.isBlank();
	}

	private void sendViaBrevo(String to, String subject, String content, boolean isHtml) {
		Map<String, Object> payload = Map.of(
				"sender", Map.of("name", senderName, "email", senderEmail),
				"to", List.of(Map.of("email", to)),
				"subject", subject,
				isHtml ? "htmlContent" : "textContent", content);

		restClient.post()
				.uri(BREVO_ENDPOINT)
				.contentType(MediaType.APPLICATION_JSON)
				.header("api-key", brevoApiKey)
				.body(payload)
				.retrieve()
				.toBodilessEntity();
	}
}
