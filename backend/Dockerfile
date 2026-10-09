FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY pom.xml .
RUN mvn -B -DskipTests dependency:go-offline
COPY src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S -g 10001 stitchai \
    && adduser -S -D -H -u 10001 -G stitchai stitchai \
    && mkdir -p /data \
    && chown -R stitchai:stitchai /app /data
COPY --from=build /workspace/target/stitchai-api-1.0.0.jar /app/app.jar
USER stitchai
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
