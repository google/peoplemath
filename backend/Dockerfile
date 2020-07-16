FROM golang:1.13

ENV GO111MODULE=on
RUN apt-get -y update
CMD cd backend && go run . --inmemstore
