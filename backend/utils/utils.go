package utils

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/go-playground/validator/v10"
	"github.com/gorilla/mux"
	"github.com/mivalek/mgroomer/config"
	"github.com/mivalek/mgroomer/types"
)

var Validate = validator.New()

func ParseJSON(r *http.Request, payload any) error {
	if r.Body == nil {
		return fmt.Errorf("missing request body")
	}
	return json.NewDecoder(r.Body).Decode(payload)
}

func WriteJSON(w http.ResponseWriter, status int, v any) error {
	w.Header().Add("Content-Type", "application/json")
	w.WriteHeader(status)
	return json.NewEncoder(w).Encode(v)
}

func WriteError(w http.ResponseWriter, status int, err error) {
	WriteJSON(w, status, map[string]string{"error": err.Error()})
}

func GetTokenFromRequest(r *http.Request) string {
	return r.Header.Get("Authorization")
}

func GetParamFromRequestURL(r *http.Request, param string) (string, error){
	vars := mux.Vars(r)
	value, ok := vars[param]
	if !ok {
		return "", fmt.Errorf("malformed URL")
	}

	return value, nil
}

func GetAthleteIdFromRequest(r *http.Request) (int, error) {
	athleteIDstring, err := GetParamFromRequestURL(r, "id")
	if err != nil {
		return -1, err
	}
	athleteID, err := strconv.Atoi(athleteIDstring)
	if err != nil {
		return -1, err
	}
	return athleteID, nil
}
// from https://medium.com/@chrisgregory_83433/chaining-middleware-in-go-918cfbc5644d
func MultipleMiddleware(h http.HandlerFunc, m ...types.Middleware) http.HandlerFunc {

	if len(m) < 1 {
	   return h
	}
 
	wrapped := h
 
	// loop in reverse to preserve middleware order
	for i := len(m) - 1; i >= 0; i-- {
	   wrapped = m[i](wrapped)
	}
 
	return wrapped
 
 }

 func MakePathFromFileID(id string) string {
	return fmt.Sprintf("%s/%s.webm", config.Envs.StoragePath, id)
 }
 