package com.java.NBE4_5_1_7.global.security;

import com.java.NBE4_5_1_7.global.app.AppConfig;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomAuthorizationRequestResolver customAuthorizationRequestResolver;
    private final CustomAuthenticationSuccessHandler customAuthenticationSuccessHandler;

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests((authorizeHttpRequests) ->
                        authorizeHttpRequests
                                .requestMatchers(
                                        "/swagger-ui/**",
                                        "/v3/api-docs/**",
                                        "/member/**",
                                        "/api/v1/study/**",
                                        "/ws/chat/**",
                                        "/ws/**",
                                        "/chat/**",
                                        "/app/**",
                                        "/api/v1/payments/webhook",
                                        "/api/v1/news/**").permitAll()
                                .requestMatchers(
                                        "/api/v1/admin/**",
                                        "/app/chat/admin/**",
                                        "/chat/admin/**").hasRole("ADMIN")
                                .anyRequest().authenticated()
                )
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sessionManagement -> {
                    sessionManagement.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED);
                })
                .anonymous(anonymous -> anonymous.disable()) // 익명 인증 비활성화
                .logout(logout -> logout
                        .logoutUrl("/member/logout")
                        .logoutRequestMatcher(new AntPathRequestMatcher("/member/logout", "DELETE")) // DELETE 방식으로 처리
                        .invalidateHttpSession(true)
                        .deleteCookies("accessToken", "apiKey", "refreshToken", "JSESSIONID")
                        .logoutSuccessHandler((request, response, authentication) -> {
                            response.setStatus(HttpServletResponse.SC_OK);
                        })
                )
                .exceptionHandling(exceptionHandling ->
                        exceptionHandling.authenticationEntryPoint((request, response, authException) -> {
                            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
                        })
                )
                .exceptionHandling(exceptionHandling ->
                        exceptionHandling
                                .authenticationEntryPoint((request, response, authException) -> {
                                    response.sendError(HttpStatus.UNAUTHORIZED.value(), "Unauthorized");
                                })
                                .accessDeniedHandler((request, response, accessDeniedException) -> {
                                    response.sendError(HttpStatus.FORBIDDEN.value(), accessDeniedException.getMessage());
                                })
                )
                .oauth2Login(oauth2 -> {
                    oauth2.authorizationEndpoint(
                            authorizationEndpoint -> authorizationEndpoint
                                    .authorizationRequestResolver(customAuthorizationRequestResolver)
                    );
                    oauth2.successHandler(customAuthenticationSuccessHandler);
                })
        ;

        return http.build();
    }

    @Bean
    public UrlBasedCorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(AppConfig.getSiteFrontUrl()));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
