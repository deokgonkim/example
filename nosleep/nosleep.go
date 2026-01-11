package main

import (
	"flag"
	"fmt"
	"os"
	"os/exec"
	"strings"
	"time"
)

const (
	portalDest  = "org.freedesktop.portal.Desktop"
	portalPath  = "/org/freedesktop/portal/desktop"
	portalIface = "org.freedesktop.portal.Inhibit"
	inhibitIdle = "8"
)

func buildGdbusArgs(appID, reason string) []string {
	escaped := strings.ReplaceAll(reason, "'", "\\'")
	options := fmt.Sprintf("{'reason': <'%s'>}", escaped)
	return []string{
		"call",
		"--session",
		"--dest", portalDest,
		"--object-path", portalPath,
		"--method", portalIface + ".Inhibit",
		appID,
		inhibitIdle,
		options,
	}
}

func main() {
	appID := flag.String("app-id", "com.example.nosleep", "Application ID string for the portal request")
	reason := flag.String("reason", "Keeping the session awake", "Human-readable reason for the inhibit request")
	flag.Parse()

	output, err := exec.Command("gdbus", buildGdbusArgs(*appID, *reason)...).CombinedOutput()
	if err != nil {
		// Some portal versions include a window handle parameter.
		base := buildGdbusArgs(*appID, *reason)
		fallback := append(base[:9], append([]string{""}, base[9:]...)...)
		output, err = exec.Command("gdbus", fallback...).CombinedOutput()
	}

	if err != nil {
		if os.IsNotExist(err) {
			fmt.Fprintln(os.Stderr, "gdbus not found. Install the 'glib2.0-bin' package.")
			os.Exit(1)
		}
		fmt.Fprintln(os.Stderr, "Failed to request inhibit via xdg-desktop-portal.")
		stderr := strings.TrimSpace(string(output))
		if stderr != "" {
			fmt.Fprintln(os.Stderr, stderr)
		}
		os.Exit(1)
	}

	handle := strings.TrimSpace(string(output))
	fmt.Println("Inhibit active. Press Ctrl+C to release.")
	if handle != "" {
		fmt.Printf("Portal handle: %s\n", handle)
	}

	for {
		time.Sleep(60 * time.Second)
	}
}
