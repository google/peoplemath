FROM node:lts

WORKDIR /usr/app/
COPY ./ ./
RUN rm -rf backend && \
    rm -rf docker && \
    npm install -g @angular/cli @angular-devkit/build-angular && \
    npm install && \
    sed -i 's/localhost/backend/g' src/devproxy.conf.json

CMD ng serve --port 4200 --host 0.0.0.0 --disable-host-check
