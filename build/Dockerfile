FROM debian:testing-slim
RUN ["apt-get", "update"]
RUN ["apt-get", "install", "-y", "nodejs", "npm", "golang", "findutils", "wget", "xvfb"]
RUN ["wget", "-q", "https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb"]
RUN ["apt", "install", "-y", "./google-chrome-stable_current_amd64.deb"]

