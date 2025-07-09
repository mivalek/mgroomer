package files

import (
	"database/sql"
	"fmt"
	"io"
	"mime/multipart"
	"os"

	"github.com/mivalek/mgroomer/types"
	"github.com/mivalek/mgroomer/utils"
)

type Store struct {
	db *sql.DB
}

func NewStore(db *sql.DB) *Store {
	return &Store{db: db}
}

func (s *Store) CreateFile(file types.File) error {
	_, err := s.db.Exec(
		"INSERT INTO files (id, size, author, athleteId, flag, rating, nRatings) VALUES (?,?,?,?,0,0,0)",
		file.ID,
		file.Size,
		// file.CreatedAt,
		file.Author,
		file.AthleteID,
	)
	if err != nil {
		return err
	}

	return nil
}



func (s *Store) SetAthleteHasRecording(athleteID int) error {
	_, err := s.db.Exec(
		"UPDATE athletes SET hasRecording=1 WHERE id=?",
		athleteID,
	)
	if err != nil {
		return err
	}

	return nil
}

func (s *Store) WriteFileToDisk(header []*multipart.FileHeader, fileId string) error {
	// if err := os.MkdirAll(path, os.ModePerm); err != nil {
	// 	return err
	// }
	savedFile, err := os.Create(utils.MakePathFromFileID(fileId))
	if err != nil {
		return err
	}
	defer savedFile.Close()
	
	for _, h := range header {
		file, err := h.Open()
		if err != nil {
			return err
		}
		if _, err := io.Copy(savedFile, file); err != nil {
			return err
		}
		file.Close()
	}
	return nil
}

func (s *Store) DeleteFile(fileID string) error {

	athleteID, err := s.GetAthleteIdForFile(fileID)
	if err != nil {
		return err
	}

	if _, err := s.db.Exec("DELETE FROM files WHERE id=?;", fileID); err != nil {
		return err
	}
	
	nFiles, err := s.CountFilesForAthlete(athleteID)
	if err != nil {
		return err
	}
	
	if nFiles == 0 {
		if _, err := s.db.Exec("UPDATE athletes SET hasRecording=0 WHERE id=?;", athleteID); err != nil {
			return err
		}
	}
	return nil
}

func (s *Store) RemoveFileFromDisk(fileId string) error {
	filePath := utils.MakePathFromFileID(fileId)
	if err := os.Remove(filePath); err != nil {
		return err
	}
	return nil
}

func (s *Store) GetFilesForAthlete(athleteID int) ([]*types.File, error) {
	rows, err := s.db.Query("SELECT * FROM files WHERE athleteId=?;", athleteID)
	
	if err != nil {
		return nil, err
	}
	files := make([]*types.File, 0)
	for rows.Next() {
		f := new(types.File)
		f, err = scanRowIntoFile(rows)
		if err != nil {
			return nil, err
		}
		files = append(files, f)
	}
	return files, nil
}

func (s *Store) GetAthleteIdForFile(fileId string) (int, error) {
	var athleteId int
	err := s.db.QueryRow("SELECT athleteId FROM files WHERE id=?;", fileId).Scan(&athleteId)
	if err!= nil {
		return -1, err
	}
	
	return athleteId, nil
}

func (s *Store) CountFilesForAthlete(athleteId int) (int, error) {
	var n int
	err := s.db.QueryRow("SELECT COUNT(*) FROM files WHERE athleteId=?;", athleteId).Scan(&n)
	if err != nil {
		return -1, err
	}
	return n, nil
}

func (s *Store) GetAllFiles() ([]*types.File, error) {
	rows, err := s.db.Query("SELECT * FROM files;")
	
	if err != nil {
		return nil, err
	}
	files := make([]*types.File, 0)
	for rows.Next() {
		f := new(types.File)
		f, err = scanRowIntoFile(rows)
		if err != nil {
			return nil, err
		}
		files = append(files, f)
	}
	return files, nil
}

func (s *Store) GetFile(id string) ([]*types.File, error) {
	rows, err := s.db.Query("SELECT * FROM files WHERE id=?;", id)

	if err != nil {
		return nil, err
	}
	files := make([]*types.File, 0)
	for rows.Next() {
		f := new(types.File)
		f, err = scanRowIntoFile(rows)
		if err != nil {
			return nil, err
		}
		files = append(files, f)
	}
	return files, nil
}

func scanRowIntoFile(rows *sql.Rows) (*types.File, error) {
	file := new(types.File)
	if err := rows.Scan(
		&file.ID,
		&file.Size,
		&file.CreatedAt,
		&file.Author,
		&file.AthleteID,
		&file.Flag,
		&file.Rating,
		&file.NRatings,
	); err != nil {
		return nil, err
	}
	return file, nil
}

func (s *Store) RateFile(fileId string, rating int, remove bool, newRating bool) error {
	file, err := s.GetFile(fileId)
	if err != nil {
		return err
	}
	if len(file) == 0 {
		return fmt.Errorf("file does not exist")
	}
	if len(file) > 1 {
		return fmt.Errorf("multiple copies")
	}
	nRatings := file[0].NRatings
	prevRating := file[0].Rating

	var updatedRating float32
	updatedNRatings := nRatings
	if remove {		
		updatedNRatings = nRatings - 1
		if updatedNRatings == 0 {
			updatedRating = 0
		} else {
			updatedRating = (prevRating * float32(nRatings) - float32(rating)) / float32(updatedNRatings)
		}
	} else {
		if newRating {
		updatedNRatings = nRatings + 1
		updatedRating = (prevRating * float32(nRatings) + float32(rating)) / float32(updatedNRatings)

		} else {
			ratingToRemove := 1 - rating
			updatedRating = (prevRating * float32(nRatings) - float32(ratingToRemove) + float32(rating)) / float32(updatedNRatings)
		}
	}
	
	if _, err := s.db.Exec(
		"UPDATE files SET rating=?, nRatings=? WHERE id=?;",
		updatedRating, updatedNRatings, fileId,
		); err != nil {
		return err
	}
	return nil
}

func (s *Store) FlagFile(fileId string, flag bool) error {
	file, err := s.GetFile(fileId)
	if err != nil {
		return err
	}
	if len(file) == 0 {
		return fmt.Errorf("file does not exist")
	}
	if len(file) > 1 {
		return fmt.Errorf("multiple copies")
	}
	flagInt := 0
	if flag {
		flagInt = 1
	}
	if _, err := s.db.Exec("UPDATE files SET flag=? WHERE id=?;", flagInt, fileId); err != nil {
		return err
	}
	return nil
}