package reserveddoc

import (
	"strings"
)

// Known allowed doc types for db$ and userdata$ reserved namespaces
var allowedDbDocKinds = map[string]bool{
	"docProperties": true,
}

var allowedUserdataDocKinds = map[string]bool{
	"favorite": true,
}

// AuthorizeReservedDocSubject checks if the user has access to a reserved document subject.
// Matches the affine_core::access_control::authorize_reserved_document logic.
func AuthorizeReservedDocSubject(userID, workspaceID, docID string) bool {
	// If it's a userdata reserved document: userdata$<user_id>$<workspace_id>$<kind>
	if strings.HasPrefix(docID, "userdata$") {
		parts := strings.Split(docID, "$")
		if len(parts) != 4 {
			return false
		}
		docUserID := parts[1]
		docWorkspaceID := parts[2]
		kind := parts[3]

		if docUserID == "__local__" {
			return false
		}
		if docUserID != userID || docWorkspaceID != workspaceID {
			return false
		}
		return allowedUserdataDocKinds[kind]
	}

	// If it's a db reserved document: db$<workspace_id>$<kind>
	if strings.HasPrefix(docID, "db$") {
		parts := strings.Split(docID, "$")
		if len(parts) != 3 {
			return false
		}
		docWorkspaceID := parts[1]
		kind := parts[2]

		if docWorkspaceID != workspaceID {
			return false
		}
		return allowedDbDocKinds[kind]
	}

	// Ordinary non-reserved documents are open to workspace members
	return true
}

