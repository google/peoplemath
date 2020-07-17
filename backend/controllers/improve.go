package controllers

import (
	"context"
	"fmt"
	"net/http"
)

func (c *ImproveController) Get(w http.ResponseWriter, r *http.Request) {
	ctx := context.TODO()
	settings, err := c.Store.GetSettings(ctx)
	if err != nil {
		http.Error(w, fmt.Sprintf("Could not retrieve settings: %v", err), http.StatusInternalServerError)
		return
	}
	http.Redirect(w, r, settings.ImproveURL, http.StatusFound)
}
