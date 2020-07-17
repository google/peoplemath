FROM golang:1.13

WORKDIR /usr/app/
ENV GO111MODULE=on
ENV GOPATH=''
COPY ./backend/ ./

CMD go mod download && go run . --inmemstore
