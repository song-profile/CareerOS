# gradlew는 쓰지 않는다. Wrapper는 매 빌드마다 GitHub release asset에서 배포판을 내려받는데,
# 그 호스트가 막힌 네트워크에서는 빌드가 통째로 실패한다. 이미지에 박힌 gradle을 쓴다.
# 버전은 gradle/wrapper/gradle-wrapper.properties와 같게 유지한다.
FROM gradle:8.10.2-jdk21-alpine AS build
WORKDIR /workspace

COPY settings.gradle build.gradle ./

COPY src ./src
RUN gradle bootJar --no-daemon

FROM eclipse-temurin:21-jre-alpine AS runner
WORKDIR /app

RUN addgroup -S spring && adduser -S spring -G spring

# 업로드 볼륨 마운트 지점. 이미지에 spring 소유로 만들어 둬야 비어 있는 named volume이
# 그 소유권을 물려받는다. 없으면 root 소유로 생성돼 spring 사용자가 업로드를 못 쓴다.
RUN mkdir -p /app/data/files && chown -R spring:spring /app/data

COPY --from=build /workspace/build/libs/*.jar /app/app.jar

USER spring
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
