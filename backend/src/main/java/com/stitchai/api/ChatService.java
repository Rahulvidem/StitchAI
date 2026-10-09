package com.stitchai.api;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import java.net.http.HttpClient;

@Service
public class ChatService {
    private static final Logger logger = LoggerFactory.getLogger(ChatService.class);
    private static final Pattern WORDS = Pattern.compile("[a-z0-9]{3,}");
    private static final Set<String> STOP_WORDS = Set.of(
            "the", "and", "for", "with", "that", "this", "from", "are", "can", "you",
            "your", "our", "how", "what", "when", "where", "does", "have", "has");

    private final String apiKey;
    private final String model;
    private final RestClient restClient;
    private final List<KnowledgeChunk> knowledge;

    public ChatService(
            @Value("${app.gemini.api-key}") String apiKey,
            @Value("${app.gemini.model}") String model) {
        this.apiKey = apiKey;
        this.model = model;
        var httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
        var requestFactory = new JdkClientHttpRequestFactory(httpClient);
        requestFactory.setReadTimeout(Duration.ofSeconds(25));
        this.restClient = RestClient.builder().requestFactory(requestFactory).build();
        this.knowledge = loadKnowledge();
    }

    public Map<String, Object> answer(String question) {
        List<KnowledgeChunk> retrieved = retrieve(question);
        List<String> sources = retrieved.stream().map(KnowledgeChunk::title).toList();
        String context = retrieved.stream().map(KnowledgeChunk::content).collect(Collectors.joining("\n\n"));
        if (apiKey != null && !apiKey.isBlank()) {
            try {
                String generated = generateWithGemini(question, context);
                if (generated != null && !generated.isBlank()) {
                    return Map.of("answer", generated, "mode", "gemini-rag", "sources", sources);
                }
                logger.warn("Gemini returned an empty response; using local retrieval for this request.");
            } catch (RestClientException | IllegalStateException exception) {
                logger.warn("Gemini request failed; using local retrieval for this request: {}", exception.getMessage());
            }
        }
        return Map.of("answer", localAnswer(question, retrieved), "mode", "local-rag", "sources", sources);
    }

    private String generateWithGemini(String question, String context) {
        Map<?, ?> response = restClient.post()
                .uri(uri -> uri
                        .scheme("https")
                        .host("generativelanguage.googleapis.com")
                        .path("/v1beta/models/{model}:generateContent")
                        .queryParam("key", apiKey)
                        .build(model))
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of(
                        "system_instruction", Map.of("parts", List.of(Map.of("text",
                                "You are StitchAI's apparel production assistant. Answer concisely and ground factual manufacturing advice in the supplied retrieved knowledge. If context is insufficient, say so. Never claim a simulated payment is real."))),
                        "contents", List.of(Map.of("role", "user", "parts", List.of(Map.of(
                                "text", "Retrieved knowledge:\n" + context + "\n\nQuestion:\n" + question)))) ))
                .retrieve()
                .body(Map.class);
        if (response == null) return null;
        Object candidatesValue = response.get("candidates");
        if (!(candidatesValue instanceof List<?> candidates) || candidates.isEmpty()) return null;
        Object contentValue = ((Map<?, ?>) candidates.getFirst()).get("content");
        if (!(contentValue instanceof Map<?, ?> content)) return null;
        Object partsValue = content.get("parts");
        if (!(partsValue instanceof List<?> parts) || parts.isEmpty()) return null;
        Object text = ((Map<?, ?>) parts.getFirst()).get("text");
        return text instanceof String answer ? answer : null;
    }

    private List<KnowledgeChunk> retrieve(String question) {
        Set<String> queryWords = words(question);
        return knowledge.stream()
                .map(chunk -> Map.entry(chunk, score(queryWords, words(chunk.title + " " + chunk.content))))
                .filter(entry -> entry.getValue() > 0)
                .sorted(Map.Entry.<KnowledgeChunk, Integer>comparingByValue(Comparator.reverseOrder()))
                .limit(3)
                .map(Map.Entry::getKey)
                .toList();
    }

    private int score(Set<String> query, Set<String> document) {
        int score = 0;
        for (String word : query) if (document.contains(word)) score++;
        return score;
    }

    private Set<String> words(String text) {
        var matcher = WORDS.matcher(text.toLowerCase(Locale.ROOT));
        Set<String> terms = new java.util.HashSet<>();
        while (matcher.find()) {
            String term = matcher.group();
            if (!STOP_WORDS.contains(term)) terms.add(term);
        }
        return terms;
    }

    private String localAnswer(String question, List<KnowledgeChunk> retrieved) {
        if (retrieved.isEmpty()) {
            return "I couldn't find a direct match in the StitchAI knowledge base for that question. I can help with stitch planning, garment choices, quoting, quality checks, and delivery. Try asking about one of those topics.";
        }
        return "Here is the relevant guidance I found for your question:\n\n"
                + retrieved.stream()
                        .map(chunk -> "**" + chunk.title + "**\n" + chunk.content)
                        .collect(Collectors.joining("\n\n"))
                + "\n\nUse this as a planning guide and confirm production specifications with your digitizer.";
    }

    private List<KnowledgeChunk> loadKnowledge() {
        try (var input = new ClassPathResource("knowledge-base.md").getInputStream()) {
            String document = new String(input.readAllBytes(), StandardCharsets.UTF_8);
            List<KnowledgeChunk> chunks = new ArrayList<>();
            for (String section : document.split("(?m)(?=^## )")) {
                String trimmed = section.trim();
                if (trimmed.isEmpty()) continue;
                int lineBreak = trimmed.indexOf('\n');
                String title = lineBreak < 0 ? trimmed.replaceFirst("^##\\s*", "") :
                        trimmed.substring(0, lineBreak).replaceFirst("^##\\s*", "");
                String content = lineBreak < 0 ? "" : trimmed.substring(lineBreak + 1).trim();
                chunks.add(new KnowledgeChunk(title, content));
            }
            if (chunks.isEmpty()) throw new IllegalStateException("The StitchAI knowledge base is empty.");
            return List.copyOf(chunks);
        } catch (IOException exception) {
            throw new IllegalStateException("Could not load the StitchAI RAG knowledge base.", exception);
        }
    }

    private record KnowledgeChunk(String title, String content) {}
}
