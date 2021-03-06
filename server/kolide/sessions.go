package kolide

import (
	"time"

	"golang.org/x/net/context"
)

// SessionStore is the abstract interface that all session backends must
// conform to.
type SessionStore interface {
	// Given a session key, find and return a session object or an error if one
	// could not be found for the given key
	SessionByKey(key string) (*Session, error)

	// Given a session id, find and return a session object or an error if one
	// could not be found for the given id
	SessionByID(id uint) (*Session, error)

	// Find all of the active sessions for a given user
	ListSessionsForUser(id uint) ([]*Session, error)

	// Store a new session struct
	NewSession(session *Session) (*Session, error)

	// Destroy the currently tracked session
	DestroySession(session *Session) error

	// Destroy all of the sessions for a given user
	DestroyAllSessionsForUser(id uint) error

	// Mark the currently tracked session as access to extend expiration
	MarkSessionAccessed(session *Session) error
}

type SessionService interface {
	Login(ctx context.Context, username, password string) (user *User, token string, err error)
	Logout(ctx context.Context) (err error)
	DestroySession(ctx context.Context) (err error)
	GetInfoAboutSessionsForUser(ctx context.Context, id uint) (sessions []*Session, err error)
	DeleteSessionsForUser(ctx context.Context, id uint) (err error)
	GetInfoAboutSession(ctx context.Context, id uint) (session *Session, err error)
	GetSessionByKey(ctx context.Context, key string) (session *Session, err error)
	DeleteSession(ctx context.Context, id uint) (err error)
}

// Session is the model object which represents what an active session is
type Session struct {
	CreateTimestamp
	ID         uint
	AccessedAt time.Time `db:"accessed_at"`
	UserID     uint      `db:"user_id"`
	Key        string
}
