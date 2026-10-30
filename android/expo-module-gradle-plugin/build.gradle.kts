import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
    `kotlin-dsl`
    id("java-gradle-plugin")
}

gradlePlugin {
    plugins {
        create("expo-module-gradle-plugin") {
            id = "expo-module-gradle-plugin"
            implementationClass = "com.expo.gradle.ExpoModuleGradlePlugin"
        }
    }
}

group = "expo"
version = "1.0.0"

repositories {
    google()
    mavenCentral()
}

dependencies {
    implementation(gradleApi())
    implementation(localGroovy())
}

tasks.withType<KotlinCompile>().configureEach {
    kotlinOptions {
        jvmTarget = "11"
        apiVersion = "1.6"
    }
}

java {
    targetCompatibility = JavaVersion.VERSION_11
}