build:
	@go build -o bin/fileserver cmd/main.go

test:
	@go test -v ./...

run: build
	@bin/fileserver
