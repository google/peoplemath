FROM node:lts

RUN npm install -g @angular/cli @angular-devkit/build-angular
RUN npm install
CMD ng serve --port 4200 --host 0.0.0.0 --disable-host-check
