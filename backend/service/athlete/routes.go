package athlete

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/mivalek/mgroomer/service/auth"
	"github.com/mivalek/mgroomer/types"
	"github.com/mivalek/mgroomer/utils"
)

type Handler struct {
	store types.AthleteStore
}

func NewHandler(store types.AthleteStore) *Handler {
	return &Handler{
		store: store,
	}
}

func (h *Handler) RegisterRoutes(router *mux.Router) {
	router.HandleFunc("/athletes", auth.WithAuth(h.handleGetAthletes)).Methods("GET")
	router.HandleFunc("/athletes/{id:[0-9]+}", auth.WithAuth(h.handleEditDisplayName)).Methods("PUT")
}

func (h *Handler) handleGetAthletes(w http.ResponseWriter, r *http.Request) {
	athletes, err := h.store.GetAllAthletes()
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, err)
		return
	}
	utils.WriteJSON(w, http.StatusOK, athletes)
}

func (h *Handler) handleEditDisplayName(w http.ResponseWriter, r *http.Request) {
	athleteID, err := utils.GetAthleteIdFromRequest(r)
	if err != nil {
		utils.WriteError(w, http.StatusBadRequest, err)
		return
	}
	var payload types.EditDisplayNamePayload 
	if err := utils.ParseJSON(r, &payload); err != nil {
		log.Println(err)
		utils.WriteError(w, http.StatusBadRequest, err)
		return
	}
	if athleteID != payload.AthleteID {
		utils.WriteError(w, http.StatusInternalServerError, fmt.Errorf("malformed request"))
		return
	}
	if err := h.store.EditDisplayName(athleteID, payload.DisplayName); err != nil {
		utils.WriteError(w, http.StatusInternalServerError, err)
		return
	}
	utils.WriteJSON(w, http.StatusOK, nil)
}