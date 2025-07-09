package types

import (
	"mime/multipart"
	"net/http"
	"time"
)

type Athlete struct {
	ID int `json:"id"`
	GivenNames string `json:"givenNames"`
	FamilyNames  string `json:"familyNames"`
	DisplayName  string `json:"displayName"`
	Country  string `json:"country"`
	Category     int `json:"category"`
	Discipline  int `json:"discipline"`
	HasRecording bool `json:"hasRecording"`
	HasPic bool `json:"hasPic"`
	CreatedAt time.Time `json:"createdAt"`
}

type AthleteStore interface {
	// GetAthlete(id int) (*Athlete, error)
	GetAllAthletes() ([]*Athlete, error)
	EditDisplayName(athleteID int, displayName string) error
}

type FileStore interface {
	CreateFile(file File) error
	WriteFileToDisk(header []*multipart.FileHeader, fileId string) error
	GetFilesForAthlete(athleteID int) ([]*File, error)
	GetAllFiles() ([]*File, error)
	GetFile(id string) ([]*File, error)
	SetAthleteHasRecording(athleteID int) error
	DeleteFile(fileID string) error
	RateFile(fileID string, rating int, remove bool, newRating bool) error
	FlagFile(fileID string, flag bool) error
	RemoveFileFromDisk(fileId string) error
}

type File struct {
	ID string `json:"id"`
	Size  uint `json:"size"`
	CreatedAt time.Time `json:"createdAt"`
	Author string `json:"author"`
	AthleteID int `json:"athleteId"`
	Flag int `json:"flag"`
	Rating float32 `json:"rating"`
	NRatings int `json:"nRatings"`
}

type FileMetadata struct {
	Author string `json:"author"`
	AthleteID int `json:"athleteId"`
}

type EditDisplayNamePayload struct {
	AthleteID int `json:"id"`
	DisplayName string `json:"displayName"`
}
type DeleteFilePayload struct {
	FileID string `json:"id"`
}
type FlagFilePayload struct {
	FileID string `json:"id"`
	Flag bool `json:"flag"`
}
type RateFilePayload struct {
	FileID string `json:"id"`
	Rating int `json:"rating"`
	Remove bool `json:"remove"`
	NewRating bool `json:"newRating"`
}

type Middleware func(http.HandlerFunc) http.HandlerFunc
