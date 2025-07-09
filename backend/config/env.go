package config

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	PublicHost string
	Port       string
	DBUser string
	DBPwd  string
	DBAddr string
	DBName string
	JWTExpirationInSeconds int64
	JWTSecret string
	StoragePath string
	ClientPort string
	ApiKey string
}

// store config params here as to not have to run initConfig() every time
var Envs = initConfig()
func initConfig() Config {
	godotenv.Load(".env.local")

	return Config{
		PublicHost: getEnv("PUBLIC_HOST", "http://localhost"),
		Port: getEnv("API_PORT", "8080"),
		ClientPort: getEnv("PORT", "3000"),
		DBUser: getEnv("DB_USER", "root"),
		DBPwd: getEnv("DB_PASSWORD", "my-db-password"),
		DBAddr: fmt.Sprintf("%s:%s", getEnv("DB_HOST", "127.0.0.1"), getEnv("DB_PORT", "3306")),
		DBName: getEnv("DB_NAME", "mgroomerdb"),
		StoragePath: getEnv("STORAGE_PATH", "/media/audio"),
		ApiKey: getEnv("API_KEY", "my-secret-key"),
	}
}

func getEnv(key, fallback string) string {
	// get value from .env
	if value, ok := os.LookupEnv(key); ok {
		return value
	}

	return fallback
}
