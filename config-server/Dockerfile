FROM gradle:8.14-jdk21 AS build

WORKDIR /app

COPY . .

RUN chmod +x gradlew
RUN gradle clean bootJar -x test

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/build/libs/*.jar app.jar
COPY --from=build /app/config-repo ./config-repo

EXPOSE 8888

ENTRYPOINT ["java", "-jar", "app.jar"]
