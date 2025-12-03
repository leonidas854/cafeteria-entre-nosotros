plugins {
    id("com.android.application")
    id("kotlin-android")
    // The Flutter Gradle Plugin must be applied after the Android and Kotlin Gradle plugins.
    id("dev.flutter.flutter-gradle-plugin")
    id("com.google.gms.google-services")
}
//SHA1: 73:71:08:13:BE:6A:0F:6E:A2:85:E0:14:1A:0F:6A:7A:71:07:03:0D
//SHA-256: E9:22:F9:E7:D6:56:91:92:4B:D2:B5:74:8E:39:5B:D9:E0:35:07:00:B5:9B:49:4F:8A:1B:74:9F:E7:AD:76:82
android {
    namespace = "com.example.fronted_iot"
    compileSdk = flutter.compileSdkVersion.toInt()
    ndkVersion = flutter.ndkVersion

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = JavaVersion.VERSION_17.toString()
    }
defaultConfig {
        applicationId = "com.example.fronted_iot"
        // ASEGURAMOS QUE minSdk sea al menos 21
        minSdk = flutter.minSdkVersion 
        targetSdk = flutter.targetSdkVersion.toInt()
        versionCode = flutter.versionCode.toInt()
        versionName = flutter.versionName
    
        multiDexEnabled = true
    }

    buildTypes {
        release {
            // TODO: Add your own signing config for the release build.
            // Signing with the debug keys for now, so `flutter run --release` works.
            signingConfig = signingConfigs.getByName("debug")
        }
    }
}

flutter {
    source = "../.."
}

dependencies {
    implementation("androidx.multidex:multidex:2.0.1")
    implementation(platform("com.google.firebase:firebase-bom:34.6.0"))
    implementation("com.google.firebase:firebase-analytics")
}
