package controllers

import (
	"context"
	"log"
	"net/http"
)

func (s *Server) handleImprove(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), s.storeTimeout)
	defer cancel()
	settings, err := s.store.GetSettings(ctx)
	if err != nil {
		log.Printf("Could not retrieve settings: %v", err)
		http.Error(w, "Could not retrieve settings", http.StatusInternalServerError)
		return
	}
	http.Redirect(w, r, settings.ImproveURL, http.StatusFound)
}
