# Build stage
FROM amazoncorretto:21 AS builder
WORKDIR /app
COPY . .
RUN chmod +x gradlew && ./gradlew bootJar --no-daemon

# Run stage
FROM amazoncorretto:21-alpine
WORKDIR /app
COPY --from=builder /app/build/libs/NBE4_5_1_7-0.0.1-SNAPSHOT.jar /app/app.jar

RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

EXPOSE 8080
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "/app/app.jar"]
