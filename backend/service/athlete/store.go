package athlete

import (
	"database/sql"
	"fmt"

	"github.com/mivalek/mgroomer/types"
)

type Store struct {
	db *sql.DB
}

func NewStore(db *sql.DB) *Store {
	return &Store{db: db}
}


func (s *Store) GetAthleteByID(id int) (*types.Athlete, error) {
	rows, err := s.db.Query("SELECT * FROM athletes WHERE id = ?", id)
	if err != nil {
		return nil, err
	}
	u := new(types.Athlete)
	for rows.Next() {
		u, err = scanRowIntoAthlete(rows)
		if err != nil {
			return nil, err
		}
	}

	// u is initialised as new instance so ID as int will be 0 if not found
	if u.ID == 0 && id > 0{
		return nil, fmt.Errorf("athlete not found")
	}
	return u, nil
}


func scanRowIntoAthlete(rows *sql.Rows) (*types.Athlete, error) {
	athlete := new(types.Athlete)
	if err := rows.Scan(
		&athlete.ID,
		&athlete.GivenNames,
		&athlete.FamilyNames,
		&athlete.DisplayName,
		&athlete.Country,
		&athlete.Category,
		&athlete.Discipline,
		&athlete.HasRecording,
		&athlete.HasPic,
		&athlete.CreatedAt,
	); err != nil {
		return nil, err
	}
	return athlete, nil
}


func (s *Store) GetAllAthletes() ([]*types.Athlete, error) {
	rows, err := s.db.Query("SELECT * FROM athletes;")
	
	if err != nil {
		return nil, err
	}
	athletes := make([]*types.Athlete, 0)
	for rows.Next() {
		u := new(types.Athlete)
		u, err = scanRowIntoAthlete(rows)
		if err != nil {
			return nil, err
		}
		athletes = append(athletes, u)
	}
	return athletes, nil
}

func (s *Store) EditDisplayName(athleteID int, displayName string) error {
	if _, err := s.db.Exec("UPDATE athletes SET displayName=? WHERE id=?;", displayName, athleteID); err != nil {
		return err
	}
	return nil
}