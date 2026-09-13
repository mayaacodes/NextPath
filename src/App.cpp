#include "nextpath/App.hpp"

#include <iostream>

namespace nextpath {

App::App() : appName_("NextPath") {}

void App::run() {
    std::cout << appName_ << " website app is ready.\n";
    std::cout << "Static assets live in web/public and web/assets.\n";
    std::cout << "Use this as a base for routes, handlers, and future HTTP integration.\n";
}

std::vector<PageRoute> App::routes() const {
    return {
        {"GET", "/", "Home page"},
        {"GET", "/about", "About page"},
        {"GET", "/contact", "Contact page"},
    };
}

}  // namespace nextpath
