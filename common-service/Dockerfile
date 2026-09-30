FROM gradle:8.14-jdk21 AS build

WORKDIR /app

COPY . .

RUN chmod +x gradlew
RUN gradle clean build -x test

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8085

ENTRYPOINT ["java", "-jar", "app.jar"]
