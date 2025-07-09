package main

import (
	"fmt"
	"log"
	"net/http"
	"strings"
)

func main() {
	
    mux := http.NewServeMux()
	fs := http.FileServer(http.Dir("/media/"))
    mux.Handle("/media/", http.StripPrefix("/media", disallowFolders(fs)))

	fmt.Println("File server started at port 8800")
	log.Fatal(http.ListenAndServe(":8800", mux))
}

func disallowFolders(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		urlPath := r.URL.Path
        if strings.HasSuffix(urlPath, "/") {
            http.NotFound(w, r)
            return
        }
		
	fileName := strings.TrimPrefix(urlPath, "/")
	if (strings.Contains(fileName, "/")) {
		next.ServeHTTP(w, r)
		return
	}
	// folder := fileName[:2]
	// subfolder := fileName[2:4]
	newURL := fmt.Sprintf("media/%s", fileName)
	http.Redirect(w, r, newURL, http.StatusSeeOther)
    })
}

