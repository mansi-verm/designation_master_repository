FROM gradle:8.14-jdk21 AS build

WORKDIR /workspace

COPY common-service ./common-service
COPY designation-master ./designation-master

WORKDIR /workspace/common-service

RUN chmod +x gradlew
RUN gradle clean publishToMavenLocal -x test

WORKDIR /workspace/designation-master

RUN chmod +x gradlew
RUN gradle clean bootJar -x test

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /workspace/designation-master/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
