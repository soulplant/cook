package main

import (
	"net/http"
	"fmt"
)

func init() {
	http.HandleFunc("/", hello)
}

func hello(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "<h1>Hi</h1>")
}
