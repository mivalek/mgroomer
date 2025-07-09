FROM golang:1.24.2-alpine


WORKDIR /src/backend


COPY .env.local .

# Copy go.mod and go.sum files
COPY ./backend/go.mod ./
COPY ./backend/go.sum ./
# Download all dependencies. Dependencies will be cached if the go.mod and go.sum files are not changed
RUN go mod download
# Copy the source from the current directory to the Working Directory inside the container
COPY ./backend .


# Build the Go app
RUN go build -o ./bin/main ./cmd/main.go
# Expose port 8080 to the outside world
EXPOSE 8080

ENTRYPOINT ["./bin/main"]