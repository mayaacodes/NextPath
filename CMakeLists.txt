cmake_minimum_required(VERSION 3.16)
project(NextPathWebsite LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

include(GNUInstallDirs)

add_executable(nextpath_web
    src/main.cpp
    src/App.cpp
)

target_include_directories(nextpath_web
    PRIVATE
        ${CMAKE_CURRENT_SOURCE_DIR}/include
)

target_compile_features(nextpath_web PRIVATE cxx_std_20)

# Default output for generated files.
set_target_properties(nextpath_web PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin
)
