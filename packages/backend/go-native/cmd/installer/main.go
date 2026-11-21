package main

import (
	"fmt"
	"os/exec"
	"runtime"
	"time"
)

func main() {
	fmt.Println("============================================")
	fmt.Println("           Nexio Desktop Launcher           ")
	fmt.Println("  The Next-Gen Multimodal AI Workspace      ")
	fmt.Println("============================================")
	fmt.Println("Launching Nexio in your environment...")

	targetURL := "http://localhost:8080"
	var cmd *exec.Cmd

	switch runtime.GOOS {
	case "windows":
		cmd = exec.Command("rundll32", "url.dll,FileProtocolHandler", targetURL)
	case "darwin":
		cmd = exec.Command("open", targetURL)
	default:
		cmd = exec.Command("xdg-open", targetURL)
	}

	if err := cmd.Start(); err != nil {
		fmt.Printf("Could not open browser automatically: %v\n", err)
		fmt.Printf("Please navigate to: %s\n", targetURL)
	} else {
		fmt.Println("Opened Nexio successfully!")
	}

	time.Sleep(2 * time.Second)
}
