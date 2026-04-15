# Kotlin CLI Hello World

Minimal Kotlin/JVM command-line application built with Gradle Kotlin DSL.

## Prerequisites

- `sdkman`

## Install dependencies with sdkman

If `sdkman` is not installed yet:

```bash
curl -s "https://get.sdkman.io" | bash
source "$HOME/.sdkman/bin/sdkman-init.sh"
```

Install Java 21 and Gradle:

```bash
sdk install java 21-tem
sdk install gradle
```

Verify the installation:

```bash
java -version
gradle -v
```

## Run

```bash
gradle run
```

Expected output:

```text
Hello, World!
```

## Build

```bash
gradle build
```

## Generate a Gradle wrapper

This project currently does not include wrapper files (`gradlew`, `gradlew.bat`, `gradle/wrapper/*`).
After Gradle is installed, generate them with:

```bash
gradle wrapper
```

After that, you can run the project with:

```bash
./gradlew run
```
