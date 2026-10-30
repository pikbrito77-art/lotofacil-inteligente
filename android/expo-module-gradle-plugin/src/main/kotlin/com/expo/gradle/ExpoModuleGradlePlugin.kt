package com.expo.gradle

import org.gradle.api.Plugin
import org.gradle.api.Project

class ExpoModuleGradlePlugin : Plugin<Project> {
    override fun apply(project: Project) {
        // Add expoModule extension
        project.extensions.create("expoModule", ExpoModuleExtension::class.java)
    }
}

open class ExpoModuleExtension {
    open var canBePublished = true
}