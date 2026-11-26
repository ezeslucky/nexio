package server

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"sync"
	"time"

	"github.com/ezeslucky/nexio/packages/backend/go-native/pkg/authsession"
	"github.com/ezeslucky/nexio/packages/backend/go-native/pkg/crdt"
	"github.com/ezeslucky/nexio/packages/backend/go-native/pkg/filetype"
	"github.com/ezeslucky/nexio/packages/backend/go-native/pkg/hashcash"
	"github.com/ezeslucky/nexio/packages/backend/go-native/pkg/nbstore"
	"github.com/ezeslucky/nexio/packages/backend/go-native/pkg/tokenizer"
)

type UserInfo struct {
	ID            string   `json:"id"`
	Name          string   `json:"name"`
	Email         string   `json:"email"`
	EmailVerified bool     `json:"emailVerified"`
	HasPassword   bool     `json:"hasPassword"`
	AvatarURL     string   `json:"avatarUrl"`
	Features      []string `json:"features"`
}

type AuthState struct {
	mu          sync.RWMutex
	loggedOut   bool
	defaultUser UserInfo
	sessions    map[string]UserInfo
}

type WorkspaceModuleSettings struct {
	EnableTracker bool `json:"enableTracker"`
	EnableChat    bool `json:"enableChat"`
	EnableDocs    bool `json:"enableDocs"`
	EnableOffice  bool `json:"enableOffice"`
}

type WorkspaceMemberItem struct {
	ID        string `json:"id"`
	UserID    string `json:"userId"`
	Name      string `json:"name"`
	Email     string `json:"email"`
	Role      string `json:"role"`
	State     string `json:"state"`
	AvatarURL string `json:"avatarUrl"`
	JoinedAt  string `json:"joinedAt"`
}

type TrackerProject struct {
	ID          string `json:"id"`
	WorkspaceID string `json:"workspaceId"`
	Name        string `json:"name"`
	Key         string `json:"key"`
	Description string `json:"description"`
	Color       string `json:"color"`
	CreatedAt   string `json:"createdAt"`
	UpdatedAt   string `json:"updatedAt"`
}

type TrackerSprint struct {
	ID          string `json:"id"`
	WorkspaceID string `json:"workspaceId"`
	ProjectID   string `json:"projectId"`
	Name        string `json:"name"`
	Status      string `json:"status"` // "planned", "active", "completed"
	StartDate   string `json:"startDate"`
	EndDate     string `json:"endDate"`
	Goal        string `json:"goal"`
}

type TrackerLabel struct {
	ID          string `json:"id"`
	WorkspaceID string `json:"workspaceId"`
	Name        string `json:"name"`
	Color       string `json:"color"`
}

type TrackerComment struct {
	ID        string `json:"id"`
	IssueID   string `json:"issueId"`
	Author    string `json:"author"`
	Content   string `json:"content"`
	CreatedAt string `json:"createdAt"`
}

type TrackerIssue struct {
	ID           string           `json:"id"`
	WorkspaceID  string           `json:"workspaceId"`
	ProjectID    string           `json:"projectId"`
	Title        string           `json:"title"`
	Description  string           `json:"description"`
	Status       string           `json:"status"` // "backlog", "todo", "in_progress", "in_review", "done", "canceled"
	Priority     string           `json:"priority"` // "urgent", "high", "medium", "low", "none"
	Assignee     string           `json:"assignee"`
	Reporter     string           `json:"reporter"`
	SprintID     string           `json:"sprintId"`
	Estimate     int              `json:"estimate"`
	Labels       []string         `json:"labels"`
	DueDate      string           `json:"dueDate"`
	Comments          []TrackerComment `json:"comments"`
	LinkedDocIDs      []string         `json:"linkedDocIds"`
	TimeLogs          []TrackerTimeLog `json:"timeLogs"`
	TotalSpentMinutes int              `json:"totalSpentMinutes"`
	CreatedAt         string           `json:"createdAt"`
	UpdatedAt         string           `json:"updatedAt"`
}

type TrackerTimeLog struct {
	ID               string `json:"id"`
	IssueID          string `json:"issueId"`
	WorkspaceID      string `json:"workspaceId"`
	UserID           string `json:"userId"`
	UserName         string `json:"userName"`
	TimeSpentMinutes int    `json:"timeSpentMinutes"`
	Description      string `json:"description"`
	LoggedAt         string `json:"loggedAt"`
}

type DocVersionSnapshot struct {
	ID            string `json:"id"`
	DocID         string `json:"docId"`
	VersionNumber int    `json:"versionNumber"`
	Title         string `json:"title"`
	Summary       string `json:"summary"`
	Author        string `json:"author"`
	CreatedAt     string `json:"createdAt"`
	Size          int    `json:"size"`
}

type DocCommentReply struct {
	ID        string `json:"id"`
	Author    string `json:"author"`
	Content   string `json:"content"`
	CreatedAt string `json:"createdAt"`
}

type DocComment struct {
	ID        string            `json:"id"`
	DocID     string            `json:"docId"`
	BlockID   string            `json:"blockId"`
	Author    string            `json:"author"`
	Content   string            `json:"content"`
	Resolved  bool              `json:"resolved"`
	CreatedAt string            `json:"createdAt"`
	Replies   []DocCommentReply `json:"replies"`
}

type DocLinkedIssue struct {
	IssueID     string `json:"issueId"`
	Title       string `json:"title"`
	Status      string `json:"status"`
	Priority    string `json:"priority"`
	Assignee    string `json:"assignee"`
}

type OfficeParticipant struct {
	UserID          string `json:"userId"`
	UserName        string `json:"userName"`
	AvatarURL       string `json:"avatarUrl"`
	IsMuted         bool   `json:"isMuted"`
	IsVideoOn       bool   `json:"isVideoOn"`
	IsScreenSharing bool   `json:"isScreenSharing"`
	JoinedAt        string `json:"joinedAt"`
}

type OfficeRoom struct {
	ID           string              `json:"id"`
	WorkspaceID  string              `json:"workspaceId"`
	Name         string              `json:"name"`
	Type         string              `json:"type"` // "open_lounge", "meeting", "focus", "pair_programming"
	Description  string              `json:"description"`
	Capacity     int                 `json:"capacity"`
	IsLocked     bool                `json:"isLocked"`
	Participants []OfficeParticipant `json:"participants"`
	CreatedAt    string              `json:"createdAt"`
}

type OfficeMediaStateRequest struct {
	UserID          string `json:"userId"`
	IsMuted         *bool  `json:"isMuted,omitempty"`
	IsVideoOn       *bool  `json:"isVideoOn,omitempty"`
	IsScreenSharing *bool  `json:"isScreenSharing,omitempty"`
}

type OfficeJoinRequest struct {
	UserID    string `json:"userId"`
	UserName  string `json:"userName"`
	AvatarURL string `json:"avatarUrl"`
}

type WorkspaceSearchResult struct {
	ID        string `json:"id"`
	Module    string `json:"module"` // "tracker" | "docs" | "chat" | "office"
	Title     string `json:"title"`
	Snippet   string `json:"snippet"`
	URL       string `json:"url"`
	Metadata  string `json:"metadata,omitempty"`
	CreatedAt string `json:"createdAt"`
}

type WorkspaceActivityItem struct {
	ID          string `json:"id"`
	WorkspaceID string `json:"workspaceId"`
	ActorID     string `json:"actorId"`
	ActorName   string `json:"actorName"`
	ActorAvatar string `json:"actorAvatar"`
	Module      string `json:"module"` // "tracker" | "docs" | "chat" | "office"
	Action      string `json:"action"` // "created_issue" | "completed_task" | "edited_doc" | "posted_message" | "joined_room"
	TargetTitle string `json:"targetTitle"`
	TargetURL   string `json:"targetUrl"`
	Details     string `json:"details,omitempty"`
	CreatedAt   string `json:"createdAt"`
}

type WorkspaceNotification struct {
	ID          string `json:"id"`
	WorkspaceID string `json:"workspaceId"`
	UserID      string `json:"userId"`
	ActorName   string `json:"actorName"`
	ActorAvatar string `json:"actorAvatar"`
	Module      string `json:"module"`
	Title       string `json:"title"`
	Body        string `json:"body"`
	TargetURL   string `json:"targetUrl"`
	IsRead      bool   `json:"isRead"`
	CreatedAt   string `json:"createdAt"`
}

type CalendarEvent struct {
	ID          string `json:"id"`
	WorkspaceID string `json:"workspaceId"`
	Title       string `json:"title"`
	Description string `json:"description,omitempty"`
	StartTime   string `json:"startTime"`
	EndTime     string `json:"endTime"`
	AllDay      bool   `json:"allDay"`
	Color       string `json:"color"`
	Location    string `json:"location,omitempty"`
	IssueID     string `json:"issueId,omitempty"`
	IssueKey    string `json:"issueKey,omitempty"`
	RoomID      string `json:"roomId,omitempty"`
	RoomName    string `json:"roomName,omitempty"`
	CreatedBy   string `json:"createdBy"`
	CreatedAt   string `json:"createdAt"`
	UpdatedAt   string `json:"updatedAt"`
}

type CrmContact struct {
	ID          string  `json:"id"`
	WorkspaceID string  `json:"workspaceId"`
	Name        string  `json:"name"`
	Email       string  `json:"email"`
	Phone       string  `json:"phone,omitempty"`
	Company     string  `json:"company,omitempty"`
	Stage       string  `json:"stage,omitempty"`
	AssignedTo  string  `json:"assignedTo,omitempty"`
	Value       float64 `json:"value,omitempty"`
	Notes       string  `json:"notes,omitempty"`
	CreatedAt   string  `json:"createdAt"`
	UpdatedAt   string  `json:"updatedAt"`
}

type CrmDeal struct {
	ID                string  `json:"id"`
	WorkspaceID       string  `json:"workspaceId"`
	Title             string  `json:"title"`
	Value             float64 `json:"value"`
	Currency          string  `json:"currency"`
	Stage             string  `json:"stage"` // "lead", "qualified", "proposal", "negotiation", "won", "lost"
	ContactID         string  `json:"contactId,omitempty"`
	ContactName       string  `json:"contactName,omitempty"`
	Probability       int     `json:"probability"`
	ExpectedCloseDate string  `json:"expectedCloseDate,omitempty"`
	Notes             string  `json:"notes,omitempty"`
	CreatedAt         string  `json:"createdAt"`
	UpdatedAt         string  `json:"updatedAt"`
}

type AtsCandidate struct {
	ID          string `json:"id"`
	WorkspaceID string `json:"workspaceId"`
	Name        string `json:"name"`
	Email       string `json:"email"`
	Phone       string `json:"phone,omitempty"`
	Role        string `json:"role"`
	Stage       string `json:"stage"` // "sourced", "screening", "interview", "offer", "hired", "rejected"
	ResumeURL   string `json:"resumeUrl,omitempty"`
	Rating      int    `json:"rating"`
	Notes       string `json:"notes,omitempty"`
	RoomID      string `json:"roomId,omitempty"`
	RoomName    string `json:"roomName,omitempty"`
	CreatedAt   string `json:"createdAt"`
	UpdatedAt   string `json:"updatedAt"`
}

type TrackerGitHubLink struct {
	ID        string `json:"id"`
	IssueID   string `json:"issueId"`
	Type      string `json:"type"` // "commit", "pull_request", "branch"
	Title     string `json:"title"`
	URL       string `json:"url"`
	Number    int    `json:"number,omitempty"`
	Status    string `json:"status,omitempty"` // "open", "merged", "closed"
	Author    string `json:"author"`
	Timestamp string `json:"timestamp"`
}

type ChatAttachment struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Size     int64  `json:"size"`
	MimeType string `json:"mimeType"`
	URL      string `json:"url"`
}

type ChatReaction struct {
	Emoji string   `json:"emoji"`
	Users []string `json:"users"`
	Count int      `json:"count"`
}

type ChatMessage struct {
	ID           string           `json:"id"`
	WorkspaceID  string           `json:"workspaceId"`
	ChannelID    string           `json:"channelId"`
	DMID         string           `json:"dmId"`
	ParentID     string           `json:"parentId"`
	SenderID     string           `json:"senderId"`
	SenderName   string           `json:"senderName"`
	SenderAvatar string           `json:"senderAvatar"`
	Content      string           `json:"content"`
	Mentions     []string         `json:"mentions"`
	Attachments  []ChatAttachment `json:"attachments"`
	Reactions    []ChatReaction   `json:"reactions"`
	ThreadCount  int              `json:"threadCount"`
	CreatedAt    string           `json:"createdAt"`
	UpdatedAt    string           `json:"updatedAt"`
}

type ChatChannel struct {
	ID          string   `json:"id"`
	WorkspaceID string   `json:"workspaceId"`
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Topic       string   `json:"topic"`
	IsPrivate   bool     `json:"isPrivate"`
	Members     []string `json:"members"`
	UnreadCount int      `json:"unreadCount"`
	CreatedAt   string   `json:"createdAt"`
}

type DirectMessageConv struct {
	ID          string   `json:"id"`
	WorkspaceID string   `json:"workspaceId"`
	Members     []string `json:"members"`
	LastMessage string   `json:"lastMessage"`
	UnreadCount int      `json:"unreadCount"`
	UpdatedAt   string   `json:"updatedAt"`
}

type Server struct {
	cfg                Config
	pool               *nbstore.DocStoragePool
	hub                *Hub
	mux                *http.ServeMux
	authState          *AuthState
	chatMu             sync.RWMutex
	chatPrompts        map[string]string
	workspaceModulesMu sync.RWMutex
	workspaceModules   map[string]WorkspaceModuleSettings
	workspaceMembersMu sync.RWMutex
	workspaceMembers   map[string][]WorkspaceMemberItem
	trackerMu          sync.RWMutex
	trackerProjects    map[string][]TrackerProject
	trackerIssues      map[string][]TrackerIssue
	trackerSprints     map[string][]TrackerSprint
	trackerLabels      map[string][]TrackerLabel
	chatStoreMu        sync.RWMutex
	chatChannels       map[string][]ChatChannel
	chatMessages       map[string][]ChatMessage
	chatDMs            map[string][]DirectMessageConv
	chatTypingStatus   map[string]map[string]time.Time
	docCollabMu        sync.RWMutex
	docVersions        map[string][]DocVersionSnapshot
	docComments        map[string][]DocComment
	docLinkedIssues    map[string][]string
	officeMu           sync.RWMutex
	officeRooms        map[string][]OfficeRoom
	activityMu         sync.RWMutex
	activityFeed       map[string][]WorkspaceActivityItem
	notificationsMu    sync.RWMutex
	notifications      map[string][]WorkspaceNotification
	calendarMu         sync.RWMutex
	calendarEvents     map[string][]CalendarEvent
	crmMu              sync.RWMutex
	crmContacts        map[string][]CrmContact
	crmDeals           map[string][]CrmDeal
	atsCandidates      map[string][]AtsCandidate
	trackerGitHubMu    sync.RWMutex
	trackerGitHubLinks map[string][]TrackerGitHubLink
}

func NewServer(cfg Config) *Server {
	pool := nbstore.NewDocStoragePool()
	hub := NewHub(pool)
	go hub.Run()

	defaultUser := UserInfo{
		ID:            "user-dev",
		Name:          "Aurobindo Patra",
		Email:         "patraabhimanyu888@gmail.com",
		EmailVerified: true,
		HasPassword:   true,
		AvatarURL:     "",
		Features:      []string{},
	}

	authState := &AuthState{
		loggedOut:   false,
		defaultUser: defaultUser,
		sessions:    make(map[string]UserInfo),
	}

	s := &Server{
		cfg:              cfg,
		pool:             pool,
		hub:              hub,
		mux:              http.NewServeMux(),
		authState:        authState,
		chatPrompts:      make(map[string]string),
		workspaceModules: make(map[string]WorkspaceModuleSettings),
		workspaceMembers: make(map[string][]WorkspaceMemberItem),
		trackerProjects:  make(map[string][]TrackerProject),
		trackerIssues:    make(map[string][]TrackerIssue),
		trackerSprints:   make(map[string][]TrackerSprint),
		trackerLabels:    make(map[string][]TrackerLabel),
		chatChannels:     make(map[string][]ChatChannel),
		chatMessages:     make(map[string][]ChatMessage),
		chatDMs:          make(map[string][]DirectMessageConv),
		chatTypingStatus: make(map[string]map[string]time.Time),
		docVersions:      make(map[string][]DocVersionSnapshot),
		docComments:      make(map[string][]DocComment),
		docLinkedIssues:  make(map[string][]string),
		officeRooms:      make(map[string][]OfficeRoom),
		activityFeed:     make(map[string][]WorkspaceActivityItem),
		notifications:    make(map[string][]WorkspaceNotification),
		calendarEvents:   make(map[string][]CalendarEvent),
		crmContacts:      make(map[string][]CrmContact),
		crmDeals:           make(map[string][]CrmDeal),
		atsCandidates:      make(map[string][]AtsCandidate),
		trackerGitHubLinks: make(map[string][]TrackerGitHubLink),
	}

	s.routes()
	return s
}

func (s *Server) routes() {
	// Root & Installer (User-Agent detection: curl -> install.sh, powershell -> install.ps1)
	s.mux.HandleFunc("GET /{$}", s.handleRootOrInstaller)
	s.mux.HandleFunc("GET /install.sh", s.handleInstallSh)
	s.mux.HandleFunc("GET /install.ps1", s.handleInstallPs1)
	s.mux.HandleFunc("GET /install", s.handleInstallAuto)

	s.mux.HandleFunc("GET /api/v1/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{
			"status":    "healthy",
			"timestamp": time.Now().UTC(),
			"runtime":   "golang",
		})
	})
	s.mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{
			"status":    "healthy",
			"timestamp": time.Now().UTC(),
			"runtime":   "golang",
		})
	})

	// Auth Endpoints (Web & Native - both POST and GET supported for preflight/methods)
	for _, prefix := range []string{"/api/auth", "/api/v1/auth"} {
		s.mux.HandleFunc("POST "+prefix+"/preflight", s.handlePreflight)
		s.mux.HandleFunc("GET "+prefix+"/preflight", s.handlePreflight)
		s.mux.HandleFunc("GET "+prefix+"/session", s.handleSession)
		s.mux.HandleFunc("GET "+prefix+"/methods", s.handleMethods)
		s.mux.HandleFunc("POST "+prefix+"/sign-in", s.handleSignIn)
		s.mux.HandleFunc("POST "+prefix+"/sign-out", s.handleSignOut)
		s.mux.HandleFunc("POST "+prefix+"/magic-link", s.handleMagicLink)
		s.mux.HandleFunc("POST "+prefix+"/captcha", s.handleCaptcha)
		s.mux.HandleFunc("GET "+prefix+"/sessions", s.handleListSessions)
		s.mux.HandleFunc("POST "+prefix+"/sessions/revoke-all", s.handleRevokeAllSessions)
		s.mux.HandleFunc("DELETE "+prefix+"/sessions/{id}", s.handleRevokeSession)
		s.mux.HandleFunc("POST "+prefix+"/verify", s.handleVerifyToken)
		s.mux.HandleFunc("POST "+prefix+"/open-app/sign-in", s.handleSignIn)
	}

	// OAuth Endpoints
	for _, prefix := range []string{"/api/oauth", "/api/v1/oauth"} {
		s.mux.HandleFunc("POST "+prefix+"/preflight", s.handleOAuthPreflight)
		s.mux.HandleFunc("GET "+prefix+"/login", s.handleOAuthLogin)
		s.mux.HandleFunc("GET "+prefix+"/callback", s.handleOAuthLogin)
		s.mux.HandleFunc("POST "+prefix+"/callback", s.handleOAuthLogin)
	}
	s.mux.HandleFunc("GET /oauth/login", s.handleOAuthLogin)
	s.mux.HandleFunc("GET /oauth/callback", s.handleOAuthLogin)

	// Download Endpoints (System-wise direct download)
	s.mux.HandleFunc("GET /api/download", s.handleDownload)
	s.mux.HandleFunc("GET /api/v1/download", s.handleDownload)

	// Workspace Endpoints (both /api/workspaces and /api/v1/workspaces)
	for _, prefix := range []string{"/api/workspaces", "/api/v1/workspaces"} {
		s.mux.HandleFunc("POST "+prefix+"/init", s.handleWorkspaceInit)
		s.mux.HandleFunc("GET "+prefix+"/{workspace_id}/modules", s.handleGetWorkspaceModules)
		s.mux.HandleFunc("POST "+prefix+"/{workspace_id}/modules", s.handleUpdateWorkspaceModules)
		s.mux.HandleFunc("PATCH "+prefix+"/{workspace_id}/modules", s.handleUpdateWorkspaceModules)
		s.mux.HandleFunc("GET "+prefix+"/{workspace_id}/members", s.handleGetWorkspaceMembers)
		s.mux.HandleFunc("POST "+prefix+"/{workspace_id}/members/invite", s.handleInviteWorkspaceMember)
		s.mux.HandleFunc("PATCH "+prefix+"/{workspace_id}/members/{user_id}", s.handleUpdateWorkspaceMember)
		s.mux.HandleFunc("DELETE "+prefix+"/{workspace_id}/members/{user_id}", s.handleDeleteWorkspaceMember)
		// Tracker Projects & Issues
		s.mux.HandleFunc("GET "+prefix+"/{workspace_id}/projects", s.handleGetTrackerProjects)
		s.mux.HandleFunc("POST "+prefix+"/{workspace_id}/projects", s.handleCreateTrackerProject)
		s.mux.HandleFunc("GET "+prefix+"/{workspace_id}/issues", s.handleGetTrackerIssues)
		s.mux.HandleFunc("POST "+prefix+"/{workspace_id}/issues", s.handleCreateTrackerIssue)
		s.mux.HandleFunc("GET "+prefix+"/{workspace_id}/issues/{issue_id}", s.handleGetTrackerIssueDetail)
		s.mux.HandleFunc("PATCH "+prefix+"/{workspace_id}/issues/{issue_id}", s.handleUpdateTrackerIssue)
		s.mux.HandleFunc("DELETE "+prefix+"/{workspace_id}/issues/{issue_id}", s.handleDeleteTrackerIssue)
		s.mux.HandleFunc("POST "+prefix+"/{workspace_id}/issues/{issue_id}/comments", s.handleAddTrackerComment)
		s.mux.HandleFunc("GET "+prefix+"/{workspace_id}/issues/{issue_id}/timelogs", s.handleGetIssueTimeLogs)
		s.mux.HandleFunc("POST "+prefix+"/{workspace_id}/issues/{issue_id}/timelogs", s.handleCreateIssueTimeLog)
		s.mux.HandleFunc("GET "+prefix+"/{workspace_id}/timelogs", s.handleGetWorkspaceTimeLogs)
		s.mux.HandleFunc("GET "+prefix+"/{workspace_id}/sprints", s.handleGetTrackerSprints)
		s.mux.HandleFunc("POST "+prefix+"/{workspace_id}/sprints", s.handleCreateTrackerSprint)
		s.mux.HandleFunc("PATCH "+prefix+"/{workspace_id}/sprints/{sprint_id}", s.handleUpdateTrackerSprint)
		s.mux.HandleFunc("GET "+prefix+"/{workspace_id}/labels", s.handleGetTrackerLabels)
		s.mux.HandleFunc("POST "+prefix+"/{workspace_id}/labels", s.handleCreateTrackerLabel)
		// Chat Channels, Messages, Threads & DMs
		s.mux.HandleFunc("GET "+prefix+"/{workspace_id}/channels", s.handleGetChatChannels)
		s.mux.HandleFunc("POST "+prefix+"/{workspace_id}/channels", s.handleCreateChatChannel)
		s.mux.HandleFunc("GET "+prefix+"/{workspace_id}/channels/{channel_id}/messages", s.handleGetChannelMessages)
		s.mux.HandleFunc("POST "+prefix+"/{workspace_id}/channels/{channel_id}/messages", s.handlePostChannelMessage)
		s.mux.HandleFunc("GET "+prefix+"/{workspace_id}/messages/{message_id}/thread", s.handleGetMessageThread)
		s.mux.HandleFunc("POST "+prefix+"/{workspace_id}/messages/{message_id}/reactions", s.handleToggleMessageReaction)
		s.mux.HandleFunc("GET "+prefix+"/{workspace_id}/dms", s.handleGetDirectMessages)
		s.mux.HandleFunc("POST "+prefix+"/{workspace_id}/dms", s.handleCreateDirectMessage)
		s.mux.HandleFunc("POST "+prefix+"/{workspace_id}/chat/typing", s.handleChatTyping)
		s.mux.HandleFunc("GET "+prefix+"/{workspace_id}/chat/typing", s.handleGetChatTyping)
		s.mux.HandleFunc("GET "+prefix+"/{workspace_id}/docs/{doc_id}", s.handleGetDoc)
		s.mux.HandleFunc("POST "+prefix+"/{workspace_id}/docs/{doc_id}/update", s.handlePushDocUpdate)
		s.mux.HandleFunc("DELETE "+prefix+"/{workspace_id}/docs/{doc_id}", s.handleDeleteDoc)
		// Collaborative Documents: Version History, Comments & Issue Linking
		s.mux.HandleFunc("GET "+prefix+"/{workspace_id}/docs/{doc_id}/linked-issues", s.handleGetDocLinkedIssues)
		s.mux.HandleFunc("POST "+prefix+"/{workspace_id}/docs/{doc_id}/linked-issues", s.handleLinkDocIssue)
		s.mux.HandleFunc("DELETE "+prefix+"/{workspace_id}/docs/{doc_id}/linked-issues/{issue_id}", s.handleUnlinkDocIssue)
		s.mux.HandleFunc("GET "+prefix+"/{workspace_id}/docs/{doc_id}/versions", s.handleGetDocVersions)
		s.mux.HandleFunc("POST "+prefix+"/{workspace_id}/docs/{doc_id}/versions", s.handleCreateDocVersion)
		s.mux.HandleFunc("POST "+prefix+"/{workspace_id}/docs/{doc_id}/versions/{version_id}/restore", s.handleRestoreDocVersion)
		s.mux.HandleFunc("GET "+prefix+"/{workspace_id}/docs/{doc_id}/comments", s.handleGetDocComments)
		s.mux.HandleFunc("POST "+prefix+"/{workspace_id}/docs/{doc_id}/comments", s.handleCreateDocComment)
		s.mux.HandleFunc("POST "+prefix+"/{workspace_id}/docs/{doc_id}/comments/{comment_id}/replies", s.handleReplyDocComment)
		s.mux.HandleFunc("PATCH "+prefix+"/{workspace_id}/docs/{doc_id}/comments/{comment_id}/resolve", s.handleResolveDocComment)

		// Virtual Office (Phase 5: Rooms, Presence, Signaling & Media State)
		s.mux.HandleFunc("GET "+prefix+"/{workspace_id}/office/rooms", s.handleGetOfficeRooms)
		s.mux.HandleFunc("POST "+prefix+"/{workspace_id}/office/rooms", s.handleCreateOfficeRoom)
		s.mux.HandleFunc("POST "+prefix+"/{workspace_id}/office/rooms/{room_id}/join", s.handleJoinOfficeRoom)
		s.mux.HandleFunc("POST "+prefix+"/{workspace_id}/office/rooms/{room_id}/leave", s.handleLeaveOfficeRoom)
		s.mux.HandleFunc("POST "+prefix+"/{workspace_id}/office/rooms/{room_id}/media-state", s.handleUpdateOfficeMediaState)

		// Cross-Feature Extras (Phase 6: Global Search, Activity Feed, Notification Center)
		s.mux.HandleFunc("GET "+prefix+"/{workspace_id}/search", s.handleGlobalSearch)
		s.mux.HandleFunc("GET "+prefix+"/{workspace_id}/activity", s.handleGetActivityFeed)
		s.mux.HandleFunc("POST "+prefix+"/{workspace_id}/activity", s.handlePostActivity)
		s.mux.HandleFunc("GET "+prefix+"/{workspace_id}/notifications", s.handleGetNotifications)
		s.mux.HandleFunc("PATCH "+prefix+"/{workspace_id}/notifications/{notification_id}/read", s.handleMarkNotificationRead)
		s.mux.HandleFunc("POST "+prefix+"/{workspace_id}/notifications/read-all", s.handleMarkAllNotificationsRead)

		// Calendar & Scheduling (Batch 2: Team Schedules, Deadlines & Room Meetings)
		s.mux.HandleFunc("GET "+prefix+"/{workspace_id}/calendar/events", s.handleGetCalendarEvents)
		s.mux.HandleFunc("POST "+prefix+"/{workspace_id}/calendar/events", s.handleCreateCalendarEvent)
		s.mux.HandleFunc("PATCH "+prefix+"/{workspace_id}/calendar/events/{event_id}", s.handleUpdateCalendarEvent)
		s.mux.HandleFunc("DELETE "+prefix+"/{workspace_id}/calendar/events/{event_id}", s.handleDeleteCalendarEvent)

		// CRM & ATS Pipelines (Batch 3: Sales Deals, Contacts & Candidate Evaluations)
		s.mux.HandleFunc("GET "+prefix+"/{workspace_id}/crm/contacts", s.handleGetCrmContacts)
		s.mux.HandleFunc("POST "+prefix+"/{workspace_id}/crm/contacts", s.handleCreateCrmContact)
		s.mux.HandleFunc("GET "+prefix+"/{workspace_id}/crm/deals", s.handleGetCrmDeals)
		s.mux.HandleFunc("POST "+prefix+"/{workspace_id}/crm/deals", s.handleCreateCrmDeal)
		s.mux.HandleFunc("PATCH "+prefix+"/{workspace_id}/crm/deals/{deal_id}", s.handleUpdateCrmDeal)
		s.mux.HandleFunc("DELETE "+prefix+"/{workspace_id}/crm/deals/{deal_id}", s.handleDeleteCrmDeal)

		s.mux.HandleFunc("GET "+prefix+"/{workspace_id}/ats/candidates", s.handleGetAtsCandidates)
		s.mux.HandleFunc("POST "+prefix+"/{workspace_id}/ats/candidates", s.handleCreateAtsCandidate)
		s.mux.HandleFunc("PATCH "+prefix+"/{workspace_id}/ats/candidates/{candidate_id}", s.handleUpdateAtsCandidate)
		s.mux.HandleFunc("DELETE "+prefix+"/{workspace_id}/ats/candidates/{candidate_id}", s.handleDeleteAtsCandidate)

		// GitHub Two-Way Sync (Batch 4: Webhooks, PR & Commit Linking)
		s.mux.HandleFunc("GET "+prefix+"/{workspace_id}/issues/{issue_id}/github", s.handleGetIssueGitHubLinks)
		s.mux.HandleFunc("POST "+prefix+"/{workspace_id}/issues/{issue_id}/github", s.handleLinkIssueGitHubItem)
		s.mux.HandleFunc("POST "+prefix+"/{workspace_id}/integrations/github/webhook", s.handleGitHubWebhook)
		s.mux.HandleFunc("PUT "+prefix+"/{workspace_id}/blobs/{key}", s.handlePutBlob)
		s.mux.HandleFunc("GET "+prefix+"/{workspace_id}/blobs/{key}", s.handleGetBlob)
		s.mux.HandleFunc("GET "+prefix+"/{workspace_id}/blobs/v1/{key}", s.handleGetBlob)
		s.mux.HandleFunc("GET "+prefix+"/{workspace_id}/blob-manifest/v1", s.handleBlobManifest)
		s.mux.HandleFunc("GET "+prefix+"/{workspace_id}/readable-blob-manifest/v1", s.handleBlobManifest)
		s.mux.HandleFunc("GET "+prefix+"/{workspace_id}/public-docs/{doc_id}", s.handleGetDoc)
		s.mux.HandleFunc("GET "+prefix+"/{workspace_id}/public-docs/{doc_id}/root-doc", s.handleGetDoc)
	}

	// Telemetry Endpoints
	for _, prefix := range []string{"/api/telemetry", "/api/v1/telemetry"} {
		s.mux.HandleFunc("POST "+prefix+"/collect", s.handleTelemetry)
	}

	// Socket.IO / Engine.IO v4 Handshake & Realtime
	s.mux.HandleFunc("/socket.io/", s.handleSocketIO)

	// AI & Tokenizer
	s.mux.HandleFunc("POST /api/v1/ai/tokenizer/count", s.handleTokenCount)

	// Copilot AI Core Endpoints (Phase 1)
	s.mux.HandleFunc("GET /api/copilot/models", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{
			"models": []map[string]any{
				{
					"id":               "auto",
					"name":             "Auto (Intelligent Router)",
					"provider":         "nexio",
					"speed":            "fast",
					"intelligence":     "smart",
					"cost":             "$$",
					"contextWindow":    128000,
					"creditMultiplier": 1,
					"description":      "Dynamic complexity routing with automatic retry fallback.",
					"isAutoRouter":     true,
				},
				{
					"id":               "gpt-4o",
					"name":             "GPT-4o",
					"provider":         "openai",
					"speed":            "fast",
					"intelligence":     "smart",
					"cost":             "$$$",
					"contextWindow":    128000,
					"creditMultiplier": 5,
					"description":      "Flagship omni model for complex reasoning, multi-step code, and analysis.",
				},
				{
					"id":               "gpt-4o-mini",
					"name":             "GPT-4o Mini",
					"provider":         "openai",
					"speed":            "fast",
					"intelligence":     "standard",
					"cost":             "$",
					"contextWindow":    128000,
					"creditMultiplier": 1,
					"description":      "Ultra-fast, cost-effective model for summaries, translations, and everyday tasks.",
				},
				{
					"id":               "claude-3-5-sonnet",
					"name":             "Claude 3.5 Sonnet",
					"provider":         "anthropic",
					"speed":            "medium",
					"intelligence":     "smart",
					"cost":             "$$$",
					"contextWindow":    200000,
					"creditMultiplier": 5,
					"description":      "State-of-the-art reasoning, deep coding, and nuanced writing.",
				},
				{
					"id":               "claude-3-5-haiku",
					"name":             "Claude 3.5 Haiku",
					"provider":         "anthropic",
					"speed":            "fast",
					"intelligence":     "standard",
					"cost":             "$",
					"contextWindow":    200000,
					"creditMultiplier": 1,
					"description":      "Blazing fast model for quick edits and lightweight processing.",
				},
				{
					"id":               "gemini-1.5-pro",
					"name":             "Gemini 1.5 Pro",
					"provider":         "gemini",
					"speed":            "medium",
					"intelligence":     "high",
					"cost":             "$$",
					"contextWindow":    1000000,
					"creditMultiplier": 3,
					"description":      "1M token context window for large documents and multi-file analysis.",
				},
				{
					"id":               "gemini-1.5-flash",
					"name":             "Gemini 1.5 Flash",
					"provider":         "gemini",
					"speed":            "fast",
					"intelligence":     "standard",
					"cost":             "$",
					"contextWindow":    1000000,
					"creditMultiplier": 1,
					"description":      "High-speed, lightweight multimodal model.",
				},
			},
			"default": map[string]any{
				"id":   "auto",
				"name": "Auto (Intelligent Router)",
			},
		})
	})

	// Copilot SSE Streaming Endpoints
	for _, prefix := range []string{"/api/copilot", "/api/v1/copilot"} {
		s.mux.HandleFunc("GET "+prefix+"/chat/{sessionId}/stream-object", s.handleCopilotChatStream)
		s.mux.HandleFunc("GET "+prefix+"/chat/{sessionId}/stream", s.handleCopilotChatStream)
		s.mux.HandleFunc("GET "+prefix+"/actions/{sessionId}/stream", s.handleCopilotChatStream)
		s.mux.HandleFunc("POST "+prefix+"/chat/{sessionId}/stream-object", s.handleCopilotChatStream)
		s.mux.HandleFunc("POST "+prefix+"/chat/{sessionId}/stream", s.handleCopilotChatStream)
		s.mux.HandleFunc("POST "+prefix+"/actions/{sessionId}/stream", s.handleCopilotChatStream)
	}

	s.mux.HandleFunc("POST /api/copilot/route", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Prompt         string `json:"prompt"`
			RequestedModel string `json:"requestedModel"`
			Priority       string `json:"priority"`
		}
		json.NewDecoder(r.Body).Decode(&req)
		selected := "gpt-4o-mini"
		complexity := "simple"
		reasoning := "Task routed to fast, cost-effective model."
		if req.RequestedModel != "" && req.RequestedModel != "auto" {
			selected = req.RequestedModel
			complexity = "medium"
			reasoning = "User explicitly specified model: " + req.RequestedModel
		} else if strings.Contains(strings.ToLower(req.Prompt), "code") || strings.Contains(strings.ToLower(req.Prompt), "architect") || len(req.Prompt) > 500 {
			selected = "gpt-4o"
			complexity = "complex"
			reasoning = "Complex code/reasoning task detected; routed to flagship model."
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{
			"selectedModel": map[string]any{
				"id": selected,
			},
			"taskComplexity": complexity,
			"reasoning":      reasoning,
			"fallbackCandidates": []string{
				"claude-3-5-sonnet",
				"gemini-1.5-pro",
				"gpt-4o-mini",
			},
		})
	})

	s.mux.HandleFunc("GET /api/copilot/credits", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{
			"balance":      1000,
			"lifetimeUsed": 0,
			"transactions": []any{},
		})
	})

	s.mux.HandleFunc("GET /api/copilot/byok", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{
			"keys": []any{},
		})
	})

	// Agents & Sub-agents (Phase 2)
	s.mux.HandleFunc("GET /api/copilot/agents", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{
			"agents": []map[string]any{
				{
					"id":               "sys-researcher",
					"name":             "Research Analyst",
					"description":      "Autonomous research agent that surveys context and compiles structured insights.",
					"systemPrompt":     "You are an expert Research Analyst. Extract facts and summarize findings.",
					"modelId":          "gemini-1.5-pro",
					"isReviewRequired": false,
					"isSystem":         true,
					"subAgents":        []string{},
				},
				{
					"id":               "sys-architect",
					"name":             "Code Architect",
					"description":      "Senior engineer agent for architectural reviews, refactoring, and code generation.",
					"systemPrompt":     "You are a Principal Software Architect. Propose robust, typed designs.",
					"modelId":          "gpt-4o",
					"isReviewRequired": true,
					"isSystem":         true,
					"subAgents":        []string{"sys-researcher"},
				},
				{
					"id":               "sys-editor",
					"name":             "Editorial Lead",
					"description":      "Writing and content optimization agent for clarity, tone, and formatting.",
					"systemPrompt":     "You are an Editorial Director. Polish prose and maintain consistency.",
					"modelId":          "claude-3-5-sonnet",
					"isReviewRequired": false,
					"isSystem":         true,
					"subAgents":        []string{},
				},
			},
		})
	})

	s.mux.HandleFunc("POST /api/copilot/agents", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Name             string   `json:"name"`
			Description      string   `json:"description"`
			SystemPrompt     string   `json:"systemPrompt"`
			ModelId          string   `json:"modelId"`
			IsReviewRequired bool     `json:"isReviewRequired"`
			SubAgents        []string `json:"subAgents"`
		}
		json.NewDecoder(r.Body).Decode(&req)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{
			"success": true,
			"agent": map[string]any{
				"id":               fmt.Sprintf("agent-%d", time.Now().UnixNano()),
				"name":             req.Name,
				"description":      req.Description,
				"systemPrompt":     req.SystemPrompt,
				"modelId":          req.ModelId,
				"isReviewRequired": req.IsReviewRequired,
				"subAgents":        req.SubAgents,
			},
		})
	})

	s.mux.HandleFunc("GET /api/copilot/tasks", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{
			"tasks": []any{},
		})
	})

	s.mux.HandleFunc("POST /api/copilot/tasks/{id}/approve", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{
			"success": true,
			"task": map[string]any{
				"reviewStatus": "approved",
				"status":       "done",
			},
		})
	})

	s.mux.HandleFunc("POST /api/copilot/tasks/{id}/reject", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{
			"success": true,
			"task": map[string]any{
				"reviewStatus": "rejected",
				"status":       "done",
			},
		})
	})

	// Skills & MCP Endpoints (Phase 3)
	s.mux.HandleFunc("GET /api/copilot/skills", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{
			"skills": []map[string]any{
				{
					"id":          "skill-summarize-meeting",
					"name":        "Summarize Meeting",
					"slug":        "summarize-meeting",
					"description": "Summarize meeting notes, key decisions, action items, and owners.",
					"version":     "1.0.0",
					"isPublic":    true,
					"isSystem":    true,
					"frontmatter": map[string]any{"tags": []string{"meeting", "summary"}},
					"content":     "You are an executive assistant. Summarize meeting decisions and action items:\n\n{{input}}",
				},
				{
					"id":          "skill-code-review",
					"name":        "Code Review & Refactor",
					"slug":        "code-review",
					"description": "Review code for security, performance, clean architecture, and edge cases.",
					"version":     "1.0.0",
					"isPublic":    true,
					"isSystem":    true,
					"frontmatter": map[string]any{"tags": []string{"engineering", "code-review"}},
					"content":     "You are a Principal Software Architect. Review this code:\n\n{{input}}",
				},
				{
					"id":          "skill-generate-diagram",
					"name":        "Generate Architecture Diagram",
					"slug":        "generate-diagram",
					"description": "Create clear Mermaid.js architecture diagrams from text specifications.",
					"version":     "1.0.0",
					"isPublic":    true,
					"isSystem":    true,
					"frontmatter": map[string]any{"tags": []string{"diagram", "mermaid"}},
					"content":     "Generate a Mermaid diagram for:\n\n{{input}}",
				},
				{
					"id":          "skill-grammar-fix",
					"name":        "Tone & Grammar Polish",
					"slug":        "grammar-fix",
					"description": "Polish tone, grammar, and flow while preserving authentic voice.",
					"version":     "1.0.0",
					"isPublic":    true,
					"isSystem":    true,
					"frontmatter": map[string]any{"tags": []string{"writing", "polish"}},
					"content":     "Polish tone and grammar:\n\n{{input}}",
				},
			},
		})
	})

	s.mux.HandleFunc("POST /api/copilot/skills", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Name        string `json:"name"`
			Slug        string `json:"slug"`
			Description string `json:"description"`
			Content     string `json:"content"`
		}
		json.NewDecoder(r.Body).Decode(&req)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{
			"success": true,
			"skill": map[string]any{
				"id":          fmt.Sprintf("skill_%d", time.Now().UnixNano()),
				"name":        req.Name,
				"slug":        req.Slug,
				"description": req.Description,
				"version":     "1.0.0",
				"content":     req.Content,
			},
		})
	})

	s.mux.HandleFunc("POST /api/copilot/skills/execute", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Slug  string `json:"slug"`
			Input string `json:"input"`
		}
		json.NewDecoder(r.Body).Decode(&req)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{
			"skill":       req.Slug,
			"modelUsed":   "gpt-4o-mini",
			"costCredits": 5,
			"output":      fmt.Sprintf("[Executed Skill /%s]\n\nProcessed successfully with input: %s", req.Slug, req.Input),
		})
	})

	s.mux.HandleFunc("GET /api/copilot/mcp/server/tools", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{
			"tools": []map[string]any{
				{"name": "nexio_list_docs", "description": "List documents in Nexio"},
				{"name": "nexio_read_doc", "description": "Read document content by ID"},
				{"name": "nexio_search_docs", "description": "Search workspace documents"},
				{"name": "nexio_create_doc", "description": "Create document in Nexio"},
				{"name": "nexio_update_doc", "description": "Update existing document"},
				{"name": "nexio_list_databases", "description": "List database tables"},
			},
		})
	})

	s.mux.HandleFunc("GET /api/copilot/mcp/server/connections", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{
			"connections": []any{},
		})
	})

	s.mux.HandleFunc("POST /api/copilot/mcp/server/tokens", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			ClientName string `json:"clientName"`
		}
		json.NewDecoder(r.Body).Decode(&req)
		raw := fmt.Sprintf("nx_mcp_%d", time.Now().UnixNano())
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{
			"success":    true,
			"id":         fmt.Sprintf("conn_%d", time.Now().UnixNano()),
			"clientName": req.ClientName,
			"tokenMask":  "nx_mcp_••••" + raw[len(raw)-6:],
			"rawToken":   raw,
		})
	})

	s.mux.HandleFunc("GET /api/copilot/mcp/client/servers", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{
			"servers": []any{},
		})
	})

	s.mux.HandleFunc("GET /api/copilot/mcp/client/confirmations", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{
			"confirmations": []any{},
		})
	})

	// Phase 4: Control & Safety Endpoints
	s.mux.HandleFunc("GET /api/copilot/command-center/overview", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{
			"totalRequests":     42,
			"totalCreditsSpent": 180,
			"byFeature": []map[string]any{
				{"feature": "chat", "requests": 25, "credits": 50},
				{"feature": "agent_execution", "requests": 10, "credits": 100},
				{"feature": "skill_execution", "requests": 7, "credits": 30},
			},
			"byUser": []map[string]any{
				{"userId": "usr_default", "requests": 42, "credits": 180},
			},
			"byAgent": []map[string]any{
				{"target": "sys-researcher", "requests": 6, "credits": 60},
				{"target": "sys-architect", "requests": 4, "credits": 40},
			},
		})
	})

	s.mux.HandleFunc("GET /api/copilot/command-center/limits", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{
			"monthlyCreditLimit":    5000,
			"dailyCreditLimit":      1000,
			"alertThresholdPercent": 80,
			"currentMonthUsage":     180,
			"currentDayUsage":       45,
			"usagePercent":          4,
			"isAlertTriggered":      false,
			"hardLimitEnabled":      true,
		})
	})

	s.mux.HandleFunc("POST /api/copilot/command-center/limits", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{"success": true})
	})

	s.mux.HandleFunc("GET /api/copilot/command-center/policies", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{
			"allowedModels": []string{"auto", "gpt-4o", "gpt-4o-mini", "claude-3-5-sonnet", "gemini-1.5-flash"},
			"allowedAgents": []string{"sys-researcher", "sys-architect", "sys-editor"},
			"maxCreditPerRequest": 100,
			"requireApprovalForAgents": false,
		})
	})

	s.mux.HandleFunc("POST /api/copilot/command-center/policies", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{"success": true})
	})

	s.mux.HandleFunc("GET /api/copilot/documents/{id}/history", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{
			"history": []map[string]any{
				{
					"id":            "rev_1",
					"docId":         r.PathValue("id"),
					"authorType":    "user",
					"authorName":    "Human User",
					"changeSummary": "Initial document draft created.",
					"createdAt":     time.Now().Add(-2 * time.Hour).Format(time.RFC3339),
				},
				{
					"id":            "rev_2",
					"docId":         r.PathValue("id"),
					"authorType":    "agent",
					"authorName":    "Research Analyst",
					"changeSummary": "Enriched document with market analysis citations and structured outline.",
					"createdAt":     time.Now().Add(-1 * time.Hour).Format(time.RFC3339),
				},
			},
		})
	})

	s.mux.HandleFunc("GET /api/copilot/databases/{id}/permissions", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{
			"permissions": []map[string]any{
				{
					"id":           "perm_salary",
					"databaseId":   r.PathValue("id"),
					"propertyId":   "prop_salary",
					"propertyName": "Compensation / Salary",
					"allowedRoles": []string{"owner", "admin"},
					"allowedAgents": []string{},
					"canView":      false,
					"canEdit":      false,
				},
			},
		})
	})

	// Security & Hashcash
	s.mux.HandleFunc("POST /api/v1/security/hashcash/mint", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Resource string `json:"resource"`
			Bits     uint32 `json:"bits"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		stamp := hashcash.MintChallengeResponse(req.Resource, req.Bits)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{"stamp": stamp})
	})

	// Realtime WebSocket Collaboration
	s.mux.HandleFunc("GET /ws", s.hub.HandleWS)

	// GraphQL Gateway
	s.mux.HandleFunc("/graphql", s.handleGraphQL)
	s.mux.HandleFunc("/api/graphql", s.handleGraphQL)
	s.mux.HandleFunc("/api/v1/graphql", s.handleGraphQL)
}

func (s *Server) getStorage(workspaceID string) (*nbstore.SqliteDocStorage, error) {
	storage, err := s.pool.Get(workspaceID)
	if err == nil {
		return storage, nil
	}
	dbPath := filepath.Join(s.cfg.StoragePath, fmt.Sprintf("%s.db", workspaceID))
	return s.pool.Connect(workspaceID, dbPath)
}

func (s *Server) getSessionUser(r *http.Request) *UserInfo {
	s.authState.mu.RLock()
	defer s.authState.mu.RUnlock()

	if s.authState.loggedOut {
		return nil
	}

	var sessionID string
	if c, err := r.Cookie("affine_session"); err == nil && c.Value != "" {
		sessionID = c.Value
	} else if c, err := r.Cookie("nexio_session"); err == nil && c.Value != "" {
		sessionID = c.Value
	}

	if sessionID != "" {
		if u, ok := s.authState.sessions[sessionID]; ok {
			return &u
		}
	}

	authHeader := r.Header.Get("Authorization")
	if strings.HasPrefix(strings.ToLower(authHeader), "bearer ") {
		token := strings.TrimSpace(authHeader[7:])
		if u, ok := s.authState.sessions[token]; ok {
			return &u
		}
	}

	u := s.authState.defaultUser
	return &u
}

func (s *Server) handlePreflight(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"registered": true,
		"methods": map[string]any{
			"password":  map[string]any{"available": true},
			"magicLink": map[string]any{"available": true},
			"oauth": map[string]any{
				"available": true,
				"providers": []string{"Google"},
			},
			"passkey": map[string]any{
				"available":    false,
				"discoverable": false,
			},
		},
	})
}

func (s *Server) handleSession(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-store")
	u := s.getSessionUser(r)
	if u == nil {
		json.NewEncoder(w).Encode(map[string]any{
			"user": nil,
		})
		return
	}

	// Ensure cookie exists so browser preserves state
	if c, err := r.Cookie("affine_session"); err != nil || c.Value == "" {
		sessionID := fmt.Sprintf("sess_%d", time.Now().UnixNano())
		s.authState.mu.Lock()
		s.authState.sessions[sessionID] = *u
		s.authState.mu.Unlock()

		for _, cookieName := range []string{"affine_session", "nexio_session"} {
			http.SetCookie(w, &http.Cookie{
				Name:     cookieName,
				Value:    sessionID,
				Path:     "/",
				MaxAge:   86400 * 7,
				SameSite: http.SameSiteLaxMode,
			})
		}
		for _, cookieName := range []string{"affine_user_id", "nexio_user_id"} {
			http.SetCookie(w, &http.Cookie{
				Name:     cookieName,
				Value:    u.ID,
				Path:     "/",
				MaxAge:   86400 * 7,
				SameSite: http.SameSiteLaxMode,
			})
		}
		for _, cookieName := range []string{"affine_csrf_token", "nexio_csrf_token"} {
			http.SetCookie(w, &http.Cookie{
				Name:     cookieName,
				Value:    "csrf_token_dev",
				Path:     "/",
				MaxAge:   86400 * 7,
				SameSite: http.SameSiteLaxMode,
			})
		}
	}

	json.NewEncoder(w).Encode(map[string]any{
		"user": map[string]any{
			"id":            u.ID,
			"name":          u.Name,
			"email":         u.Email,
			"emailVerified": u.EmailVerified,
			"hasPassword":   u.HasPassword,
			"avatarUrl":     u.AvatarURL,
			"features":      u.Features,
		},
	})
}

func (s *Server) handleMethods(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"password": map[string]any{"bound": true},
		"oauth": map[string]any{
			"bound":     true,
			"providers": []string{"Google"},
		},
		"passkey": map[string]any{
			"bound": false,
			"count": 0,
		},
	})
}

func (s *Server) handleSignIn(w http.ResponseWriter, r *http.Request) {
	var req struct {
		UserID   string `json:"user_id"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil && err != io.EOF {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	email := req.Email
	if email == "" {
		email = "patraabhimanyu888@gmail.com"
	}
	name := ""
	parts := strings.Split(email, "@")
	if len(parts) > 0 && parts[0] != "" {
		name = parts[0]
	} else {
		name = "Aurobindo Patra"
	}

	userID := req.UserID
	if userID == "" {
		userID = "user-dev"
	}

	user := UserInfo{
		ID:            userID,
		Name:          name,
		Email:         email,
		EmailVerified: true,
		HasPassword:   true,
		AvatarURL:     "",
		Features:      []string{},
	}

	sessionID := fmt.Sprintf("sess_%d", time.Now().UnixNano())

	s.authState.mu.Lock()
	s.authState.loggedOut = false
	s.authState.defaultUser = user
	s.authState.sessions[sessionID] = user
	s.authState.mu.Unlock()

	now := time.Now().Unix()
	exp := now + 86400*7 // 7 days

	token, _ := authsession.SignAccessToken(user.ID, sessionID, "key-1", []byte(s.cfg.JWTSecret), now, exp)
	refreshToken, _ := authsession.CreateRefreshToken()

	for _, cookieName := range []string{"affine_session", "nexio_session"} {
		http.SetCookie(w, &http.Cookie{
			Name:     cookieName,
			Value:    sessionID,
			Path:     "/",
			MaxAge:   86400 * 7,
			SameSite: http.SameSiteLaxMode,
		})
	}
	for _, cookieName := range []string{"affine_user_id", "nexio_user_id"} {
		http.SetCookie(w, &http.Cookie{
			Name:     cookieName,
			Value:    user.ID,
			Path:     "/",
			MaxAge:   86400 * 7,
			SameSite: http.SameSiteLaxMode,
		})
	}
	for _, cookieName := range []string{"affine_csrf_token", "nexio_csrf_token"} {
		http.SetCookie(w, &http.Cookie{
			Name:     cookieName,
			Value:    "csrf_token_dev",
			Path:     "/",
			MaxAge:   86400 * 7,
			SameSite: http.SameSiteLaxMode,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"id":            user.ID,
		"name":          user.Name,
		"email":         user.Email,
		"emailVerified": user.EmailVerified,
		"hasPassword":   user.HasPassword,
		"avatarUrl":     user.AvatarURL,
		"features":      user.Features,
		"token":         token,
		"refresh_token": refreshToken,
		"user_id":       user.ID,
		"session_id":    sessionID,
		"expires_at":    exp,
	})
}

func (s *Server) handleSignOut(w http.ResponseWriter, r *http.Request) {
	s.authState.mu.Lock()
	var sessionID string
	if c, err := r.Cookie("affine_session"); err == nil && c.Value != "" {
		sessionID = c.Value
	} else if c, err := r.Cookie("nexio_session"); err == nil && c.Value != "" {
		sessionID = c.Value
	}
	if sessionID != "" {
		delete(s.authState.sessions, sessionID)
	}
	s.authState.loggedOut = true
	s.authState.mu.Unlock()

	for _, cookieName := range []string{"affine_session", "nexio_session", "affine_user_id", "nexio_user_id", "affine_csrf_token", "nexio_csrf_token"} {
		http.SetCookie(w, &http.Cookie{
			Name:     cookieName,
			Value:    "",
			Path:     "/",
			MaxAge:   -1,
			Expires:  time.Unix(0, 0),
			SameSite: http.SameSiteLaxMode,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("{}"))
}

func (s *Server) handleOAuthPreflight(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Provider    string `json:"provider"`
		Client      string `json:"client"`
		RedirectURI string `json:"redirect_uri"`
		ClientNonce string `json:"client_nonce"`
	}
	_ = json.NewDecoder(r.Body).Decode(&req)
	provider := req.Provider
	if provider == "" {
		provider = "Google"
	}
	redirectURI := req.RedirectURI
	if redirectURI == "" {
		redirectURI = "/"
	}

	statePayload := map[string]any{
		"flow":        "redirect",
		"clientNonce": req.ClientNonce,
	}
	stateBytes, _ := json.Marshal(statePayload)
	stateParam := url.QueryEscape(string(stateBytes))

	loginURL := fmt.Sprintf("http://localhost:8080/api/oauth/login?provider=%s&redirect_uri=%s&state=%s", provider, url.QueryEscape(redirectURI), stateParam)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"url": loginURL,
	})
}

func (s *Server) handleOAuthLogin(w http.ResponseWriter, r *http.Request) {
	provider := r.URL.Query().Get("provider")
	if provider == "" {
		provider = "Google"
	}
	redirectURI := r.URL.Query().Get("redirect_uri")
	if redirectURI == "" {
		redirectURI = "/"
	}

	userID := "user-dev"
	name := "Aurobindo Patra"
	email := "patraabhimanyu888@gmail.com"

	user := UserInfo{
		ID:            userID,
		Name:          name,
		Email:         email,
		EmailVerified: true,
		HasPassword:   true,
		AvatarURL:     "",
		Features:      []string{},
	}

	sessionID := fmt.Sprintf("sess_%d", time.Now().UnixNano())

	s.authState.mu.Lock()
	s.authState.loggedOut = false
	s.authState.defaultUser = user
	s.authState.sessions[sessionID] = user
	s.authState.mu.Unlock()

	for _, cookieName := range []string{"affine_session", "nexio_session"} {
		http.SetCookie(w, &http.Cookie{
			Name:     cookieName,
			Value:    sessionID,
			Path:     "/",
			MaxAge:   86400 * 7,
			SameSite: http.SameSiteLaxMode,
		})
	}
	for _, cookieName := range []string{"affine_user_id", "nexio_user_id"} {
		http.SetCookie(w, &http.Cookie{
			Name:     cookieName,
			Value:    user.ID,
			Path:     "/",
			MaxAge:   86400 * 7,
			SameSite: http.SameSiteLaxMode,
		})
	}
	for _, cookieName := range []string{"affine_csrf_token", "nexio_csrf_token"} {
		http.SetCookie(w, &http.Cookie{
			Name:     cookieName,
			Value:    "csrf_token_dev",
			Path:     "/",
			MaxAge:   86400 * 7,
			SameSite: http.SameSiteLaxMode,
		})
	}

	http.Redirect(w, r, redirectURI, http.StatusFound)
}

func (s *Server) handleRootOrInstaller(w http.ResponseWriter, r *http.Request) {
	ua := strings.ToLower(r.Header.Get("User-Agent"))
	if strings.Contains(ua, "curl") || strings.Contains(ua, "wget") {
		s.handleInstallSh(w, r)
		return
	}
	if strings.Contains(ua, "powershell") {
		s.handleInstallPs1(w, r)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"service":   "Nexio Backend Go Server",
		"version":   "0.27.5",
		"status":    "running",
		"github":    "https://github.com/ezeslucky/nexio",
		"installer": "https://www.technexio.me/install.sh",
	})
}

func (s *Server) handleInstallSh(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	w.Header().Set("Cache-Control", "no-cache")

	paths := []string{
		"downloads/install.sh",
		"packages/backend/go-native/downloads/install.sh",
		"../../downloads/install.sh",
	}
	for _, p := range paths {
		if content, err := os.ReadFile(p); err == nil && len(content) > 0 {
			w.Write(content)
			return
		}
	}
	w.Write([]byte(defaultInstallSh))
}

func (s *Server) handleInstallPs1(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	w.Header().Set("Cache-Control", "no-cache")

	paths := []string{
		"downloads/install.ps1",
		"packages/backend/go-native/downloads/install.ps1",
		"../../downloads/install.ps1",
	}
	for _, p := range paths {
		if content, err := os.ReadFile(p); err == nil && len(content) > 0 {
			w.Write(content)
			return
		}
	}
	w.Write([]byte(defaultInstallPs1))
}

func (s *Server) handleInstallAuto(w http.ResponseWriter, r *http.Request) {
	ua := strings.ToLower(r.Header.Get("User-Agent"))
	if strings.Contains(ua, "powershell") {
		s.handleInstallPs1(w, r)
	} else {
		s.handleInstallSh(w, r)
	}
}

func (s *Server) handleBlobManifest(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"version":    1,
		"entries":    []any{},
		"nextCursor": nil,
	})
}

func (s *Server) handleTelemetry(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"success":true}`))
}

func (s *Server) handleSocketIO(w http.ResponseWriter, r *http.Request) {
	// Upgrade to WebSocket if requested
	if strings.ToLower(r.Header.Get("Upgrade")) == "websocket" {
		s.hub.HandleWS(w, r)
		return
	}

	w.Header().Set("Content-Type", "text/plain; charset=UTF-8")
	w.Header().Set("Cache-Control", "no-store")

	sid := r.URL.Query().Get("sid")
	if r.Method == http.MethodGet {
		if sid == "" {
			// Engine.IO handshake
			newSid := fmt.Sprintf("eio_%d", time.Now().UnixNano())
			handshake := fmt.Sprintf(`0{"sid":"%s","upgrades":["websocket"],"pingInterval":25000,"pingTimeout":20000,"maxPayload":1000000}`, newSid)
			w.Write([]byte(handshake))
			return
		}
		// Subsequent polling returns connect acknowledgment
		w.Write([]byte("40"))
		return
	}

	if r.Method == http.MethodPost {
		w.Write([]byte("ok"))
		return
	}
}

func (s *Server) handleDownload(w http.ResponseWriter, r *http.Request) {
	platform := strings.ToLower(r.URL.Query().Get("platform"))
	arch := strings.ToLower(r.URL.Query().Get("arch"))
	format := strings.ToLower(r.URL.Query().Get("format"))

	// Auto-detect from User-Agent if platform query parameter is not passed
	if platform == "" {
		ua := strings.ToLower(r.Header.Get("User-Agent"))
		if strings.Contains(ua, "android") {
			platform = "android"
		} else if strings.Contains(ua, "iphone") || strings.Contains(ua, "ipad") {
			platform = "ios"
		} else if strings.Contains(ua, "mac") {
			platform = "mac"
		} else if strings.Contains(ua, "linux") {
			platform = "linux"
		} else {
			platform = "windows"
		}
	}

	var filename string
	var contentType string

	switch platform {
	case "windows", "win":
		if format == "msi" {
			filename = "Nexio-Setup-0.27.5-x64.msi"
			contentType = "application/x-msi"
		} else if arch == "arm64" {
			filename = "Nexio-Setup-0.27.5-arm64.exe"
			contentType = "application/vnd.microsoft.portable-executable"
		} else {
			filename = "Nexio-Setup-0.27.5-x64.exe"
			contentType = "application/vnd.microsoft.portable-executable"
		}
	case "mac", "darwin", "macos":
		if arch == "intel" || arch == "x64" {
			filename = "Nexio-0.27.5-x64.dmg"
		} else {
			filename = "Nexio-0.27.5-arm64.dmg"
		}
		contentType = "application/x-apple-diskimage"
	case "linux":
		if format == "deb" {
			filename = "nexio_0.27.5_amd64.deb"
			contentType = "application/vnd.debian.binary-package"
		} else if format == "tar.gz" || format == "tar" {
			filename = "nexio-0.27.5-linux-x64.tar.gz"
			contentType = "application/gzip"
		} else {
			filename = "Nexio-0.27.5.AppImage"
			contentType = "application/x-executable"
		}
	case "android":
		if format == "universal" {
			filename = "Nexio-0.27.5-universal.apk"
		} else {
			filename = "Nexio-0.27.5-arm64-v8a.apk"
		}
		contentType = "application/vnd.android.package-archive"
	case "ios":
		http.Redirect(w, r, "https://testflight.apple.com/", http.StatusFound)
		return
	default:
		filename = "Nexio-Setup-0.27.5-x64.exe"
		contentType = "application/vnd.microsoft.portable-executable"
	}

	// Candidate paths on disk
	candidatePaths := []string{
		filepath.Join("downloads", filename),
		filepath.Join("..", "..", "downloads", filename),
		filepath.Join("build-artifacts", filename),
		filepath.Join("..", "..", "build-artifacts", filename),
		filepath.Join("C:\\Users\\aurob\\ALLCODING\\open-source\\nexio\\downloads", filename),
	}

	for _, p := range candidatePaths {
		if fi, err := os.Stat(p); err == nil && !fi.IsDir() {
			w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%q", filename))
			w.Header().Set("Content-Type", contentType)
			w.Header().Set("Cache-Control", "no-cache")
			http.ServeFile(w, r, p)
			return
		}
	}

	// Fallback redirect to GitHub releases
	http.Redirect(w, r, fmt.Sprintf("https://github.com/ezeslucky/nexio/releases/latest/download/%s", filename), http.StatusFound)
}

func (s *Server) handleMagicLink(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"verifyToken": "dev-magic-link-token",
	})
}

func (s *Server) handleCaptcha(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"challenge": "challenge_dev",
		"resource":  "auth",
		"bits":      0,
	})
}

func (s *Server) handleListSessions(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode([]any{})
}

func (s *Server) handleRevokeAllSessions(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{})
}

func (s *Server) handleRevokeSession(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{})
}

// Handler: Verify Token
func (s *Server) handleVerifyToken(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Token string `json:"token"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	res := authsession.VerifyAccessToken(req.Token, "key-1", []byte(s.cfg.JWTSecret), time.Now().Unix())
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}

// Handler: Workspace Init
func (s *Server) handleWorkspaceInit(w http.ResponseWriter, r *http.Request) {
	var req struct {
		WorkspaceID string `json:"workspace_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	storage, err := s.getStorage(req.WorkspaceID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	_ = storage.SetSpaceID(req.WorkspaceID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"workspace_id": req.WorkspaceID,
		"initialized":  true,
	})
}

// Handler: Get Document Snapshot & Updates
func (s *Server) handleGetDoc(w http.ResponseWriter, r *http.Request) {
	workspaceID := r.PathValue("workspace_id")
	docID := r.PathValue("doc_id")

	storage, err := s.getStorage(workspaceID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	snap, _ := storage.GetDocSnapshot(docID)
	updates, _ := storage.GetDocUpdates(docID)

	var snapBase64 *string
	if snap != nil {
		b := base64.StdEncoding.EncodeToString(snap.Data)
		snapBase64 = &b
	}

	var updateList []map[string]any
	for _, u := range updates {
		updateList = append(updateList, map[string]any{
			"timestamp": u.CreatedAt,
			"bin":       base64.StdEncoding.EncodeToString(u.Data),
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"doc_id":   docID,
		"snapshot": snapBase64,
		"updates":  updateList,
	})
}

// Handler: Push Document Update
func (s *Server) handlePushDocUpdate(w http.ResponseWriter, r *http.Request) {
	workspaceID := r.PathValue("workspace_id")
	docID := r.PathValue("doc_id")

	data, err := io.ReadAll(io.LimitReader(r.Body, 50*1024*1024))
	if err != nil || len(data) == 0 {
		http.Error(w, "empty update body", http.StatusBadRequest)
		return
	}

	// Validate CRDT binary update format
	if !crdt.ValidateDocUpdate(data) {
		http.Error(w, "invalid CRDT Yjs update binary", http.StatusBadRequest)
		return
	}

	storage, err := s.getStorage(workspaceID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	ts, err := storage.PushUpdate(docID, data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"doc_id":    docID,
		"timestamp": ts,
		"accepted":  true,
	})
}

// Handler: Delete Document
func (s *Server) handleDeleteDoc(w http.ResponseWriter, r *http.Request) {
	workspaceID := r.PathValue("workspace_id")
	docID := r.PathValue("doc_id")

	storage, err := s.getStorage(workspaceID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_ = storage.DeleteDoc(docID)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{"deleted": true})
}

// Handler: Put Blob
func (s *Server) handlePutBlob(w http.ResponseWriter, r *http.Request) {
	workspaceID := r.PathValue("workspace_id")
	key := r.PathValue("key")

	data, err := io.ReadAll(io.LimitReader(r.Body, 100*1024*1024))
	if err != nil || len(data) == 0 {
		http.Error(w, "empty blob data", http.StatusBadRequest)
		return
	}

	mime := r.Header.Get("Content-Type")
	if mime == "" || mime == "application/octet-stream" {
		mime = filetype.GetMime(data)
	}

	storage, err := s.getStorage(workspaceID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := storage.SetBlob(key, mime, data); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"key":  key,
		"mime": mime,
		"size": len(data),
	})
}

// Handler: Get Blob
func (s *Server) handleGetBlob(w http.ResponseWriter, r *http.Request) {
	workspaceID := r.PathValue("workspace_id")
	key := r.PathValue("key")

	storage, err := s.getStorage(workspaceID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	blob, err := storage.GetBlob(key)
	if err != nil || blob == nil {
		http.NotFound(w, r)
		return
	}

	w.Header().Set("Content-Type", blob.Mime)
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(blob.Data)
}

// Handler: AI Tokenizer Count
func (s *Server) handleTokenCount(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Model   string `json:"model"`
		Content string `json:"content"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	tok, err := tokenizer.FromModelName(req.Model)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	count := tok.Count(req.Content, nil)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{"count": count})
}

type GraphQLRequest struct {
	Query         string         `json:"query"`
	OperationName string         `json:"operationName"`
	Variables     map[string]any `json:"variables"`
}

func (s *Server) handleGraphQL(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method == http.MethodGet {
		json.NewEncoder(w).Encode(map[string]any{
			"status": "ok",
			"info":   "Nexio GraphQL Gateway",
		})
		return
	}

	var req GraphQLRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]any{
			"data": map[string]any{},
		})
		return
	}

	op := req.OperationName
	query := strings.ToLower(req.Query)
	data := make(map[string]any)

	u := s.getSessionUser(r)

	if op == "readNotification" || strings.Contains(query, "readnotification") {
		data["readNotification"] = true
	}
	if op == "readAllNotifications" || strings.Contains(query, "readallnotifications") {
		data["readAllNotifications"] = true
	}

	if strings.Contains(query, "currentuser") || op == "getCurrentUser" || op == "listNotifications" || strings.Contains(query, "notifications") {
		if u != nil {
			data["currentUser"] = map[string]any{
				"__typename":    "UserType",
				"id":            u.ID,
				"name":          u.Name,
				"email":         u.Email,
				"avatarUrl":     u.AvatarURL,
				"hasPassword":   u.HasPassword,
				"emailVerified": u.EmailVerified,
				"features":      u.Features,
				"subscription":  nil,
				"invoices":      []any{},
				"settings": map[string]any{
					"__typename":             "UserSettingsType",
					"receiveInvitationEmail": false,
					"receiveMentionEmail":    false,
					"receiveCommentEmail":    false,
				},
				"notifications": map[string]any{
					"__typename": "NotificationConnection",
					"totalCount": 0,
					"edges":      []any{},
					"pageInfo": map[string]any{
						"__typename":      "PageInfo",
						"startCursor":     nil,
						"endCursor":       nil,
						"hasNextPage":     false,
						"hasPreviousPage": false,
					},
				},
				"copilotQuota": map[string]any{
					"__typename": "CopilotQuotaType",
					"limit":      1000,
					"used":       0,
					"resetAt":    time.Now().Add(24 * time.Hour).Format(time.RFC3339),
				},
				"copilot": map[string]any{
					"__typename": "UserCopilotType",
					"chats": map[string]any{
						"__typename": "CopilotChatConnection",
						"edges":      []any{},
						"pageInfo": map[string]any{
							"__typename":      "PageInfo",
							"hasNextPage":     false,
							"hasPreviousPage": false,
						},
					},
				},
			}
		} else {
			data["currentUser"] = nil
		}
	}

	if strings.Contains(query, "serverconfig") || op == "serverConfig" {
		data["serverConfig"] = map[string]any{
			"__typename": "ServerConfigType",
			"version":     "0.27.5",
			"baseUrl":     "http://localhost:8080",
			"name":        "Nexio Cloud",
			"features": []string{
				"LocalWorkspace",
				"Comment",
				"Copilot",
				"OAuth",
			},
			"type":              "selfhosted",
			"initialized":       true,
			"calendarProviders": []string{},
			"oauthProviders": []string{
				"Google",
			},
			"credentialsRequirement": map[string]any{
				"__typename": "CredentialsRequirementType",
				"password": map[string]any{
					"__typename": "PasswordLimitsType",
					"minLength": 8,
					"maxLength": 128,
				},
			},
		}
	}

	if strings.Contains(query, "oauthproviders") || op == "oauthProviders" {
		if _, ok := data["serverConfig"]; !ok {
			data["serverConfig"] = map[string]any{
				"__typename": "ServerConfigType",
				"oauthProviders": []string{
					"Google",
				},
			}
		}
	}

	if strings.Contains(query, "usersettings") {
		data["userSettings"] = map[string]any{
			"receiveInvitationEmail": false,
			"receiveMentionEmail":    false,
			"receiveCommentEmail":    false,
		}
	}

	if strings.Contains(query, "updateuserprofile") || strings.Contains(query, "updateprofile") {
		if u != nil {
			data["updateProfile"] = map[string]any{
				"id": u.ID,
			}
		}
	}

	if strings.Contains(query, "workspace") || op == "getDocCreatedByUpdatedByList" || op == "getDocLastAccessedMembers" || op == "getWorkspace" || op == "getWorkspaceSubscription" || op == "getWorkspacePageMetaById" || op == "getWorkspacePublicById" || op == "getWorkspacePublicPages" {
		wsID := "CBdG2zZTBOsRKKI03pxDm"
		if v, ok := req.Variables["workspaceId"].(string); ok && v != "" {
			wsID = v
		} else if v, ok := req.Variables["id"].(string); ok && v != "" {
			wsID = v
		}
		data["workspace"] = map[string]any{
			"__typename": "WorkspaceType",
			"id":         wsID,
			"public":     false,
			"publicDocs": []any{},
			"docs": map[string]any{
				"__typename": "DocConnection",
				"totalCount": 0,
				"edges":      []any{},
				"pageInfo": map[string]any{
					"__typename":      "PageInfo",
					"hasNextPage":     false,
					"hasPreviousPage": false,
					"startCursor":     nil,
					"endCursor":       nil,
				},
			},
			"doc": map[string]any{
				"__typename": "DocType",
				"summary":    "",
				"lastAccessedMembers": map[string]any{
					"__typename": "LastAccessedMembersConnection",
					"totalCount": 0,
					"edges":      []any{},
					"pageInfo": map[string]any{
						"__typename":      "PageInfo",
						"hasNextPage":     false,
						"hasPreviousPage": false,
						"startCursor":     nil,
						"endCursor":       nil,
					},
				},
			},
			"pageMeta": map[string]any{
				"__typename": "PageMetaType",
				"createdAt":  time.Now().UTC().Format(time.RFC3339),
				"updatedAt":  time.Now().UTC().Format(time.RFC3339),
				"createdBy": map[string]any{
					"name":      "Aurobindo Patra",
					"avatarUrl": "",
				},
				"updatedBy": map[string]any{
					"name":      "Aurobindo Patra",
					"avatarUrl": "",
				},
			},
			"subscription": map[string]any{
				"__typename": "WorkspaceSubscriptionType",
				"id":         "sub_free",
				"status":     "active",
				"plan":       "Free",
				"recurring":  "monthly",
				"start":      time.Now().UTC().Format(time.RFC3339),
				"end":        time.Now().Add(365 * 24 * time.Hour).UTC().Format(time.RFC3339),
			},
			"members":     s.getGraphQLMembers(wsID),
			"memberCount": len(s.getGraphQLMembers(wsID)),
		}
	}

	if strings.Contains(query, "workspaces") || op == "getWorkspaces" {
		ownerID := "user-dev"
		if u != nil {
			ownerID = u.ID
		}
		data["workspaces"] = []any{
			map[string]any{
				"__typename":  "WorkspaceType",
				"id":          "CBdG2zZTBOsRKKI03pxDm",
				"initialized": true,
				"team":        false,
				"owner": map[string]any{
					"id": ownerID,
				},
			},
		}
	}

	if strings.Contains(query, "prices") {
		data["prices"] = []any{}
	}

	if strings.Contains(query, "subscription") && !strings.Contains(query, "workspace") {
		data["subscription"] = nil
	}

	if strings.Contains(query, "createcopilotsession") || op == "createCopilotSession" || op == "createCopilotSessionWithHistory" {
		sessID := fmt.Sprintf("session_%d", time.Now().UnixNano())
		wsID := "CBdG2zZTBOsRKKI03pxDm"
		if v, ok := req.Variables["options"].(map[string]any); ok {
			if w, ok := v["workspaceId"].(string); ok && w != "" {
				wsID = w
			}
		}
		data["createCopilotSession"] = sessID
		data["createCopilotSessionWithHistory"] = map[string]any{
			"__typename":      "CopilotHistories",
			"sessionId":       sessID,
			"workspaceId":     wsID,
			"docId":           "",
			"parentSessionId": nil,
			"promptName":      "chat",
			"action":          "",
			"pinned":          false,
			"title":           "New Chat",
			"messages":        []any{},
			"createdAt":       time.Now().UTC().Format(time.RFC3339),
			"updatedAt":       time.Now().UTC().Format(time.RFC3339),
		}
	}

	if strings.Contains(query, "createcopilotmessage") || op == "createCopilotMessage" {
		msgID := fmt.Sprintf("msg_%d", time.Now().UnixNano())
		data["createCopilotMessage"] = msgID
		if v, ok := req.Variables["options"].(map[string]any); ok {
			if sessID, ok := v["sessionId"].(string); ok && sessID != "" {
				if content, ok := v["content"].(string); ok {
					s.chatMu.Lock()
					s.chatPrompts[sessID] = content
					s.chatMu.Unlock()
				}
			}
		}
	}

	if strings.Contains(query, "updatecopilotsession") || op == "updateCopilotSession" {
		data["updateCopilotSession"] = true
	}

	if strings.Contains(query, "forkcopilotsession") || op == "forkCopilotSession" {
		data["forkCopilotSession"] = fmt.Sprintf("session_%d", time.Now().UnixNano())
	}

	if strings.Contains(query, "cleanupcopilotsession") || op == "cleanupCopilotSession" {
		data["cleanupCopilotSession"] = true
	}

	if strings.Contains(query, "copilot") {
		if _, ok := data["copilotHistories"]; !ok {
			data["copilotHistories"] = []any{}
			data["copilotRecentSessions"] = []any{}
			data["copilotSessions"] = []any{}
			data["copilotHistoryIds"] = []any{}
		}
	}

	json.NewEncoder(w).Encode(map[string]any{
		"data": data,
	})
}

type loggingResponseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (lrw *loggingResponseWriter) WriteHeader(code int) {
	lrw.statusCode = code
	lrw.ResponseWriter.WriteHeader(code)
}

func (lrw *loggingResponseWriter) Flush() {
	if flusher, ok := lrw.ResponseWriter.(http.Flusher); ok {
		flusher.Flush()
	}
}

func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		lrw := &loggingResponseWriter{ResponseWriter: w, statusCode: http.StatusOK}
		next.ServeHTTP(lrw, r)
		if !strings.HasPrefix(r.URL.Path, "/assets/") {
			log.Printf("[HTTP] %s %s -> %d", r.Method, r.URL.Path, lrw.statusCode)
		}
	})
}

// Global CORS Middleware
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin != "" {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Access-Control-Allow-Credentials", "true")
		} else {
			w.Header().Set("Access-Control-Allow-Origin", "*")
		}

		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, HEAD")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, x-affine-csrf-token, x-nexio-csrf-token, x-affine-version, x-nexio-version, x-affine-client-kind, x-nexio-client-kind, x-captcha-token, x-captcha-provider, x-captcha-challenge")
		w.Header().Set("Access-Control-Expose-Headers", "Set-Cookie")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func generateChatResponse(prompt, modelID string) string {
	lower := strings.ToLower(strings.TrimSpace(prompt))
	if lower == "" || lower == "hi" || lower == "hello" || lower == "hey" {
		return "Hello! I am Nexio AI, your intelligent workspace assistant. I can help you draft documents, organize notes, review code, execute custom skills, and coordinate autonomous agents. How can I help you today?"
	}
	if strings.Contains(lower, "skill") {
		return "You can run reusable skills with `/` commands (like `/summarize-meeting`, `/code-review`, `/generate-diagram`, and `/grammar-fix`), or build custom skills in Settings -> Skills Library."
	}
	if strings.Contains(lower, "agent") {
		return "Nexio Agents support autonomous task execution with multi-agent delegation and 'Review for me' safety confirmation. You can manage them in Settings -> AI Agents."
	}
	if strings.Contains(lower, "credit") || strings.Contains(lower, "byok") {
		return "Nexio provides a built-in credit metering system and BYOK (Bring Your Own Key) for OpenAI, Anthropic, and Gemini with AES-256-GCM encryption."
	}
	if strings.Contains(lower, "code") || strings.Contains(lower, "func") {
		return fmt.Sprintf("Here is a solution for your request:\n\n```typescript\n// Auto-routed via %s\nexport function solveTask(input: string): string {\n  console.log('Processing:', input);\n  return `Success: ${input}`;\n}\n```\n\nLet me know if you would like me to refine this or add automated tests!", modelID)
	}
	return fmt.Sprintf("I received your request: \"%s\". I have processed it using model `%s`. Let me know how you'd like to proceed or if you need any adjustments!", prompt, modelID)
}

func (s *Server) handleCopilotChatStream(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("X-Accel-Buffering", "no")

	flusher, _ := w.(http.Flusher)

	sessionID := r.PathValue("sessionId")
	queryPrompt := r.URL.Query().Get("prompt")
	modelID := r.URL.Query().Get("modelId")
	if modelID == "" {
		modelID = "auto"
	}

	var prompt string
	s.chatMu.RLock()
	if sessionID != "" && s.chatPrompts[sessionID] != "" {
		prompt = s.chatPrompts[sessionID]
	}
	s.chatMu.RUnlock()

	if prompt == "" && queryPrompt != "" {
		prompt = queryPrompt
	}

	response := generateChatResponse(prompt, modelID)

	words := strings.Fields(response)
	for i, word := range words {
		suffix := " "
		if i == len(words)-1 {
			suffix = ""
		}
		chunk := map[string]any{
			"type":      "text-delta",
			"textDelta": word + suffix,
		}
		chunkJSON, _ := json.Marshal(chunk)
		fmt.Fprintf(w, "event: message\ndata: %s\n\n", string(chunkJSON))
		if flusher != nil {
			flusher.Flush()
		}
		time.Sleep(20 * time.Millisecond)
	}
}

func (s *Server) handleGetWorkspaceModules(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	s.workspaceModulesMu.RLock()
	mod, exists := s.workspaceModules[wsID]
	s.workspaceModulesMu.RUnlock()
	if !exists {
		mod = WorkspaceModuleSettings{
			EnableTracker: true,
			EnableChat:    true,
			EnableDocs:    true,
			EnableOffice:  true,
		}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(mod)
}

func (s *Server) handleUpdateWorkspaceModules(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	var req WorkspaceModuleSettings
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	s.workspaceModulesMu.Lock()
	s.workspaceModules[wsID] = req
	s.workspaceModulesMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(req)
}

func (s *Server) handleGetWorkspaceMembers(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	s.workspaceMembersMu.Lock()
	members, exists := s.workspaceMembers[wsID]
	if !exists || len(members) == 0 {
		members = []WorkspaceMemberItem{
			{
				ID:        "mem-1",
				UserID:    "user-dev",
				Name:      "Aurobindo Patra",
				Email:     "patraabhimanyu888@gmail.com",
				Role:      "owner",
				State:     "active",
				AvatarURL: "",
				JoinedAt:  time.Now().UTC().Format(time.RFC3339),
			},
		}
		s.workspaceMembers[wsID] = members
	}
	s.workspaceMembersMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"members": members,
		"total":   len(members),
	})
}

func (s *Server) handleInviteWorkspaceMember(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	var req struct {
		Email string `json:"email"`
		Role  string `json:"role"`
		Name  string `json:"name"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if req.Role == "" {
		req.Role = "member"
	}
	if req.Name == "" {
		req.Name = strings.Split(req.Email, "@")[0]
	}

	newMember := WorkspaceMemberItem{
		ID:        fmt.Sprintf("mem-%d", time.Now().UnixNano()),
		UserID:    fmt.Sprintf("user-%d", time.Now().UnixNano()),
		Name:      req.Name,
		Email:     req.Email,
		Role:      req.Role,
		State:     "active",
		AvatarURL: "",
		JoinedAt:  time.Now().UTC().Format(time.RFC3339),
	}

	s.workspaceMembersMu.Lock()
	s.workspaceMembers[wsID] = append(s.workspaceMembers[wsID], newMember)
	s.workspaceMembersMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(newMember)
}

func (s *Server) handleUpdateWorkspaceMember(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	userID := r.PathValue("user_id")

	var req struct {
		Role string `json:"role"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	s.workspaceMembersMu.Lock()
	defer s.workspaceMembersMu.Unlock()
	members := s.workspaceMembers[wsID]
	for i, m := range members {
		if m.UserID == userID || m.ID == userID {
			members[i].Role = req.Role
			s.workspaceMembers[wsID] = members
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(members[i])
			return
		}
	}
	http.Error(w, "member not found", http.StatusNotFound)
}

func (s *Server) handleDeleteWorkspaceMember(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	userID := r.PathValue("user_id")

	s.workspaceMembersMu.Lock()
	defer s.workspaceMembersMu.Unlock()
	members := s.workspaceMembers[wsID]
	var updated []WorkspaceMemberItem
	for _, m := range members {
		if m.UserID != userID && m.ID != userID {
			updated = append(updated, m)
		}
	}
	s.workspaceMembers[wsID] = updated
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{"success": true})
}

func (s *Server) getGraphQLMembers(wsID string) []map[string]any {
	s.workspaceMembersMu.RLock()
	members, exists := s.workspaceMembers[wsID]
	s.workspaceMembersMu.RUnlock()
	if !exists || len(members) == 0 {
		return []map[string]any{
			{
				"__typename": "WorkspaceMemberType",
				"id":         "mem-owner",
				"userId":     "user-dev",
				"name":       "Aurobindo Patra",
				"email":      "patraabhimanyu888@gmail.com",
				"avatarUrl":  "",
				"role":       "Owner",
				"permission": "Owner",
				"status":     "Accepted",
			},
		}
	}
	var res []map[string]any
	for _, m := range members {
		roleTitle := "Member"
		if strings.EqualFold(m.Role, "owner") {
			roleTitle = "Owner"
		} else if strings.EqualFold(m.Role, "admin") {
			roleTitle = "Admin"
		}
		res = append(res, map[string]any{
			"__typename": "WorkspaceMemberType",
			"id":         m.ID,
			"userId":     m.UserID,
			"name":       m.Name,
			"email":      m.Email,
			"avatarUrl":  m.AvatarURL,
			"role":       roleTitle,
			"permission": roleTitle,
			"status":     "Accepted",
		})
	}
	return res
}

func (s *Server) ensureTrackerDefaults(wsID string) {
	if len(s.trackerProjects[wsID]) == 0 {
		s.trackerProjects[wsID] = []TrackerProject{
			{
				ID:          "proj-core",
				WorkspaceID: wsID,
				Name:        "Core Product",
				Key:         "NEX",
				Description: "Nexio workspace modules and core engine",
				Color:       "#3b82f6",
				CreatedAt:   time.Now().UTC().Format(time.RFC3339),
				UpdatedAt:   time.Now().UTC().Format(time.RFC3339),
			},
		}
	}
	if len(s.trackerSprints[wsID]) == 0 {
		s.trackerSprints[wsID] = []TrackerSprint{
			{
				ID:          "sprint-1",
				WorkspaceID: wsID,
				ProjectID:   "proj-core",
				Name:        "Sprint 1: Workspace Modules",
				Status:      "active",
				Goal:        "Deliver Tracker, Channels, and Office modules",
				StartDate:   "2026-11-20",
				EndDate:     "2026-12-04",
			},
		}
	}
	if len(s.trackerLabels[wsID]) == 0 {
		s.trackerLabels[wsID] = []TrackerLabel{
			{ID: "lbl-1", WorkspaceID: wsID, Name: "frontend", Color: "#3b82f6"},
			{ID: "lbl-2", WorkspaceID: wsID, Name: "backend", Color: "#10b981"},
			{ID: "lbl-3", WorkspaceID: wsID, Name: "architecture", Color: "#8b5cf6"},
			{ID: "lbl-4", WorkspaceID: wsID, Name: "bug", Color: "#ef4444"},
		}
	}
	if len(s.trackerIssues[wsID]) == 0 {
		now := time.Now().UTC().Format(time.RFC3339)
		s.trackerIssues[wsID] = []TrackerIssue{
			{
				ID:          "NEX-101",
				WorkspaceID: wsID,
				ProjectID:   "proj-core",
				Title:       "Architect multi-workspace database isolation",
				Description: "Ensure workspace data, member permissions, and audit logs are isolated per workspace schema.",
				Status:      "done",
				Priority:    "urgent",
				Assignee:    "Aurobindo Patra",
				Reporter:    "Aurobindo Patra",
				SprintID:    "sprint-1",
				Estimate:    5,
				Labels:      []string{"architecture", "backend"},
				DueDate:     "2026-11-28",
				Comments: []TrackerComment{
					{
						ID:        "c-1",
						IssueID:   "NEX-101",
						Author:    "Aurobindo Patra",
						Content:   "Database migrations and multi-tenant schema isolation tested successfully.",
						CreatedAt: now,
					},
				},
				TimeLogs: []TrackerTimeLog{
					{
						ID:               "tl-1",
						IssueID:          "NEX-101",
						WorkspaceID:      wsID,
						UserID:           "user-aur",
						UserName:         "Aurobindo Patra",
						TimeSpentMinutes: 120,
						Description:      "Designed multi-workspace database schemas and tenant isolation",
						LoggedAt:         now,
					},
					{
						ID:               "tl-2",
						IssueID:          "NEX-101",
						WorkspaceID:      wsID,
						UserID:           "user-aur",
						UserName:         "Aurobindo Patra",
						TimeSpentMinutes: 90,
						Description:      "Tested database schema indexes and foreign key cascades",
						LoggedAt:         now,
					},
				},
				TotalSpentMinutes: 210,
				CreatedAt: now,
				UpdatedAt: now,
			},
			{
				ID:          "NEX-102",
				WorkspaceID: wsID,
				ProjectID:   "proj-core",
				Title:       "Workspace modular navigation and quick switch dock",
				Description: "Provide persistent switcher between Docs, Tracker, Channels, Office and Intelligence.",
				Status:      "in_progress",
				Priority:    "high",
				Assignee:    "Aurobindo Patra",
				Reporter:    "Aurobindo Patra",
				SprintID:    "sprint-1",
				Estimate:    3,
				Labels:      []string{"frontend", "ui/ux"},
				DueDate:     "2026-11-30",
				Comments:    []TrackerComment{},
				TimeLogs: []TrackerTimeLog{
					{
						ID:               "tl-3",
						IssueID:          "NEX-102",
						WorkspaceID:      wsID,
						UserID:           "user-bot",
						UserName:         "Nexio Bot",
						TimeSpentMinutes: 60,
						Description:      "Prototyped modular sidebar navigation dock",
						LoggedAt:         now,
					},
				},
				TotalSpentMinutes: 60,
				CreatedAt:   now,
				UpdatedAt:   now,
			},
			{
				ID:          "NEX-103",
				WorkspaceID: wsID,
				ProjectID:   "proj-core",
				Title:       "Real-time collaborative channels over WebSockets",
				Description: "Integrate team chat channels, direct messages, and typing indicators.",
				Status:      "todo",
				Priority:    "high",
				Assignee:    "Unassigned",
				Reporter:    "Aurobindo Patra",
				SprintID:    "sprint-1",
				Estimate:    5,
				Labels:      []string{"backend", "chat"},
				DueDate:     "2026-12-02",
				Comments:    []TrackerComment{},
				CreatedAt:   now,
				UpdatedAt:   now,
			},
			{
				ID:          "NEX-104",
				WorkspaceID: wsID,
				ProjectID:   "proj-core",
				Title:       "Virtual Office interactive floor plan and live presence",
				Description: "WebRTC / audio-video rooms with room capacity indicators and screen sharing.",
				Status:      "todo",
				Priority:    "medium",
				Assignee:    "Unassigned",
				Reporter:    "Aurobindo Patra",
				SprintID:    "sprint-1",
				Estimate:    8,
				Labels:      []string{"frontend"},
				DueDate:     "2026-12-05",
				Comments:    []TrackerComment{},
				CreatedAt:   now,
				UpdatedAt:   now,
			},
			{
				ID:          "NEX-105",
				WorkspaceID: wsID,
				ProjectID:   "proj-core",
				Title:       "Global unified search across docs, tracker issues & chat messages",
				Description: "Index all workspace entities for instant keyboard-first search.",
				Status:      "backlog",
				Priority:    "low",
				Assignee:    "Unassigned",
				Reporter:    "Aurobindo Patra",
				SprintID:    "",
				Estimate:    3,
				Labels:      []string{"frontend", "backend"},
				DueDate:     "2026-12-10",
				Comments:    []TrackerComment{},
				CreatedAt:   now,
				UpdatedAt:   now,
			},
		}
	}
}

func (s *Server) handleGetTrackerProjects(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	s.trackerMu.Lock()
	s.ensureTrackerDefaults(wsID)
	projects := s.trackerProjects[wsID]
	s.trackerMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"projects": projects,
		"total":    len(projects),
	})
}

func (s *Server) handleCreateTrackerProject(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	var req TrackerProject
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if req.ID == "" {
		req.ID = fmt.Sprintf("proj-%d", time.Now().UnixNano())
	}
	req.WorkspaceID = wsID
	now := time.Now().UTC().Format(time.RFC3339)
	req.CreatedAt = now
	req.UpdatedAt = now

	s.trackerMu.Lock()
	s.ensureTrackerDefaults(wsID)
	s.trackerProjects[wsID] = append(s.trackerProjects[wsID], req)
	s.trackerMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(req)
}

func (s *Server) handleGetTrackerIssues(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	statusFilter := r.URL.Query().Get("status")
	priorityFilter := r.URL.Query().Get("priority")
	sprintFilter := r.URL.Query().Get("sprintId")
	searchQuery := strings.ToLower(r.URL.Query().Get("search"))

	s.trackerMu.Lock()
	s.ensureTrackerDefaults(wsID)
	allIssues := s.trackerIssues[wsID]
	s.trackerMu.Unlock()

	var filtered []TrackerIssue
	for _, issue := range allIssues {
		if statusFilter != "" && issue.Status != statusFilter {
			continue
		}
		if priorityFilter != "" && issue.Priority != priorityFilter {
			continue
		}
		if sprintFilter != "" && issue.SprintID != sprintFilter {
			continue
		}
		if searchQuery != "" {
			match := strings.Contains(strings.ToLower(issue.Title), searchQuery) ||
				strings.Contains(strings.ToLower(issue.ID), searchQuery) ||
				strings.Contains(strings.ToLower(issue.Description), searchQuery)
			if !match {
				continue
			}
		}
		filtered = append(filtered, issue)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"issues": filtered,
		"total":  len(filtered),
	})
}

func (s *Server) handleCreateTrackerIssue(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	var req TrackerIssue
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	s.trackerMu.Lock()
	s.ensureTrackerDefaults(wsID)
	if req.ID == "" {
		count := len(s.trackerIssues[wsID]) + 101
		req.ID = fmt.Sprintf("NEX-%d", count)
	}
	req.WorkspaceID = wsID
	if req.ProjectID == "" {
		req.ProjectID = "proj-core"
	}
	if req.Status == "" {
		req.Status = "todo"
	}
	if req.Priority == "" {
		req.Priority = "medium"
	}
	if req.Assignee == "" {
		req.Assignee = "Aurobindo Patra"
	}
	if req.Reporter == "" {
		req.Reporter = "Aurobindo Patra"
	}
	if req.Comments == nil {
		req.Comments = []TrackerComment{}
	}
	now := time.Now().UTC().Format(time.RFC3339)
	req.CreatedAt = now
	req.UpdatedAt = now

	s.trackerIssues[wsID] = append([]TrackerIssue{req}, s.trackerIssues[wsID]...)
	s.trackerMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(req)
}

func (s *Server) handleGetTrackerIssueDetail(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	issueID := r.PathValue("issue_id")

	s.trackerMu.Lock()
	s.ensureTrackerDefaults(wsID)
	issues := s.trackerIssues[wsID]
	s.trackerMu.Unlock()

	for _, issue := range issues {
		if issue.ID == issueID {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(issue)
			return
		}
	}
	http.Error(w, "issue not found", http.StatusNotFound)
}

func (s *Server) handleUpdateTrackerIssue(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	issueID := r.PathValue("issue_id")

	var updates map[string]any
	if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	s.trackerMu.Lock()
	defer s.trackerMu.Unlock()
	s.ensureTrackerDefaults(wsID)

	issues := s.trackerIssues[wsID]
	for i, issue := range issues {
		if issue.ID == issueID {
			if v, ok := updates["title"].(string); ok && v != "" {
				issues[i].Title = v
			}
			if v, ok := updates["description"].(string); ok {
				issues[i].Description = v
			}
			if v, ok := updates["status"].(string); ok && v != "" {
				issues[i].Status = v
			}
			if v, ok := updates["priority"].(string); ok && v != "" {
				issues[i].Priority = v
			}
			if v, ok := updates["assignee"].(string); ok {
				issues[i].Assignee = v
			}
			if v, ok := updates["sprintId"].(string); ok {
				issues[i].SprintID = v
			}
			if v, ok := updates["dueDate"].(string); ok {
				issues[i].DueDate = v
			}
			if v, ok := updates["estimate"].(float64); ok {
				issues[i].Estimate = int(v)
			}
			issues[i].UpdatedAt = time.Now().UTC().Format(time.RFC3339)
			s.trackerIssues[wsID] = issues

			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(issues[i])
			return
		}
	}
	http.Error(w, "issue not found", http.StatusNotFound)
}

func (s *Server) handleDeleteTrackerIssue(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	issueID := r.PathValue("issue_id")

	s.trackerMu.Lock()
	defer s.trackerMu.Unlock()
	s.ensureTrackerDefaults(wsID)

	var remaining []TrackerIssue
	for _, issue := range s.trackerIssues[wsID] {
		if issue.ID != issueID {
			remaining = append(remaining, issue)
		}
	}
	s.trackerIssues[wsID] = remaining

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{"success": true, "deleted": issueID})
}

func (s *Server) handleAddTrackerComment(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	issueID := r.PathValue("issue_id")

	var req struct {
		Author  string `json:"author"`
		Content string `json:"content"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if req.Author == "" {
		req.Author = "Aurobindo Patra"
	}
	newComment := TrackerComment{
		ID:        fmt.Sprintf("comment-%d", time.Now().UnixNano()),
		IssueID:   issueID,
		Author:    req.Author,
		Content:   req.Content,
		CreatedAt: time.Now().UTC().Format(time.RFC3339),
	}

	s.trackerMu.Lock()
	defer s.trackerMu.Unlock()
	s.ensureTrackerDefaults(wsID)

	issues := s.trackerIssues[wsID]
	for i, issue := range issues {
		if issue.ID == issueID {
			issues[i].Comments = append(issues[i].Comments, newComment)
			issues[i].UpdatedAt = time.Now().UTC().Format(time.RFC3339)
			s.trackerIssues[wsID] = issues
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(newComment)
			return
		}
	}
	http.Error(w, "issue not found", http.StatusNotFound)
}

func (s *Server) handleGetIssueTimeLogs(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	issueID := r.PathValue("issue_id")

	s.trackerMu.Lock()
	defer s.trackerMu.Unlock()
	s.ensureTrackerDefaults(wsID)

	for _, issue := range s.trackerIssues[wsID] {
		if issue.ID == issueID {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]any{
				"issueId":           issueID,
				"timeLogs":          issue.TimeLogs,
				"totalSpentMinutes": issue.TotalSpentMinutes,
				"estimate":          issue.Estimate,
			})
			return
		}
	}
	http.Error(w, "issue not found", http.StatusNotFound)
}

func (s *Server) handleCreateIssueTimeLog(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	issueID := r.PathValue("issue_id")

	var req struct {
		TimeSpentMinutes int    `json:"timeSpentMinutes"`
		Description      string `json:"description"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.TimeSpentMinutes <= 0 {
		http.Error(w, "invalid time log payload", http.StatusBadRequest)
		return
	}

	u := s.getSessionUser(r)
	userName := "Aurobindo Patra"
	userID := "user-aur"
	if u != nil && u.Name != "" {
		userName = u.Name
		userID = u.ID
	}

	newLog := TrackerTimeLog{
		ID:               fmt.Sprintf("tl-%d", time.Now().UnixNano()),
		IssueID:          issueID,
		WorkspaceID:      wsID,
		UserID:           userID,
		UserName:         userName,
		TimeSpentMinutes: req.TimeSpentMinutes,
		Description:      req.Description,
		LoggedAt:         time.Now().UTC().Format(time.RFC3339),
	}

	s.trackerMu.Lock()
	defer s.trackerMu.Unlock()
	s.ensureTrackerDefaults(wsID)

	for i, issue := range s.trackerIssues[wsID] {
		if issue.ID == issueID {
			s.trackerIssues[wsID][i].TimeLogs = append([]TrackerTimeLog{newLog}, s.trackerIssues[wsID][i].TimeLogs...)
			s.trackerIssues[wsID][i].TotalSpentMinutes += req.TimeSpentMinutes
			s.trackerIssues[wsID][i].UpdatedAt = time.Now().UTC().Format(time.RFC3339)

			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]any{
				"timeLog":           newLog,
				"totalSpentMinutes": s.trackerIssues[wsID][i].TotalSpentMinutes,
				"issue":             s.trackerIssues[wsID][i],
			})
			return
		}
	}
	http.Error(w, "issue not found", http.StatusNotFound)
}

func (s *Server) handleGetWorkspaceTimeLogs(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")

	s.trackerMu.Lock()
	defer s.trackerMu.Unlock()
	s.ensureTrackerDefaults(wsID)

	var allLogs []TrackerTimeLog
	totalWorkspaceMinutes := 0

	for _, issue := range s.trackerIssues[wsID] {
		allLogs = append(allLogs, issue.TimeLogs...)
		totalWorkspaceMinutes += issue.TotalSpentMinutes
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"timeLogs":          allLogs,
		"totalSpentMinutes": totalWorkspaceMinutes,
		"totalSpentHours":   float64(totalWorkspaceMinutes) / 60.0,
		"totalEntries":      len(allLogs),
	})
}

func (s *Server) handleGetTrackerSprints(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	s.trackerMu.Lock()
	s.ensureTrackerDefaults(wsID)
	sprints := s.trackerSprints[wsID]
	s.trackerMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"sprints": sprints,
		"total":   len(sprints),
	})
}

func (s *Server) handleCreateTrackerSprint(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	var req TrackerSprint
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if req.ID == "" {
		req.ID = fmt.Sprintf("sprint-%d", time.Now().UnixNano())
	}
	req.WorkspaceID = wsID
	if req.Status == "" {
		req.Status = "planned"
	}

	s.trackerMu.Lock()
	s.ensureTrackerDefaults(wsID)
	s.trackerSprints[wsID] = append(s.trackerSprints[wsID], req)
	s.trackerMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(req)
}

func (s *Server) handleUpdateTrackerSprint(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	sprintID := r.PathValue("sprint_id")

	var updates map[string]any
	if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	s.trackerMu.Lock()
	defer s.trackerMu.Unlock()
	s.ensureTrackerDefaults(wsID)

	sprints := s.trackerSprints[wsID]
	for i, sp := range sprints {
		if sp.ID == sprintID {
			if v, ok := updates["name"].(string); ok && v != "" {
				sprints[i].Name = v
			}
			if v, ok := updates["status"].(string); ok && v != "" {
				sprints[i].Status = v
			}
			if v, ok := updates["goal"].(string); ok {
				sprints[i].Goal = v
			}
			s.trackerSprints[wsID] = sprints
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(sprints[i])
			return
		}
	}
	http.Error(w, "sprint not found", http.StatusNotFound)
}

func (s *Server) handleGetTrackerLabels(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	s.trackerMu.Lock()
	s.ensureTrackerDefaults(wsID)
	labels := s.trackerLabels[wsID]
	s.trackerMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"labels": labels,
		"total":  len(labels),
	})
}

func (s *Server) handleCreateTrackerLabel(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	var req TrackerLabel
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if req.ID == "" {
		req.ID = fmt.Sprintf("lbl-%d", time.Now().UnixNano())
	}
	req.WorkspaceID = wsID

	s.trackerMu.Lock()
	s.ensureTrackerDefaults(wsID)
	s.trackerLabels[wsID] = append(s.trackerLabels[wsID], req)
	s.trackerMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(req)
}

func (s *Server) ensureChatDefaults(wsID string) {
	if len(s.chatChannels[wsID]) == 0 {
		now := time.Now().UTC().Format(time.RFC3339)
		s.chatChannels[wsID] = []ChatChannel{
			{
				ID:          "chan-general",
				WorkspaceID: wsID,
				Name:        "general",
				Description: "Company-wide announcements and work-based matters",
				Topic:       "Welcome to Nexio Channels! Connect with the team.",
				IsPrivate:   false,
				Members:     []string{"user-dev", "user-sarah", "user-alex"},
				UnreadCount: 0,
				CreatedAt:   now,
			},
			{
				ID:          "chan-engineering",
				WorkspaceID: wsID,
				Name:        "engineering",
				Description: "Technical discussions, PR reviews, and sprint planning",
				Topic:       "Go backend, TypeScript frontend & collaborative CRDT architecture",
				IsPrivate:   false,
				Members:     []string{"user-dev", "user-alex"},
				UnreadCount: 0,
				CreatedAt:   now,
			},
			{
				ID:          "chan-design",
				WorkspaceID: wsID,
				Name:        "design",
				Description: "Design system, UI components, and Figma prototypes",
				Topic:       "Dark/light theme consistency and accessibility",
				IsPrivate:   false,
				Members:     []string{"user-dev", "user-sarah"},
				UnreadCount: 1,
				CreatedAt:   now,
			},
			{
				ID:          "chan-announcements",
				WorkspaceID: wsID,
				Name:        "announcements",
				Description: "Major product releases and milestone achievements",
				Topic:       "Nexio 2.0 release progress",
				IsPrivate:   true,
				Members:     []string{"user-dev"},
				UnreadCount: 0,
				CreatedAt:   now,
			},
		}

		s.chatMessages[wsID] = []ChatMessage{
			{
				ID:           "msg-101",
				WorkspaceID:  wsID,
				ChannelID:    "chan-general",
				SenderID:     "user-dev",
				SenderName:   "Aurobindo Patra",
				SenderAvatar: "",
				Content:      "Welcome to Nexio Real-Time Chat! 🚀 Channels, threads, mentions, and file attachments are fully integrated.",
				Mentions:     []string{},
				Attachments:  []ChatAttachment{},
				Reactions: []ChatReaction{
					{Emoji: "👍", Users: []string{"Sarah Chen", "Alex Rivera"}, Count: 2},
					{Emoji: "🚀", Users: []string{"Aurobindo Patra", "Sarah Chen", "Alex Rivera"}, Count: 3},
				},
				ThreadCount: 0,
				CreatedAt:   time.Now().Add(-2 * time.Hour).UTC().Format(time.RFC3339),
				UpdatedAt:   time.Now().Add(-2 * time.Hour).UTC().Format(time.RFC3339),
			},
			{
				ID:           "msg-102",
				WorkspaceID:  wsID,
				ChannelID:    "chan-general",
				SenderID:     "user-sarah",
				SenderName:   "Sarah Chen",
				SenderAvatar: "",
				Content:      "Excited to collaborate here! @Aurobindo Patra the Sprint 1 Tracker issues are linked with docs.",
				Mentions:     []string{"Aurobindo Patra"},
				Attachments:  []ChatAttachment{},
				Reactions: []ChatReaction{
					{Emoji: "❤️", Users: []string{"Aurobindo Patra"}, Count: 1},
				},
				ThreadCount: 1,
				CreatedAt:   time.Now().Add(-1 * time.Hour).UTC().Format(time.RFC3339),
				UpdatedAt:   time.Now().Add(-1 * time.Hour).UTC().Format(time.RFC3339),
			},
			{
				ID:           "msg-103",
				WorkspaceID:  wsID,
				ChannelID:    "chan-general",
				ParentID:     "msg-102",
				SenderID:     "user-alex",
				SenderName:   "Alex Rivera",
				SenderAvatar: "",
				Content:      "Looking great! Verified the real-time syncing endpoints and WebSocket connection.",
				Mentions:     []string{},
				Attachments:  []ChatAttachment{},
				Reactions: []ChatReaction{
					{Emoji: "🔥", Users: []string{"Sarah Chen"}, Count: 1},
				},
				ThreadCount: 0,
				CreatedAt:   time.Now().Add(-30 * time.Minute).UTC().Format(time.RFC3339),
				UpdatedAt:   time.Now().Add(-30 * time.Minute).UTC().Format(time.RFC3339),
			},
		}

		s.chatDMs[wsID] = []DirectMessageConv{
			{
				ID:          "dm-sarah",
				WorkspaceID: wsID,
				Members:     []string{"Aurobindo Patra", "Sarah Chen"},
				LastMessage: "The sprint review slides are ready for your look.",
				UnreadCount: 1,
				UpdatedAt:   time.Now().Add(-15 * time.Minute).UTC().Format(time.RFC3339),
			},
			{
				ID:          "dm-alex",
				WorkspaceID: wsID,
				Members:     []string{"Aurobindo Patra", "Alex Rivera"},
				LastMessage: "Merged the Go server native endpoints.",
				UnreadCount: 0,
				UpdatedAt:   time.Now().Add(-45 * time.Minute).UTC().Format(time.RFC3339),
			},
		}
	}
}

func (s *Server) handleGetChatChannels(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	s.chatStoreMu.Lock()
	s.ensureChatDefaults(wsID)
	channels := s.chatChannels[wsID]
	s.chatStoreMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"channels": channels,
		"total":    len(channels),
	})
}

func (s *Server) handleCreateChatChannel(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	var req ChatChannel
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if req.ID == "" {
		req.ID = fmt.Sprintf("chan-%d", time.Now().UnixNano())
	}
	req.WorkspaceID = wsID
	req.CreatedAt = time.Now().UTC().Format(time.RFC3339)
	req.UnreadCount = 0
	if len(req.Members) == 0 {
		req.Members = []string{"user-dev"}
	}

	s.chatStoreMu.Lock()
	s.ensureChatDefaults(wsID)
	s.chatChannels[wsID] = append(s.chatChannels[wsID], req)
	s.chatStoreMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(req)
}

func (s *Server) handleGetChannelMessages(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	chanID := r.PathValue("channel_id")

	s.chatStoreMu.Lock()
	s.ensureChatDefaults(wsID)
	allMessages := s.chatMessages[wsID]
	s.chatStoreMu.Unlock()

	var rootMessages []ChatMessage
	for _, m := range allMessages {
		if m.ChannelID == chanID && m.ParentID == "" {
			rootMessages = append(rootMessages, m)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"messages": rootMessages,
		"total":    len(rootMessages),
	})
}

func parseMentions(content string) []string {
	var mentions []string
	words := strings.Fields(content)
	for _, w := range words {
		if strings.HasPrefix(w, "@") && len(w) > 1 {
			clean := strings.TrimRight(w[1:], ".,!?:;")
			if clean != "" {
				mentions = append(mentions, clean)
			}
		}
	}
	return mentions
}

func (s *Server) handlePostChannelMessage(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	chanID := r.PathValue("channel_id")

	var req ChatMessage
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	u := s.getSessionUser(r)
	senderName := "Aurobindo Patra"
	senderID := "user-dev"
	if u != nil && u.Name != "" {
		senderName = u.Name
		senderID = u.ID
	}

	now := time.Now().UTC().Format(time.RFC3339)
	req.ID = fmt.Sprintf("msg-%d", time.Now().UnixNano())
	req.WorkspaceID = wsID
	req.ChannelID = chanID
	req.SenderID = senderID
	req.SenderName = senderName
	req.SenderAvatar = ""
	req.CreatedAt = now
	req.UpdatedAt = now
	if len(req.Mentions) == 0 {
		req.Mentions = parseMentions(req.Content)
	}
	if req.Reactions == nil {
		req.Reactions = []ChatReaction{}
	}
	if req.Attachments == nil {
		req.Attachments = []ChatAttachment{}
	}

	s.chatStoreMu.Lock()
	s.ensureChatDefaults(wsID)

	if req.ParentID != "" {
		// Increment threadCount on parent message
		for i, m := range s.chatMessages[wsID] {
			if m.ID == req.ParentID {
				s.chatMessages[wsID][i].ThreadCount++
				break
			}
		}
	}

	s.chatMessages[wsID] = append(s.chatMessages[wsID], req)
	s.chatStoreMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(req)
}

func (s *Server) handleGetMessageThread(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	msgID := r.PathValue("message_id")

	s.chatStoreMu.Lock()
	s.ensureChatDefaults(wsID)
	allMessages := s.chatMessages[wsID]
	s.chatStoreMu.Unlock()

	var parent *ChatMessage
	var replies []ChatMessage

	for _, m := range allMessages {
		if m.ID == msgID {
			msgCopy := m
			parent = &msgCopy
		} else if m.ParentID == msgID {
			replies = append(replies, m)
		}
	}

	if parent == nil {
		http.Error(w, "message not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"parent":  parent,
		"replies": replies,
		"total":   len(replies),
	})
}

func (s *Server) handleToggleMessageReaction(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	msgID := r.PathValue("message_id")

	var req struct {
		Emoji string `json:"emoji"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Emoji == "" {
		http.Error(w, "invalid emoji", http.StatusBadRequest)
		return
	}

	u := s.getSessionUser(r)
	userName := "Aurobindo Patra"
	if u != nil && u.Name != "" {
		userName = u.Name
	}

	s.chatStoreMu.Lock()
	defer s.chatStoreMu.Unlock()
	s.ensureChatDefaults(wsID)

	for i, m := range s.chatMessages[wsID] {
		if m.ID == msgID {
			foundReaction := false
			for j, rx := range m.Reactions {
				if rx.Emoji == req.Emoji {
					foundReaction = true
					// Check if user already reacted
					hasUser := false
					var newUsers []string
					for _, user := range rx.Users {
						if user == userName {
							hasUser = true
						} else {
							newUsers = append(newUsers, user)
						}
					}
					if hasUser {
						// Remove reaction
						if len(newUsers) == 0 {
							m.Reactions = append(m.Reactions[:j], m.Reactions[j+1:]...)
						} else {
							m.Reactions[j].Users = newUsers
							m.Reactions[j].Count = len(newUsers)
						}
					} else {
						// Add reaction
						m.Reactions[j].Users = append(m.Reactions[j].Users, userName)
						m.Reactions[j].Count = len(m.Reactions[j].Users)
					}
					break
				}
			}
			if !foundReaction {
				m.Reactions = append(m.Reactions, ChatReaction{
					Emoji: req.Emoji,
					Users: []string{userName},
					Count: 1,
				})
			}
			s.chatMessages[wsID][i] = m
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(m)
			return
		}
	}

	http.Error(w, "message not found", http.StatusNotFound)
}

func (s *Server) handleGetDirectMessages(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	s.chatStoreMu.Lock()
	s.ensureChatDefaults(wsID)
	dms := s.chatDMs[wsID]
	s.chatStoreMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"dms":   dms,
		"total": len(dms),
	})
}

func (s *Server) handleCreateDirectMessage(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	var req DirectMessageConv
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if req.ID == "" {
		req.ID = fmt.Sprintf("dm-%d", time.Now().UnixNano())
	}
	req.WorkspaceID = wsID
	req.UpdatedAt = time.Now().UTC().Format(time.RFC3339)

	s.chatStoreMu.Lock()
	s.ensureChatDefaults(wsID)
	s.chatDMs[wsID] = append(s.chatDMs[wsID], req)
	s.chatStoreMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(req)
}

func (s *Server) handleChatTyping(w http.ResponseWriter, r *http.Request) {
	var req struct {
		TargetID string `json:"targetId"`
		IsTyping bool   `json:"isTyping"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	u := s.getSessionUser(r)
	userName := "Aurobindo Patra"
	if u != nil && u.Name != "" {
		userName = u.Name
	}

	s.chatStoreMu.Lock()
	if s.chatTypingStatus[req.TargetID] == nil {
		s.chatTypingStatus[req.TargetID] = make(map[string]time.Time)
	}
	if req.IsTyping {
		s.chatTypingStatus[req.TargetID][userName] = time.Now()
	} else {
		delete(s.chatTypingStatus[req.TargetID], userName)
	}
	s.chatStoreMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

func (s *Server) handleGetChatTyping(w http.ResponseWriter, r *http.Request) {
	targetID := r.URL.Query().Get("target")
	if targetID == "" {
		targetID = "chan-general"
	}

	s.chatStoreMu.Lock()
	defer s.chatStoreMu.Unlock()

	var typers []string
	now := time.Now()
	if users, ok := s.chatTypingStatus[targetID]; ok {
		for uName, t := range users {
			if now.Sub(t) < 4*time.Second {
				typers = append(typers, uName)
			} else {
				delete(users, uName)
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"typers": typers,
	})
}

func (s *Server) ensureDocCollabDefaults(wsID, docID string) {
	key := fmt.Sprintf("%s:%s", wsID, docID)
	if len(s.docVersions[key]) == 0 {
		now := time.Now().UTC()
		s.docVersions[key] = []DocVersionSnapshot{
			{
				ID:            fmt.Sprintf("ver-%d-1", time.Now().UnixNano()),
				DocID:         docID,
				VersionNumber: 1,
				Title:         "Initial Document Creation",
				Summary:       "Created base document with collaborative CRDT schema.",
				Author:        "Aurobindo Patra",
				CreatedAt:     now.Add(-2 * time.Hour).Format(time.RFC3339),
				Size:          1024,
			},
			{
				ID:            fmt.Sprintf("ver-%d-2", time.Now().UnixNano()),
				DocID:         docID,
				VersionNumber: 2,
				Title:         "Phase 4 Collaboration & Architecture Notes",
				Summary:       "Added linked issues, comment threads, and snapshot versioning.",
				Author:        "Aurobindo Patra",
				CreatedAt:     now.Add(-30 * time.Minute).Format(time.RFC3339),
				Size:          2480,
			},
		}
	}

	if len(s.docComments[key]) == 0 {
		now := time.Now().UTC()
		s.docComments[key] = []DocComment{
			{
				ID:        "comm-1",
				DocID:     docID,
				BlockID:   "block-intro",
				Author:    "Sarah Chen",
				Content:   "Please verify the Yjs CRDT real-time sync across multi-tab editing sessions.",
				Resolved:  false,
				CreatedAt: now.Add(-45 * time.Minute).Format(time.RFC3339),
				Replies: []DocCommentReply{
					{
						ID:        "rep-1",
						Author:    "Aurobindo Patra",
						Content:   "Verified! DocStoragePool persistence and broadcast handlers are working smoothly.",
						CreatedAt: now.Add(-20 * time.Minute).Format(time.RFC3339),
					},
				},
			},
		}
	}

	if len(s.docLinkedIssues[key]) == 0 {
		s.docLinkedIssues[key] = []string{"NEX-101", "NEX-102"}
	}
}

func (s *Server) handleGetDocLinkedIssues(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	docID := r.PathValue("doc_id")

	s.docCollabMu.Lock()
	s.ensureDocCollabDefaults(wsID, docID)
	linkedIDs := s.docLinkedIssues[fmt.Sprintf("%s:%s", wsID, docID)]
	s.docCollabMu.Unlock()

	s.trackerMu.Lock()
	s.ensureTrackerDefaults(wsID)
	allIssues := s.trackerIssues[wsID]
	s.trackerMu.Unlock()

	var result []DocLinkedIssue
	for _, id := range linkedIDs {
		for _, iss := range allIssues {
			if iss.ID == id {
				result = append(result, DocLinkedIssue{
					IssueID:  iss.ID,
					Title:    iss.Title,
					Status:   iss.Status,
					Priority: iss.Priority,
					Assignee: iss.Assignee,
				})
				break
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"linkedIssues": result,
		"total":        len(result),
	})
}

func (s *Server) handleLinkDocIssue(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	docID := r.PathValue("doc_id")

	var req struct {
		IssueID string `json:"issueId"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.IssueID == "" {
		http.Error(w, "invalid issueId", http.StatusBadRequest)
		return
	}

	key := fmt.Sprintf("%s:%s", wsID, docID)
	s.docCollabMu.Lock()
	s.ensureDocCollabDefaults(wsID, docID)
	exists := false
	for _, id := range s.docLinkedIssues[key] {
		if id == req.IssueID {
			exists = true
			break
		}
	}
	if !exists {
		s.docLinkedIssues[key] = append(s.docLinkedIssues[key], req.IssueID)
	}
	s.docCollabMu.Unlock()

	s.trackerMu.Lock()
	s.ensureTrackerDefaults(wsID)
	for i, iss := range s.trackerIssues[wsID] {
		if iss.ID == req.IssueID {
			docExists := false
			for _, d := range iss.LinkedDocIDs {
				if d == docID {
					docExists = true
					break
				}
			}
			if !docExists {
				s.trackerIssues[wsID][i].LinkedDocIDs = append(s.trackerIssues[wsID][i].LinkedDocIDs, docID)
			}
			break
		}
	}
	s.trackerMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "linked", "issueId": req.IssueID, "docId": docID})
}

func (s *Server) handleUnlinkDocIssue(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	docID := r.PathValue("doc_id")
	issueID := r.PathValue("issue_id")

	key := fmt.Sprintf("%s:%s", wsID, docID)
	s.docCollabMu.Lock()
	var updated []string
	for _, id := range s.docLinkedIssues[key] {
		if id != issueID {
			updated = append(updated, id)
		}
	}
	s.docLinkedIssues[key] = updated
	s.docCollabMu.Unlock()

	s.trackerMu.Lock()
	for i, iss := range s.trackerIssues[wsID] {
		if iss.ID == issueID {
			var newDocIDs []string
			for _, d := range iss.LinkedDocIDs {
				if d != docID {
					newDocIDs = append(newDocIDs, d)
				}
			}
			s.trackerIssues[wsID][i].LinkedDocIDs = newDocIDs
			break
		}
	}
	s.trackerMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "unlinked", "issueId": issueID, "docId": docID})
}

func (s *Server) handleGetDocVersions(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	docID := r.PathValue("doc_id")

	key := fmt.Sprintf("%s:%s", wsID, docID)
	s.docCollabMu.Lock()
	s.ensureDocCollabDefaults(wsID, docID)
	versions := s.docVersions[key]
	s.docCollabMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"versions": versions,
		"total":    len(versions),
	})
}

func (s *Server) handleCreateDocVersion(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	docID := r.PathValue("doc_id")

	var req DocVersionSnapshot
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	u := s.getSessionUser(r)
	author := "Aurobindo Patra"
	if u != nil && u.Name != "" {
		author = u.Name
	}

	key := fmt.Sprintf("%s:%s", wsID, docID)
	s.docCollabMu.Lock()
	s.ensureDocCollabDefaults(wsID, docID)
	req.ID = fmt.Sprintf("ver-%d", time.Now().UnixNano())
	req.DocID = docID
	req.Author = author
	req.VersionNumber = len(s.docVersions[key]) + 1
	req.CreatedAt = time.Now().UTC().Format(time.RFC3339)
	if req.Size == 0 {
		req.Size = 1500
	}
	s.docVersions[key] = append([]DocVersionSnapshot{req}, s.docVersions[key]...)
	s.docCollabMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(req)
}

func (s *Server) handleRestoreDocVersion(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	docID := r.PathValue("doc_id")
	versionID := r.PathValue("version_id")

	key := fmt.Sprintf("%s:%s", wsID, docID)
	s.docCollabMu.Lock()
	s.ensureDocCollabDefaults(wsID, docID)
	var found *DocVersionSnapshot
	for _, v := range s.docVersions[key] {
		if v.ID == versionID {
			vCopy := v
			found = &vCopy
			break
		}
	}
	s.docCollabMu.Unlock()

	if found == nil {
		http.Error(w, "version snapshot not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"status":     "restored",
		"version":    found,
		"restoredAt": time.Now().UTC().Format(time.RFC3339),
	})
}

func (s *Server) handleGetDocComments(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	docID := r.PathValue("doc_id")

	key := fmt.Sprintf("%s:%s", wsID, docID)
	s.docCollabMu.Lock()
	s.ensureDocCollabDefaults(wsID, docID)
	comments := s.docComments[key]
	s.docCollabMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"comments": comments,
		"total":    len(comments),
	})
}

func (s *Server) handleCreateDocComment(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	docID := r.PathValue("doc_id")

	var req DocComment
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	u := s.getSessionUser(r)
	author := "Aurobindo Patra"
	if u != nil && u.Name != "" {
		author = u.Name
	}

	key := fmt.Sprintf("%s:%s", wsID, docID)
	s.docCollabMu.Lock()
	s.ensureDocCollabDefaults(wsID, docID)
	req.ID = fmt.Sprintf("comm-%d", time.Now().UnixNano())
	req.DocID = docID
	req.Author = author
	req.CreatedAt = time.Now().UTC().Format(time.RFC3339)
	req.Resolved = false
	if req.Replies == nil {
		req.Replies = []DocCommentReply{}
	}
	s.docComments[key] = append(s.docComments[key], req)
	s.docCollabMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(req)
}

func (s *Server) handleReplyDocComment(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	docID := r.PathValue("doc_id")
	commentID := r.PathValue("comment_id")

	var req struct {
		Content string `json:"content"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Content == "" {
		http.Error(w, "invalid content", http.StatusBadRequest)
		return
	}

	u := s.getSessionUser(r)
	author := "Aurobindo Patra"
	if u != nil && u.Name != "" {
		author = u.Name
	}

	key := fmt.Sprintf("%s:%s", wsID, docID)
	s.docCollabMu.Lock()
	defer s.docCollabMu.Unlock()
	s.ensureDocCollabDefaults(wsID, docID)

	for i, comm := range s.docComments[key] {
		if comm.ID == commentID {
			newReply := DocCommentReply{
				ID:        fmt.Sprintf("rep-%d", time.Now().UnixNano()),
				Author:    author,
				Content:   req.Content,
				CreatedAt: time.Now().UTC().Format(time.RFC3339),
			}
			s.docComments[key][i].Replies = append(s.docComments[key][i].Replies, newReply)
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(s.docComments[key][i])
			return
		}
	}

	http.Error(w, "comment not found", http.StatusNotFound)
}

func (s *Server) handleResolveDocComment(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	docID := r.PathValue("doc_id")
	commentID := r.PathValue("comment_id")

	key := fmt.Sprintf("%s:%s", wsID, docID)
	s.docCollabMu.Lock()
	defer s.docCollabMu.Unlock()
	s.ensureDocCollabDefaults(wsID, docID)

	for i, comm := range s.docComments[key] {
		if comm.ID == commentID {
			s.docComments[key][i].Resolved = !s.docComments[key][i].Resolved
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(s.docComments[key][i])
			return
		}
	}

	http.Error(w, "comment not found", http.StatusNotFound)
}

// -------------------------------------------------------------
// Virtual Office: Rooms, Presence, Signaling & Media State
// -------------------------------------------------------------

func (s *Server) ensureOfficeDefaults(wsID string) {
	if _, exists := s.officeRooms[wsID]; exists && len(s.officeRooms[wsID]) > 0 {
		return
	}

	now := time.Now().UTC().Format(time.RFC3339)
	s.officeRooms[wsID] = []OfficeRoom{
		{
			ID:          "room-main-lounge",
			WorkspaceID: wsID,
			Name:        "Main Lounge",
			Type:        "open_lounge",
			Description: "Open social space for spontaneous catchups and watercooler chats.",
			Capacity:    16,
			IsLocked:    false,
			CreatedAt:   now,
			Participants: []OfficeParticipant{
				{
					UserID:          "user-aur",
					UserName:        "Aurobindo Patra",
					AvatarURL:       "",
					IsMuted:         false,
					IsVideoOn:       true,
					IsScreenSharing: false,
					JoinedAt:        now,
				},
				{
					UserID:          "user-alex",
					UserName:        "Alex Chen",
					AvatarURL:       "",
					IsMuted:         true,
					IsVideoOn:       false,
					IsScreenSharing: false,
					JoinedAt:        now,
				},
			},
		},
		{
			ID:          "room-frontend-huddle",
			WorkspaceID: wsID,
			Name:        "Frontend Huddle",
			Type:        "meeting",
			Description: "Team standups, design reviews, and sprint planning meetings.",
			Capacity:    8,
			IsLocked:    false,
			CreatedAt:   now,
			Participants: []OfficeParticipant{
				{
					UserID:          "user-sarah",
					UserName:        "Sarah Miller",
					AvatarURL:       "",
					IsMuted:         false,
					IsVideoOn:       true,
					IsScreenSharing: true,
					JoinedAt:        now,
				},
			},
		},
		{
			ID:           "room-arch-pod",
			WorkspaceID:  wsID,
			Name:         "Architecture & Code Pod",
			Type:         "pair_programming",
			Description:  "Pair programming, deep architectural debates, and debugging sessions.",
			Capacity:     6,
			IsLocked:     false,
			CreatedAt:    now,
			Participants: []OfficeParticipant{},
		},
		{
			ID:           "room-silent-focus",
			WorkspaceID:  wsID,
			Name:         "Deep Focus Pod",
			Type:         "focus",
			Description:  "Muted workspace for heads-down flow state work. No interruptions.",
			Capacity:     4,
			IsLocked:     false,
			CreatedAt:    now,
			Participants: []OfficeParticipant{},
		},
	}
}

func (s *Server) handleGetOfficeRooms(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	s.officeMu.Lock()
	s.ensureOfficeDefaults(wsID)
	rooms := make([]OfficeRoom, len(s.officeRooms[wsID]))
	copy(rooms, s.officeRooms[wsID])
	s.officeMu.Unlock()

	totalOccupants := 0
	for _, room := range rooms {
		totalOccupants += len(room.Participants)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"rooms":          rooms,
		"total":          len(rooms),
		"totalOccupants": totalOccupants,
	})
}

func (s *Server) handleCreateOfficeRoom(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	var req struct {
		Name        string `json:"name"`
		Type        string `json:"type"`
		Description string `json:"description"`
		Capacity    int    `json:"capacity"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Name == "" {
		http.Error(w, "invalid room payload", http.StatusBadRequest)
		return
	}

	if req.Type == "" {
		req.Type = "meeting"
	}
	if req.Capacity <= 0 {
		req.Capacity = 8
	}

	s.officeMu.Lock()
	defer s.officeMu.Unlock()
	s.ensureOfficeDefaults(wsID)

	roomID := fmt.Sprintf("room-%d", time.Now().UnixNano())
	newRoom := OfficeRoom{
		ID:           roomID,
		WorkspaceID:  wsID,
		Name:         req.Name,
		Type:         req.Type,
		Description:  req.Description,
		Capacity:     req.Capacity,
		IsLocked:     false,
		Participants: []OfficeParticipant{},
		CreatedAt:    time.Now().UTC().Format(time.RFC3339),
	}

	s.officeRooms[wsID] = append(s.officeRooms[wsID], newRoom)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(newRoom)
}

func (s *Server) handleJoinOfficeRoom(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	roomID := r.PathValue("room_id")

	var req OfficeJoinRequest
	_ = json.NewDecoder(r.Body).Decode(&req)

	u := s.getSessionUser(r)
	if req.UserID == "" {
		if u != nil && u.ID != "" {
			req.UserID = u.ID
			req.UserName = u.Name
			req.AvatarURL = u.AvatarURL
		} else {
			req.UserID = "user-aur"
			req.UserName = "Aurobindo Patra"
		}
	}
	if req.UserName == "" {
		req.UserName = "Aurobindo Patra"
	}

	s.officeMu.Lock()
	defer s.officeMu.Unlock()
	s.ensureOfficeDefaults(wsID)

	// First remove user from ANY existing room in this workspace
	for ri := range s.officeRooms[wsID] {
		filtered := make([]OfficeParticipant, 0, len(s.officeRooms[wsID][ri].Participants))
		for _, p := range s.officeRooms[wsID][ri].Participants {
			if p.UserID != req.UserID {
				filtered = append(filtered, p)
			}
		}
		s.officeRooms[wsID][ri].Participants = filtered
	}

	// Find target room
	var targetRoom *OfficeRoom
	var targetIdx int
	for i := range s.officeRooms[wsID] {
		if s.officeRooms[wsID][i].ID == roomID {
			targetRoom = &s.officeRooms[wsID][i]
			targetIdx = i
			break
		}
	}

	if targetRoom == nil {
		http.Error(w, "room not found", http.StatusNotFound)
		return
	}

	if targetRoom.IsLocked {
		http.Error(w, "room is locked", http.StatusForbidden)
		return
	}

	if len(targetRoom.Participants) >= targetRoom.Capacity {
		http.Error(w, "room is full", http.StatusBadRequest)
		return
	}

	participant := OfficeParticipant{
		UserID:          req.UserID,
		UserName:        req.UserName,
		AvatarURL:       req.AvatarURL,
		IsMuted:         false,
		IsVideoOn:       true,
		IsScreenSharing: false,
		JoinedAt:        time.Now().UTC().Format(time.RFC3339),
	}

	s.officeRooms[wsID][targetIdx].Participants = append(s.officeRooms[wsID][targetIdx].Participants, participant)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"room":        s.officeRooms[wsID][targetIdx],
		"participant": participant,
		"signaling": map[string]any{
			"mode": "mesh-webrtc",
			"iceServers": []map[string]string{
				{"urls": "stun:stun.l.google.com:19302"},
			},
		},
	})
}

func (s *Server) handleLeaveOfficeRoom(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	roomID := r.PathValue("room_id")

	var req OfficeJoinRequest
	_ = json.NewDecoder(r.Body).Decode(&req)
	u := s.getSessionUser(r)
	targetUserID := req.UserID
	if targetUserID == "" && u != nil {
		targetUserID = u.ID
	}
	if targetUserID == "" {
		targetUserID = r.URL.Query().Get("user_id")
	}

	s.officeMu.Lock()
	defer s.officeMu.Unlock()
	s.ensureOfficeDefaults(wsID)

	var targetRoom *OfficeRoom
	for i := range s.officeRooms[wsID] {
		if s.officeRooms[wsID][i].ID == roomID {
			filtered := make([]OfficeParticipant, 0, len(s.officeRooms[wsID][i].Participants))
			for _, p := range s.officeRooms[wsID][i].Participants {
				if targetUserID == "" || p.UserID != targetUserID {
					filtered = append(filtered, p)
				}
			}
			s.officeRooms[wsID][i].Participants = filtered
			targetRoom = &s.officeRooms[wsID][i]
			break
		}
	}

	w.Header().Set("Content-Type", "application/json")
	if targetRoom != nil {
		json.NewEncoder(w).Encode(map[string]any{
			"success": true,
			"room":    targetRoom,
		})
	} else {
		json.NewEncoder(w).Encode(map[string]any{"success": true})
	}
}

func (s *Server) handleUpdateOfficeMediaState(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	roomID := r.PathValue("room_id")

	var req OfficeMediaStateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid media payload", http.StatusBadRequest)
		return
	}

	u := s.getSessionUser(r)
	if req.UserID == "" && u != nil {
		req.UserID = u.ID
	}
	if req.UserID == "" {
		req.UserID = "user-aur"
	}

	s.officeMu.Lock()
	defer s.officeMu.Unlock()
	s.ensureOfficeDefaults(wsID)

	for ri := range s.officeRooms[wsID] {
		if s.officeRooms[wsID][ri].ID == roomID {
			for pi := range s.officeRooms[wsID][ri].Participants {
				if s.officeRooms[wsID][ri].Participants[pi].UserID == req.UserID {
					if req.IsMuted != nil {
						s.officeRooms[wsID][ri].Participants[pi].IsMuted = *req.IsMuted
					}
					if req.IsVideoOn != nil {
						s.officeRooms[wsID][ri].Participants[pi].IsVideoOn = *req.IsVideoOn
					}
					if req.IsScreenSharing != nil {
						s.officeRooms[wsID][ri].Participants[pi].IsScreenSharing = *req.IsScreenSharing
					}
					w.Header().Set("Content-Type", "application/json")
					json.NewEncoder(w).Encode(s.officeRooms[wsID][ri].Participants[pi])
					return
				}
			}
		}
	}

	http.Error(w, "participant not in room", http.StatusNotFound)
}

// -------------------------------------------------------------
// Cross-Feature Extras: Global Search, Activity Feed, Notifications
// -------------------------------------------------------------

func (s *Server) ensureActivityAndNotificationDefaults(wsID string) {
	s.activityMu.Lock()
	if _, exists := s.activityFeed[wsID]; !exists || len(s.activityFeed[wsID]) == 0 {
		now := time.Now().UTC()
		s.activityFeed[wsID] = []WorkspaceActivityItem{
			{
				ID:          "act-1",
				WorkspaceID: wsID,
				ActorID:     "user-aur",
				ActorName:   "Aurobindo Patra",
				ActorAvatar: "",
				Module:      "tracker",
				Action:      "created_issue",
				TargetTitle: "NEX-101: Architect multi-workspace database isolation",
				TargetURL:   "/workspace/" + wsID + "/tracker",
				Details:     "Created high priority task in Core Platform sprint.",
				CreatedAt:   now.Add(-10 * time.Minute).Format(time.RFC3339),
			},
			{
				ID:          "act-2",
				WorkspaceID: wsID,
				ActorID:     "user-alex",
				ActorName:   "Alex Chen",
				ActorAvatar: "",
				Module:      "chat",
				Action:      "posted_message",
				TargetTitle: "#general: Multi-tenant workspace sync is live!",
				TargetURL:   "/workspace/" + wsID + "/channels",
				Details:     "Shared update in #general with 2 attachments.",
				CreatedAt:   now.Add(-25 * time.Minute).Format(time.RFC3339),
			},
			{
				ID:          "act-3",
				WorkspaceID: wsID,
				ActorID:     "user-sarah",
				ActorName:   "Sarah Miller",
				ActorAvatar: "",
				Module:      "docs",
				Action:      "created_version",
				TargetTitle: "Release v1.5 Sprint Architecture (v2 snapshot)",
				TargetURL:   "/workspace/" + wsID + "/all",
				Details:     "Saved version snapshot with linked issues NEX-101 and NEX-102.",
				CreatedAt:   now.Add(-60 * time.Minute).Format(time.RFC3339),
			},
			{
				ID:          "act-4",
				WorkspaceID: wsID,
				ActorID:     "user-aur",
				ActorName:   "Aurobindo Patra",
				ActorAvatar: "",
				Module:      "office",
				Action:      "joined_room",
				TargetTitle: "Main Lounge",
				TargetURL:   "/workspace/" + wsID + "/office",
				Details:     "Entered audio huddle in Main Lounge.",
				CreatedAt:   now.Add(-120 * time.Minute).Format(time.RFC3339),
			},
			{
				ID:          "act-5",
				WorkspaceID: wsID,
				ActorID:     "user-bot",
				ActorName:   "Nexio Bot",
				ActorAvatar: "",
				Module:      "tracker",
				Action:      "completed_task",
				TargetTitle: "NEX-102: Workspace modular navigation dock",
				TargetURL:   "/workspace/" + wsID + "/tracker",
				Details:     "Moved status from In Progress to Done.",
				CreatedAt:   now.Add(-180 * time.Minute).Format(time.RFC3339),
			},
		}
	}
	s.activityMu.Unlock()

	s.notificationsMu.Lock()
	if _, exists := s.notifications[wsID]; !exists || len(s.notifications[wsID]) == 0 {
		now := time.Now().UTC()
		s.notifications[wsID] = []WorkspaceNotification{
			{
				ID:          "notif-1",
				WorkspaceID: wsID,
				UserID:      "user-aur",
				ActorName:   "Sarah Miller",
				ActorAvatar: "",
				Module:      "docs",
				Title:       "Comment Reply",
				Body:        "Sarah Miller replied to your inline discussion on 'Release Architecture'",
				TargetURL:   "/workspace/" + wsID + "/all",
				IsRead:      false,
				CreatedAt:   now.Add(-15 * time.Minute).Format(time.RFC3339),
			},
			{
				ID:          "notif-2",
				WorkspaceID: wsID,
				UserID:      "user-aur",
				ActorName:   "Alex Chen",
				ActorAvatar: "",
				Module:      "chat",
				Title:       "Mentioned in #general",
				Body:        "@Aurobindo Patra check out the new WebRTC spatial room audio sync!",
				TargetURL:   "/workspace/" + wsID + "/channels",
				IsRead:      false,
				CreatedAt:   now.Add(-45 * time.Minute).Format(time.RFC3339),
			},
			{
				ID:          "notif-3",
				WorkspaceID: wsID,
				UserID:      "user-aur",
				ActorName:   "Nexio Bot",
				ActorAvatar: "",
				Module:      "tracker",
				Title:       "Issue Assigned",
				Body:        "You were assigned to NEX-103: Implement unified cross-feature command palette",
				TargetURL:   "/workspace/" + wsID + "/tracker",
				IsRead:      true,
				CreatedAt:   now.Add(-120 * time.Minute).Format(time.RFC3339),
			},
		}
	}
	s.notificationsMu.Unlock()
}

func (s *Server) handleGlobalSearch(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	query := strings.TrimSpace(strings.ToLower(r.URL.Query().Get("q")))
	filterModule := strings.TrimSpace(strings.ToLower(r.URL.Query().Get("module")))

	s.ensureTrackerDefaults(wsID)
	s.ensureChatDefaults(wsID)
	s.ensureOfficeDefaults(wsID)
	s.ensureActivityAndNotificationDefaults(wsID)

	var results []WorkspaceSearchResult

	// 1. Search Tracker Issues
	if filterModule == "" || filterModule == "all" || filterModule == "tracker" {
		s.trackerMu.RLock()
		issues := s.trackerIssues[wsID]
		for _, iss := range issues {
			text := strings.ToLower(iss.Title + " " + iss.Description + " " + iss.ID + " " + iss.Assignee)
			if query == "" || strings.Contains(text, query) {
				snippet := iss.Description
				if len(snippet) > 80 {
					snippet = snippet[:80] + "..."
				}
				results = append(results, WorkspaceSearchResult{
					ID:        iss.ID,
					Module:    "tracker",
					Title:     iss.Title,
					Snippet:   snippet,
					URL:       "/workspace/" + wsID + "/tracker",
					Metadata:  fmt.Sprintf("Status: %s • Priority: %s", iss.Status, iss.Priority),
					CreatedAt: iss.CreatedAt,
				})
			}
		}
		s.trackerMu.RUnlock()
	}

	// 2. Search Collaborative Documents
	if filterModule == "" || filterModule == "all" || filterModule == "docs" {
		s.docCollabMu.RLock()
		for k, versions := range s.docVersions {
			if strings.HasPrefix(k, wsID+":") {
				for _, v := range versions {
					text := strings.ToLower(v.Title + " " + v.Summary + " " + v.Author)
					if query == "" || strings.Contains(text, query) {
						snippet := v.Summary
						if len(snippet) > 80 {
							snippet = snippet[:80] + "..."
						}
						results = append(results, WorkspaceSearchResult{
							ID:        v.ID,
							Module:    "docs",
							Title:     v.Title,
							Snippet:   snippet,
							URL:       "/workspace/" + wsID + "/all",
							Metadata:  fmt.Sprintf("Version %d • by %s", v.VersionNumber, v.Author),
							CreatedAt: v.CreatedAt,
						})
					}
				}
			}
		}
		s.docCollabMu.RUnlock()
	}

	// 3. Search Chat Channels & Messages
	if filterModule == "" || filterModule == "all" || filterModule == "chat" {
		s.chatStoreMu.RLock()
		channels := s.chatChannels[wsID]
		for _, ch := range channels {
			text := strings.ToLower(ch.Name + " " + ch.Topic)
			if query == "" || strings.Contains(text, query) {
				results = append(results, WorkspaceSearchResult{
					ID:        ch.ID,
					Module:    "chat",
					Title:     "#" + ch.Name,
					Snippet:   ch.Topic,
					URL:       "/workspace/" + wsID + "/channels",
					Metadata:  fmt.Sprintf("Channel • %d members", len(ch.Members)),
					CreatedAt: ch.CreatedAt,
				})
			}
		}
		messages := s.chatMessages[wsID]
		for _, msg := range messages {
			text := strings.ToLower(msg.Content + " " + msg.SenderName)
			if query != "" && strings.Contains(text, query) {
				snippet := msg.Content
				if len(snippet) > 80 {
					snippet = snippet[:80] + "..."
				}
				results = append(results, WorkspaceSearchResult{
					ID:        msg.ID,
					Module:    "chat",
					Title:     fmt.Sprintf("Message from %s", msg.SenderName),
					Snippet:   snippet,
					URL:       "/workspace/" + wsID + "/channels",
					Metadata:  "Chat message",
					CreatedAt: msg.CreatedAt,
				})
			}
		}
		s.chatStoreMu.RUnlock()
	}

	// 4. Search Office Rooms
	if filterModule == "" || filterModule == "all" || filterModule == "office" {
		s.officeMu.RLock()
		rooms := s.officeRooms[wsID]
		for _, rm := range rooms {
			text := strings.ToLower(rm.Name + " " + rm.Description + " " + rm.Type)
			if query == "" || strings.Contains(text, query) {
				results = append(results, WorkspaceSearchResult{
					ID:        rm.ID,
					Module:    "office",
					Title:     rm.Name,
					Snippet:   rm.Description,
					URL:       "/workspace/" + wsID + "/office",
					Metadata:  fmt.Sprintf("%s • %d/%d seats", rm.Type, len(rm.Participants), rm.Capacity),
					CreatedAt: rm.CreatedAt,
				})
			}
		}
		s.officeMu.RUnlock()
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"query":   query,
		"results": results,
		"total":   len(results),
	})
}

func (s *Server) handleGetActivityFeed(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	s.ensureActivityAndNotificationDefaults(wsID)

	s.activityMu.RLock()
	acts := make([]WorkspaceActivityItem, len(s.activityFeed[wsID]))
	copy(acts, s.activityFeed[wsID])
	s.activityMu.RUnlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"activities": acts,
		"total":      len(acts),
	})
}

func (s *Server) handlePostActivity(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	s.ensureActivityAndNotificationDefaults(wsID)

	var req WorkspaceActivityItem
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid activity payload", http.StatusBadRequest)
		return
	}

	req.ID = fmt.Sprintf("act-%d", time.Now().UnixNano())
	req.WorkspaceID = wsID
	if req.CreatedAt == "" {
		req.CreatedAt = time.Now().UTC().Format(time.RFC3339)
	}

	s.activityMu.Lock()
	s.activityFeed[wsID] = append([]WorkspaceActivityItem{req}, s.activityFeed[wsID]...)
	s.activityMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(req)
}

func (s *Server) handleGetNotifications(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	s.ensureActivityAndNotificationDefaults(wsID)

	s.notificationsMu.RLock()
	notifs := make([]WorkspaceNotification, len(s.notifications[wsID]))
	copy(notifs, s.notifications[wsID])
	s.notificationsMu.RUnlock()

	unreadCount := 0
	for _, n := range notifs {
		if !n.IsRead {
			unreadCount++
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"notifications": notifs,
		"unreadCount":   unreadCount,
		"total":         len(notifs),
	})
}

func (s *Server) handleMarkNotificationRead(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	notifID := r.PathValue("notification_id")
	s.ensureActivityAndNotificationDefaults(wsID)

	s.notificationsMu.Lock()
	defer s.notificationsMu.Unlock()

	for i := range s.notifications[wsID] {
		if s.notifications[wsID][i].ID == notifID {
			s.notifications[wsID][i].IsRead = true
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(s.notifications[wsID][i])
			return
		}
	}

	http.Error(w, "notification not found", http.StatusNotFound)
}

func (s *Server) handleMarkAllNotificationsRead(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	s.ensureActivityAndNotificationDefaults(wsID)

	s.notificationsMu.Lock()
	for i := range s.notifications[wsID] {
		s.notifications[wsID][i].IsRead = true
	}
	s.notificationsMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{"success": true})
}

func (s *Server) ensureCalendarDefaults(wsID string) {
	if len(s.calendarEvents[wsID]) == 0 {
		now := time.Now().UTC()
		start1 := now.Add(24 * time.Hour).Format(time.RFC3339)
		end1 := now.Add(25 * time.Hour).Format(time.RFC3339)
		start2 := now.Add(48 * time.Hour).Format(time.RFC3339)
		end2 := now.Add(49 * time.Hour).Format(time.RFC3339)
		start3 := now.Add(72 * time.Hour).Format(time.RFC3339)
		end3 := now.Add(73 * time.Hour).Format(time.RFC3339)

		s.calendarEvents[wsID] = []CalendarEvent{
			{
				ID:          "cal-evt-1",
				WorkspaceID: wsID,
				Title:       "Sprint 1 Planning & Goal Alignment",
				Description: "Review sprint goals, backlog priorities, and team velocity.",
				StartTime:   start1,
				EndTime:     end1,
				AllDay:      false,
				Color:       "#8b5cf6",
				RoomID:      "room-all-hands",
				RoomName:    "Town Hall Stage",
				CreatedBy:   "Aurobindo Patra",
				CreatedAt:   now.Format(time.RFC3339),
				UpdatedAt:   now.Format(time.RFC3339),
			},
			{
				ID:          "cal-evt-2",
				WorkspaceID: wsID,
				Title:       "Cross-Module Architecture Sync",
				Description: "Inspect real-time WebSockets, WebRTC mesh, and database schema.",
				StartTime:   start2,
				EndTime:     end2,
				AllDay:      false,
				Color:       "#3b82f6",
				RoomID:      "room-dev-war-room",
				RoomName:    "Dev War Room",
				CreatedBy:   "Aurobindo Patra",
				CreatedAt:   now.Format(time.RFC3339),
				UpdatedAt:   now.Format(time.RFC3339),
			},
			{
				ID:          "cal-evt-3",
				WorkspaceID: wsID,
				Title:       "Weekly Company All-Hands & Demo",
				Description: "Live feature demos across Tracker, Channels, Office, and Calendar.",
				StartTime:   start3,
				EndTime:     end3,
				AllDay:      false,
				Color:       "#10b981",
				RoomID:      "room-all-hands",
				RoomName:    "Town Hall Stage",
				CreatedBy:   "Aurobindo Patra",
				CreatedAt:   now.Format(time.RFC3339),
				UpdatedAt:   now.Format(time.RFC3339),
			},
		}
	}
}

func (s *Server) handleGetCalendarEvents(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	s.calendarMu.Lock()
	s.ensureCalendarDefaults(wsID)
	events := s.calendarEvents[wsID]
	s.calendarMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{"events": events})
}

func (s *Server) handleCreateCalendarEvent(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	var req CalendarEvent
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	s.calendarMu.Lock()
	defer s.calendarMu.Unlock()
	s.ensureCalendarDefaults(wsID)

	now := time.Now().UTC().Format(time.RFC3339)
	req.ID = fmt.Sprintf("cal-evt-%d", time.Now().UnixMilli())
	req.WorkspaceID = wsID
	if req.Color == "" {
		req.Color = "#3b82f6"
	}
	if req.CreatedBy == "" {
		req.CreatedBy = "Aurobindo Patra"
	}
	req.CreatedAt = now
	req.UpdatedAt = now

	s.calendarEvents[wsID] = append([]CalendarEvent{req}, s.calendarEvents[wsID]...)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(req)
}

func (s *Server) handleUpdateCalendarEvent(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	eventID := r.PathValue("event_id")

	var req CalendarEvent
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	s.calendarMu.Lock()
	defer s.calendarMu.Unlock()
	s.ensureCalendarDefaults(wsID)

	now := time.Now().UTC().Format(time.RFC3339)
	for i, ev := range s.calendarEvents[wsID] {
		if ev.ID == eventID {
			if req.Title != "" {
				s.calendarEvents[wsID][i].Title = req.Title
			}
			if req.Description != "" {
				s.calendarEvents[wsID][i].Description = req.Description
			}
			if req.StartTime != "" {
				s.calendarEvents[wsID][i].StartTime = req.StartTime
			}
			if req.EndTime != "" {
				s.calendarEvents[wsID][i].EndTime = req.EndTime
			}
			s.calendarEvents[wsID][i].AllDay = req.AllDay
			if req.Color != "" {
				s.calendarEvents[wsID][i].Color = req.Color
			}
			if req.RoomID != "" {
				s.calendarEvents[wsID][i].RoomID = req.RoomID
				s.calendarEvents[wsID][i].RoomName = req.RoomName
			}
			if req.IssueKey != "" {
				s.calendarEvents[wsID][i].IssueKey = req.IssueKey
			}
			s.calendarEvents[wsID][i].UpdatedAt = now

			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(s.calendarEvents[wsID][i])
			return
		}
	}

	http.Error(w, "event not found", http.StatusNotFound)
}

func (s *Server) handleDeleteCalendarEvent(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	eventID := r.PathValue("event_id")

	s.calendarMu.Lock()
	defer s.calendarMu.Unlock()
	s.ensureCalendarDefaults(wsID)

	var next []CalendarEvent
	for _, ev := range s.calendarEvents[wsID] {
		if ev.ID != eventID {
			next = append(next, ev)
		}
	}
	s.calendarEvents[wsID] = next

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{"deleted": true})
}

func (s *Server) ensureCrmAndAtsDefaults(wsID string) {
	if len(s.crmContacts[wsID]) == 0 {
		now := time.Now().UTC().Format(time.RFC3339)
		s.crmContacts[wsID] = []CrmContact{
			{
				ID:          "crm-cont-1",
				WorkspaceID: wsID,
				Name:        "Sarah Chen",
				Email:       "sarah.chen@acmetech.io",
				Phone:       "+1 (415) 555-0192",
				Company:     "Acme Technologies",
				Stage:       "Customer",
				AssignedTo:  "Aurobindo Patra",
				Value:       45000,
				Notes:       "Key champion for multi-seat engineering expansion.",
				CreatedAt:   now,
				UpdatedAt:   now,
			},
			{
				ID:          "crm-cont-2",
				WorkspaceID: wsID,
				Name:        "Marcus Vance",
				Email:       "m.vance@horizonrobotics.ai",
				Phone:       "+1 (212) 555-0144",
				Company:     "Horizon Robotics",
				Stage:       "Lead",
				AssignedTo:  "Aurobindo Patra",
				Value:       85000,
				Notes:       "Interested in real-time collaborative document and virtual office integration.",
				CreatedAt:   now,
				UpdatedAt:   now,
			},
		}
	}

	if len(s.crmDeals[wsID]) == 0 {
		now := time.Now().UTC()
		nowStr := now.Format(time.RFC3339)
		close1 := now.Add(14 * 24 * time.Hour).Format(time.RFC3339)
		close2 := now.Add(7 * 24 * time.Hour).Format(time.RFC3339)
		close3 := now.Add(-3 * 24 * time.Hour).Format(time.RFC3339)

		s.crmDeals[wsID] = []CrmDeal{
			{
				ID:                "crm-deal-1",
				WorkspaceID:       wsID,
				Title:             "Acme Corp Enterprise Rollout",
				Value:             45000,
				Currency:          "USD",
				Stage:             "proposal",
				ContactID:         "crm-cont-1",
				ContactName:       "Sarah Chen (Acme Technologies)",
				Probability:       70,
				ExpectedCloseDate: close1,
				Notes:             "Commercial proposal sent for 150 developer seats.",
				CreatedAt:         nowStr,
				UpdatedAt:         nowStr,
			},
			{
				ID:                "crm-deal-2",
				WorkspaceID:       wsID,
				Title:             "Horizon Robotics AI Workspace Expansion",
				Value:             85000,
				Currency:          "USD",
				Stage:             "negotiation",
				ContactID:         "crm-cont-2",
				ContactName:       "Marcus Vance (Horizon Robotics)",
				Probability:       85,
				ExpectedCloseDate: close2,
				Notes:             "Final master service agreement under legal review.",
				CreatedAt:         nowStr,
				UpdatedAt:         nowStr,
			},
			{
				ID:                "crm-deal-3",
				WorkspaceID:       wsID,
				Title:             "Starlight Labs Pilot License",
				Value:             12000,
				Currency:          "USD",
				Stage:             "won",
				ContactName:       "Dr. Aris Thorne (Starlight Labs)",
				Probability:       100,
				ExpectedCloseDate: close3,
				Notes:             "Payment received. Onboarding kickoff scheduled.",
				CreatedAt:         nowStr,
				UpdatedAt:         nowStr,
			},
		}
	}

	if len(s.atsCandidates[wsID]) == 0 {
		now := time.Now().UTC().Format(time.RFC3339)
		s.atsCandidates[wsID] = []AtsCandidate{
			{
				ID:          "ats-cand-1",
				WorkspaceID: wsID,
				Name:        "Elena Rostova",
				Email:       "elena.rostova@gmail.com",
				Phone:       "+1 (650) 555-8821",
				Role:        "Staff Distributed Systems Engineer",
				Stage:       "interview",
				Rating:      5,
				RoomID:      "room-dev-war-room",
				RoomName:    "Dev War Room",
				Notes:       "Outstanding system design and concurrency experience. Live interview in War Room.",
				CreatedAt:   now,
				UpdatedAt:   now,
			},
			{
				ID:          "ats-cand-2",
				WorkspaceID: wsID,
				Name:        "Devon Zhao",
				Email:       "devon.zhao@outlook.com",
				Phone:       "+1 (408) 555-3341",
				Role:        "Senior Frontend Architect",
				Stage:       "screening",
				Rating:      4,
				Notes:       "Deep expertise with BlockSuite, CRDTs, and Canvas rendering pipelines.",
				CreatedAt:   now,
				UpdatedAt:   now,
			},
			{
				ID:          "ats-cand-3",
				WorkspaceID: wsID,
				Name:        "Chloe Dupont",
				Email:       "chloe.dupont@design.co",
				Phone:       "+33 6 55 58 12 90",
				Role:        "Product Designer & UX Lead",
				Stage:       "offer",
				Rating:      5,
				Notes:       "Exceptional design portfolio matching Huly & Linear design aesthetics.",
				CreatedAt:   now,
				UpdatedAt:   now,
			},
		}
	}
}

// CRM Contacts Handlers
func (s *Server) handleGetCrmContacts(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	s.crmMu.Lock()
	s.ensureCrmAndAtsDefaults(wsID)
	contacts := s.crmContacts[wsID]
	s.crmMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{"contacts": contacts})
}

func (s *Server) handleCreateCrmContact(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	var req CrmContact
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	s.crmMu.Lock()
	defer s.crmMu.Unlock()
	s.ensureCrmAndAtsDefaults(wsID)

	now := time.Now().UTC().Format(time.RFC3339)
	req.ID = fmt.Sprintf("crm-cont-%d", time.Now().UnixMilli())
	req.WorkspaceID = wsID
	req.CreatedAt = now
	req.UpdatedAt = now

	s.crmContacts[wsID] = append([]CrmContact{req}, s.crmContacts[wsID]...)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(req)
}

// CRM Deals Handlers
func (s *Server) handleGetCrmDeals(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	s.crmMu.Lock()
	s.ensureCrmAndAtsDefaults(wsID)
	deals := s.crmDeals[wsID]
	s.crmMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{"deals": deals})
}

func (s *Server) handleCreateCrmDeal(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	var req CrmDeal
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	s.crmMu.Lock()
	defer s.crmMu.Unlock()
	s.ensureCrmAndAtsDefaults(wsID)

	now := time.Now().UTC().Format(time.RFC3339)
	req.ID = fmt.Sprintf("crm-deal-%d", time.Now().UnixMilli())
	req.WorkspaceID = wsID
	if req.Currency == "" {
		req.Currency = "USD"
	}
	if req.Stage == "" {
		req.Stage = "lead"
	}
	req.CreatedAt = now
	req.UpdatedAt = now

	s.crmDeals[wsID] = append([]CrmDeal{req}, s.crmDeals[wsID]...)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(req)
}

func (s *Server) handleUpdateCrmDeal(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	dealID := r.PathValue("deal_id")

	var req CrmDeal
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	s.crmMu.Lock()
	defer s.crmMu.Unlock()
	s.ensureCrmAndAtsDefaults(wsID)

	now := time.Now().UTC().Format(time.RFC3339)
	for i, d := range s.crmDeals[wsID] {
		if d.ID == dealID {
			if req.Title != "" {
				s.crmDeals[wsID][i].Title = req.Title
			}
			if req.Value > 0 {
				s.crmDeals[wsID][i].Value = req.Value
			}
			if req.Stage != "" {
				s.crmDeals[wsID][i].Stage = req.Stage
			}
			if req.ContactID != "" {
				s.crmDeals[wsID][i].ContactID = req.ContactID
				s.crmDeals[wsID][i].ContactName = req.ContactName
			}
			if req.Probability >= 0 {
				s.crmDeals[wsID][i].Probability = req.Probability
			}
			if req.ExpectedCloseDate != "" {
				s.crmDeals[wsID][i].ExpectedCloseDate = req.ExpectedCloseDate
			}
			if req.Notes != "" {
				s.crmDeals[wsID][i].Notes = req.Notes
			}
			s.crmDeals[wsID][i].UpdatedAt = now

			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(s.crmDeals[wsID][i])
			return
		}
	}

	http.Error(w, "deal not found", http.StatusNotFound)
}

func (s *Server) handleDeleteCrmDeal(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	dealID := r.PathValue("deal_id")

	s.crmMu.Lock()
	defer s.crmMu.Unlock()
	s.ensureCrmAndAtsDefaults(wsID)

	var next []CrmDeal
	for _, d := range s.crmDeals[wsID] {
		if d.ID != dealID {
			next = append(next, d)
		}
	}
	s.crmDeals[wsID] = next

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{"deleted": true})
}

// ATS Candidates Handlers
func (s *Server) handleGetAtsCandidates(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	s.crmMu.Lock()
	s.ensureCrmAndAtsDefaults(wsID)
	candidates := s.atsCandidates[wsID]
	s.crmMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{"candidates": candidates})
}

func (s *Server) handleCreateAtsCandidate(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	var req AtsCandidate
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	s.crmMu.Lock()
	defer s.crmMu.Unlock()
	s.ensureCrmAndAtsDefaults(wsID)

	now := time.Now().UTC().Format(time.RFC3339)
	req.ID = fmt.Sprintf("ats-cand-%d", time.Now().UnixMilli())
	req.WorkspaceID = wsID
	if req.Stage == "" {
		req.Stage = "sourced"
	}
	if req.Rating <= 0 {
		req.Rating = 3
	}
	req.CreatedAt = now
	req.UpdatedAt = now

	s.atsCandidates[wsID] = append([]AtsCandidate{req}, s.atsCandidates[wsID]...)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(req)
}

func (s *Server) handleUpdateAtsCandidate(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	candidateID := r.PathValue("candidate_id")

	var req AtsCandidate
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	s.crmMu.Lock()
	defer s.crmMu.Unlock()
	s.ensureCrmAndAtsDefaults(wsID)

	now := time.Now().UTC().Format(time.RFC3339)
	for i, c := range s.atsCandidates[wsID] {
		if c.ID == candidateID {
			if req.Name != "" {
				s.atsCandidates[wsID][i].Name = req.Name
			}
			if req.Email != "" {
				s.atsCandidates[wsID][i].Email = req.Email
			}
			if req.Phone != "" {
				s.atsCandidates[wsID][i].Phone = req.Phone
			}
			if req.Role != "" {
				s.atsCandidates[wsID][i].Role = req.Role
			}
			if req.Stage != "" {
				s.atsCandidates[wsID][i].Stage = req.Stage
			}
			if req.Rating > 0 {
				s.atsCandidates[wsID][i].Rating = req.Rating
			}
			if req.RoomID != "" {
				s.atsCandidates[wsID][i].RoomID = req.RoomID
				s.atsCandidates[wsID][i].RoomName = req.RoomName
			}
			if req.Notes != "" {
				s.atsCandidates[wsID][i].Notes = req.Notes
			}
			s.atsCandidates[wsID][i].UpdatedAt = now

			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(s.atsCandidates[wsID][i])
			return
		}
	}

	http.Error(w, "candidate not found", http.StatusNotFound)
}

func (s *Server) handleDeleteAtsCandidate(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	candidateID := r.PathValue("candidate_id")

	s.crmMu.Lock()
	defer s.crmMu.Unlock()
	s.ensureCrmAndAtsDefaults(wsID)

	var next []AtsCandidate
	for _, c := range s.atsCandidates[wsID] {
		if c.ID != candidateID {
			next = append(next, c)
		}
	}
	s.atsCandidates[wsID] = next

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{"deleted": true})
}

func (s *Server) ensureTrackerGitHubDefaults(wsID, issueID string) {
	key := fmt.Sprintf("%s:%s", wsID, issueID)
	if len(s.trackerGitHubLinks[key]) == 0 {
		now := time.Now().UTC().Format(time.RFC3339)
		if issueID == "NEX-101" {
			s.trackerGitHubLinks[key] = []TrackerGitHubLink{
				{
					ID:        "gh-link-1",
					IssueID:   issueID,
					Type:      "pull_request",
					Title:     "[NEX-101] Add Virtual Office WebRTC signaling & floor rooms",
					URL:       "https://github.com/tech-nexio/nexio/pull/42",
					Number:    42,
					Status:    "merged",
					Author:    "aurobindop",
					Timestamp: now,
				},
				{
					ID:        "gh-link-2",
					IssueID:   issueID,
					Type:      "commit",
					Title:     "feat(tracker): NEX-101 integrate WebRTC mesh signaling server",
					URL:       "https://github.com/tech-nexio/nexio/commit/7fa3b92",
					Author:    "aurobindop",
					Timestamp: now,
				},
			}
		} else if issueID == "NEX-102" {
			s.trackerGitHubLinks[key] = []TrackerGitHubLink{
				{
					ID:        "gh-link-3",
					IssueID:   issueID,
					Type:      "pull_request",
					Title:     "[NEX-102] Implement Time Tracking & Stopwatch in Issue Detail",
					URL:       "https://github.com/tech-nexio/nexio/pull/45",
					Number:    45,
					Status:    "open",
					Author:    "aurobindop",
					Timestamp: now,
				},
			}
		}
	}
}

func (s *Server) handleGetIssueGitHubLinks(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	issueID := r.PathValue("issue_id")

	s.trackerGitHubMu.Lock()
	s.ensureTrackerGitHubDefaults(wsID, issueID)
	key := fmt.Sprintf("%s:%s", wsID, issueID)
	links := s.trackerGitHubLinks[key]
	s.trackerGitHubMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{"links": links})
}

func (s *Server) handleLinkIssueGitHubItem(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")
	issueID := r.PathValue("issue_id")

	var req TrackerGitHubLink
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	s.trackerGitHubMu.Lock()
	defer s.trackerGitHubMu.Unlock()
	s.ensureTrackerGitHubDefaults(wsID, issueID)

	key := fmt.Sprintf("%s:%s", wsID, issueID)
	now := time.Now().UTC().Format(time.RFC3339)
	req.ID = fmt.Sprintf("gh-link-%d", time.Now().UnixMilli())
	req.IssueID = issueID
	if req.Author == "" {
		req.Author = "Aurobindo Patra"
	}
	if req.Timestamp == "" {
		req.Timestamp = now
	}

	s.trackerGitHubLinks[key] = append([]TrackerGitHubLink{req}, s.trackerGitHubLinks[key]...)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(req)
}

func (s *Server) handleGitHubWebhook(w http.ResponseWriter, r *http.Request) {
	wsID := r.PathValue("workspace_id")

	var payload map[string]any
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "invalid webhook payload", http.StatusBadRequest)
		return
	}

	now := time.Now().UTC().Format(time.RFC3339)
	re := regexp.MustCompile(`(NEX-\d+)`)

	var affectedIssues []string

	// 1. Process Pull Request Events
	if prRaw, exists := payload["pull_request"]; exists {
		if pr, ok := prRaw.(map[string]any); ok {
			title, _ := pr["title"].(string)
			htmlURL, _ := pr["html_url"].(string)
			numberFloat, _ := pr["number"].(float64)
			isMerged, _ := pr["merged"].(bool)
			action, _ := payload["action"].(string)

			userLogin := "github-bot"
			if userMap, ok := pr["user"].(map[string]any); ok {
				if login, ok := userMap["login"].(string); ok {
					userLogin = login
				}
			}

			matches := re.FindAllString(title, -1)
			for _, issueKey := range matches {
				affectedIssues = append(affectedIssues, issueKey)
				linkStatus := "open"
				if isMerged || action == "closed" {
					if isMerged {
						linkStatus = "merged"
					} else {
						linkStatus = "closed"
					}
				}

				newLink := TrackerGitHubLink{
					ID:        fmt.Sprintf("gh-pr-%d", time.Now().UnixMilli()),
					IssueID:   issueKey,
					Type:      "pull_request",
					Title:     title,
					URL:       htmlURL,
					Number:    int(numberFloat),
					Status:    linkStatus,
					Author:    userLogin,
					Timestamp: now,
				}

				s.trackerGitHubMu.Lock()
				key := fmt.Sprintf("%s:%s", wsID, issueKey)
				s.trackerGitHubLinks[key] = append([]TrackerGitHubLink{newLink}, s.trackerGitHubLinks[key]...)
				s.trackerGitHubMu.Unlock()

				// If PR is merged, advance issue to "done"
				if isMerged {
					s.trackerMu.Lock()
					s.ensureTrackerDefaults(wsID)
					for idx, iss := range s.trackerIssues[wsID] {
						if iss.ID == issueKey {
							s.trackerIssues[wsID][idx].Status = "done"
							s.trackerIssues[wsID][idx].UpdatedAt = now
							break
						}
					}
					s.trackerMu.Unlock()
				} else if action == "opened" {
					// Advance issue to "in_review"
					s.trackerMu.Lock()
					s.ensureTrackerDefaults(wsID)
					for idx, iss := range s.trackerIssues[wsID] {
						if iss.ID == issueKey && (iss.Status == "todo" || iss.Status == "in_progress") {
							s.trackerIssues[wsID][idx].Status = "in_review"
							s.trackerIssues[wsID][idx].UpdatedAt = now
							break
						}
					}
					s.trackerMu.Unlock()
				}
			}
		}
	}

	// 2. Process Commits / Push Events
	if commitsRaw, exists := payload["commits"]; exists {
		if commits, ok := commitsRaw.([]any); ok {
			for _, cItem := range commits {
				if cMap, ok := cItem.(map[string]any); ok {
					msg, _ := cMap["message"].(string)
					cURL, _ := cMap["url"].(string)
					authorName := "git"
					if aMap, ok := cMap["author"].(map[string]any); ok {
						if name, ok := aMap["name"].(string); ok {
							authorName = name
						}
					}

					matches := re.FindAllString(msg, -1)
					for _, issueKey := range matches {
						affectedIssues = append(affectedIssues, issueKey)
						newLink := TrackerGitHubLink{
							ID:        fmt.Sprintf("gh-commit-%d", time.Now().UnixMilli()),
							IssueID:   issueKey,
							Type:      "commit",
							Title:     msg,
							URL:       cURL,
							Author:    authorName,
							Timestamp: now,
						}

						s.trackerGitHubMu.Lock()
						key := fmt.Sprintf("%s:%s", wsID, issueKey)
						s.trackerGitHubLinks[key] = append([]TrackerGitHubLink{newLink}, s.trackerGitHubLinks[key]...)
						s.trackerGitHubMu.Unlock()
					}
				}
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"success":        true,
		"affectedIssues": affectedIssues,
		"timestamp":      now,
	})
}

func (s *Server) Start() error {
	addr := fmt.Sprintf(":%s", s.cfg.Port)
	log.Printf("[Nexio Go Server] Starting on http://0.0.0.0%s (dual-stack)", addr)
	handler := corsMiddleware(s.mux)
	handler = loggingMiddleware(handler)
	return http.ListenAndServe(addr, handler)
}

const defaultInstallSh = `#!/bin/sh
set -e
echo "Nexio Terminal Installer: https://www.technexio.me"
`

const defaultInstallPs1 = `# Nexio PowerShell Installer
Write-Host "Nexio Terminal Installer: https://www.technexio.me"
`
