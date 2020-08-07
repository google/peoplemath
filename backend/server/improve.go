package server

import (
	"context"
	"fmt"
	"net/http"
)

func (s *Server) handleImprove(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), s.storeTimeout)
	defer cancel()
	settings, err := s.store.GetSettings(ctx)
	if err != nil {
		http.Error(w, fmt.Sprintf("Could not retrieve settings: %v", err), http.StatusInternalServerError)
		return
	}
	http.Redirect(w, r, settings.ImproveURL, http.StatusFound)
}
