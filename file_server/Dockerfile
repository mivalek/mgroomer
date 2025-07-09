FROM golang:1.24.2-alpine

WORKDIR /src/fileserver

# Copy go.mod and go.sum files
COPY go.mod ./
# Download all dependencies. Dependencies will be cached if the go.mod and go.sum files are not changed
RUN go mod download
# Copy the source from the current directory to the Working Directory inside the container
COPY . .
# Build the Go app
RUN go build -o ./bin/main ./cmd/main.go
# Expose port 8800 to the outside world
EXPOSE 8800

ENTRYPOINT ["./bin/main"]
