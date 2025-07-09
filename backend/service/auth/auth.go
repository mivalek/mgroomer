package auth

import (
	"fmt"
	"log"
	"net/http"

	"github.com/mivalek/mgroomer/config"
	"github.com/mivalek/mgroomer/utils"
)


func WithAuth(handler http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		token := utils.GetTokenFromRequest(r)
		if token != config.Envs.ApiKey {
			log.Printf("failed to validate token: %s", token)
			PermissionDenied(w)
			return
		}
		// Call the function if the token is valid
		handler(w, r)
	}
}

func PermissionDenied(w http.ResponseWriter) {
	utils.WriteError(w, http.StatusForbidden, fmt.Errorf("permission denied"))
}