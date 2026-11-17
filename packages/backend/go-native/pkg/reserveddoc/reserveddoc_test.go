package reserveddoc

import "testing"

func TestAuthorizeReservedDocSubject(t *testing.T) {
	cases := []struct {
		userID      string
		workspaceID string
		docID       string
		expected    bool
	}{
		{"user-a", "workspace-a", "ordinary-doc", true},
		{"user-a", "workspace-a", "db$workspace-a$docProperties", true},
		{"user-a", "workspace-a", "userdata$user-a$workspace-a$favorite", true},
		{"user-b", "workspace-a", "userdata$user-a$workspace-a$favorite", false},
		{"user-a", "workspace-b", "userdata$user-a$workspace-a$favorite", false},
		{"user-a", "workspace-a", "userdata$__local__$workspace-a$favorite", false},
		{"user-a", "workspace-a", "userdata$user-a$workspace-a$unknown", false},
		{"user-a", "workspace-a", "db$workspace-a$unknown", false},
	}

	for _, c := range cases {
		actual := AuthorizeReservedDocSubject(c.userID, c.workspaceID, c.docID)
		if actual != c.expected {
			t.Errorf("AuthorizeReservedDocSubject(%q, %q, %q) = %v; want %v",
				c.userID, c.workspaceID, c.docID, actual, c.expected)
		}
	}
}

