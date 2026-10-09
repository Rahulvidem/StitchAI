package com.stitchai.api;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public final class ApiModels {
    private ApiModels() {}

    public record RegisterRequest(
            @NotBlank @Size(max = 120) String name,
            @NotBlank @Email @Size(max = 254) String email,
            @NotBlank @Size(min = 10, max = 72) String password) {}

    public record LoginRequest(
            @NotBlank @Email @Size(max = 254) String email,
            @NotBlank @Size(min = 10, max = 72) String password) {}

    public record QuoteRequest(
            @JsonAlias("client_name") @NotBlank @Size(max = 180) String clientName,
            @JsonAlias("garment_type") @NotBlank String garmentType,
            @NotNull @Min(1) @Max(10000) Integer quantity,
            @JsonAlias("stitch_count") @Min(0) Integer stitches,
            @Min(1) @Max(8) Integer placements,
            String speed,
            Boolean polybagging,
            @JsonAlias("woven_tags") Boolean wovenTags) {}

    public record OrderRequest(
            @Size(max = 180) String client,
            @Size(max = 240) String title,
            @Size(max = 120) String garment,
            @JsonAlias("garment_color") @Size(max = 80) String garmentColor,
            @Min(1) @Max(10000) Integer quantity,
            @JsonAlias("stitch_count") @Min(0) Integer stitchCount,
            @JsonAlias("total_price") @Min(0) BigDecimal totalPrice,
            @JsonAlias("payment_status") String paymentStatus) {}

    public record StageRequest(@NotNull @Min(0) @Max(7) Integer stage,
                               @JsonAlias("stage_title") String stageTitle) {}

    public record CheckoutRequest(
            @JsonAlias("order_id") @NotBlank String orderId,
            @NotNull @Min(1) BigDecimal amount,
            @NotBlank String gateway,
            String last4) {}

    public record ArtworkRequest(
            @Size(max = 240) String filename,
            String dimensions,
            @JsonAlias("complexity_score") @Min(0) @Max(100) Integer complexityScore,
            @JsonAlias("stitch_count") @Min(0) Integer stitchCount,
            @JsonAlias("colors_count") @Min(0) @Max(40) Integer colorsCount,
            @JsonAlias("thread_colors") Object threadColors,
            @JsonAlias("puff_eligibility") String puffEligibility) {}

    public record ChatRequest(
            @JsonAlias("question") @NotBlank @Size(max = 4000) String message) {}
}
