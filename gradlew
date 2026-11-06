#!/bin/sh
# Delega en el wrapper de Gradle del proyecto Android
cd "$(dirname "$0")/android" && exec ./gradlew "$@"
