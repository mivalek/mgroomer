package files

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/mivalek/mgroomer/service/auth"
	"github.com/mivalek/mgroomer/types"
	"github.com/mivalek/mgroomer/utils"
)

type Handler struct {
	store types.FileStore
	athleteStore types.AthleteStore
}

func NewHandler(
	store types.FileStore,
	athleteStore types.AthleteStore,
	) *Handler {
	return &Handler{
		store: store,
		athleteStore: athleteStore,
	}
}

func (h *Handler) RegisterRoutes(router *mux.Router) {
	router.HandleFunc("/files", auth.WithAuth(h.handleGetAllFiles)).Methods("GET")
	router.HandleFunc("/files/upload", auth.WithAuth(h.handleUpload)).Methods("POST", "OPTIONS")
	router.HandleFunc("/files/{id}", auth.WithAuth(h.handleDeleteFile)).Methods("DELETE")
	router.HandleFunc("/files/{id}/flag", auth.WithAuth(h.handleFlagFile)).Methods("POST")
	router.HandleFunc("/files/{id}/rating", auth.WithAuth(h.handleRateFile)).Methods("POST")
	router.HandleFunc("/athletes/{id:[0-9]+}/files", auth.WithAuth(h.handleGetFilesForAthlete)).Methods("GET")
}

func (h *Handler) handleUpload(w http.ResponseWriter, r *http.Request) {	
	 // maxMemory 1 << 20 = 1MB
	if err := r.ParseMultipartForm(1 << 20); err != nil {
		// log.Println(err.Error())
		http.Error(w, "file larger than 1 MB", http.StatusBadRequest)
		return
	}

	athleteID, err := strconv.Atoi(r.Form.Get("athleteId"))
	if err != nil {
		// log.Println(err.Error())
		http.Error(w, "Failed to parse body", http.StatusBadRequest)
		return
	}

	// Get header
	file, multipartFileHeader, err := r.FormFile("recording")
	if err != nil {
		// log.Println(err.Error())
		http.Error(w, "Failed to retrieve file", http.StatusBadRequest)
		return
	}
	defer file.Close()
	// Create a buffer to store the header of the file in
	fileHeader := make([]byte, 512)
	
	// Copy the headers into the FileHeader buffer
	if _, err := file.Read(fileHeader); err != nil {
		// log.Println(err.Error())
		http.Error(w, err.Error(), http.StatusBadRequest)
		return 
	}

	mimeType := http.DetectContentType(fileHeader)
	if (!strings.HasSuffix(mimeType, "/webm")) {
		// log.Println("File not accepted")
		http.Error(w, "File not accepted", http.StatusBadRequest)
		return
	}

	fileId := uuid.New().String()
	
	if err := h.store.WriteFileToDisk(r.MultipartForm.File["recording"], fileId); err != nil {
		log.Println(err.Error())
		utils.WriteError(w, http.StatusInternalServerError, err)
		return
	}
	// log.Printf("file written to %s\n", utils.MakePathFromFileID(fileId))
	
	if err := h.store.CreateFile(types.File{
		ID: fileId,
		Size: uint(multipartFileHeader.Size),
		Author: r.Form.Get("author"),
		AthleteID: athleteID,
	}); err != nil {
		utils.WriteError(w, http.StatusInternalServerError, err)
		return
	}
	// log.Println("file added to database")
	if err := h.store.SetAthleteHasRecording(athleteID); err != nil {
		utils.WriteError(w, http.StatusInternalServerError, err)
		return
	}

	// log.Println("athlete record updated")
	utils.WriteJSON(w, http.StatusOK, fileId)
}

func (h *Handler) handleGetFilesForAthlete(w http.ResponseWriter, r *http.Request) {
	athleteID, err := utils.GetAthleteIdFromRequest(r)
	if err != nil {
		utils.WriteError(w, http.StatusBadRequest, err)
		return
	}
	files, err := h.store.GetFilesForAthlete(athleteID)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, err)
		return
	}
	utils.WriteJSON(w, http.StatusOK, files)
}

func (h *Handler) handleGetAllFiles(w http.ResponseWriter, r *http.Request) {
	files, err := h.store.GetAllFiles()
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, err)
		return
	}
	utils.WriteJSON(w, http.StatusOK, files)
}

func (h *Handler) handleDeleteFile(w http.ResponseWriter, r *http.Request) {
	fileID, err := utils.GetParamFromRequestURL(r, "id")
	if err != nil {
		utils.WriteError(w, http.StatusBadRequest, err)
		return
	}
	var payload types.DeleteFilePayload 
	if err := utils.ParseJSON(r, &payload); err != nil {
		utils.WriteError(w, http.StatusBadRequest, err)
		return
	}
	
	if fileID != payload.FileID {
		utils.WriteError(w, http.StatusBadRequest, fmt.Errorf("incompatible request body"))
		return
	}
	if err := h.store.DeleteFile(fileID); err != nil {
		utils.WriteError(w, http.StatusInternalServerError, err)
		return
	}
	if err := h.store.RemoveFileFromDisk(fileID); err != nil {
		log.Println(err.Error())
	}
	utils.WriteJSON(w, http.StatusOK, "file deleted")
}
func (h *Handler) handleFlagFile(w http.ResponseWriter, r *http.Request) {
	fileID, err := utils.GetParamFromRequestURL(r, "id")
	if err != nil {
		utils.WriteError(w, http.StatusBadRequest, err)
		return
	}
	var payload types.FlagFilePayload 
	if err := utils.ParseJSON(r, &payload); err != nil {
		utils.WriteError(w, http.StatusBadRequest, err)
		return
	}
	
	if fileID != payload.FileID {
		utils.WriteError(w, http.StatusBadRequest, fmt.Errorf("incompatible request body"))
		return
	}
	if err := h.store.FlagFile(fileID, payload.Flag); err != nil {
		utils.WriteError(w, http.StatusInternalServerError, err)
		return
	}
	msg := "file flagged"
	if !payload.Flag {
		msg = "file unflagged"
	} 
	utils.WriteJSON(w, http.StatusOK, msg)
}

func (h *Handler) handleRateFile(w http.ResponseWriter, r *http.Request) {
	fileID, err := utils.GetParamFromRequestURL(r, "id")
	if err != nil {
		utils.WriteError(w, http.StatusBadRequest, err)
		return
	}
	var payload types.RateFilePayload 
	if err := utils.ParseJSON(r, &payload); err != nil {
		utils.WriteError(w, http.StatusBadRequest, err)
		return
	}
	
	if fileID != payload.FileID {
		utils.WriteError(w, http.StatusBadRequest, fmt.Errorf("incompatible request body"))
		return
	}

	if err := h.store.RateFile(fileID, payload.Rating, payload.Remove, payload.NewRating); err != nil {
		utils.WriteError(w, http.StatusInternalServerError, err)
		return
	}
	msg := "rating added"
	if payload.Remove {
		msg = "rating removed"
	}
	utils.WriteJSON(w, http.StatusOK, msg)
}
