#pragma once

#include <string>
#include <vector>

namespace nextpath {

struct PageRoute {
    std::string method;
    std::string path;
    std::string description;
};

class App {
public:
    App();
    ~App() = default;

    void run();
    std::vector<PageRoute> routes() const;

private:
    std::string appName_;
};

}  // namespace nextpath
