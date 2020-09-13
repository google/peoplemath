FROM gcr.io/peoplemath-build/base

COPY . /build/

WORKDIR /build/backend
RUN ["go", "test", "./..."]

WORKDIR /build
RUN ["npm", "install"]
RUN ["npx", "ng", "test", "--watch=false", "--browsers", "ChromeHeadlessNoSandbox"]
RUN ["bash", "build_appengine.sh"]

