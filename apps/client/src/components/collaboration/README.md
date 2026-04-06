# Collaboration Components

Complete real-time collaboration system with messaging, team management, and activity tracking.

## 📦 Components

### CollaborationPanel (All-in-One)
The main component that provides the complete collaboration experience with tabbed interface.

```tsx
<CollaborationPanel
  repoId={123}
  repoName="My Repo"
  isOwner={true}
  token={jwtToken}
  currentUserId={userId}
/>
```

**Includes:**
- 💬 Real-time chat
- 👥 Team member management
- 📧 Invite interface
- 📊 Activity log
- 🟢 Online status indicator

---

### CollaborationChat
Real-time messaging interface with typing indicators.

```tsx
<CollaborationChat
  messages={messages}
  onSendMessage={(msg) => sendMessage(msg)}
  onTyping={(isTyping) => setTyping(isTyping)}
  typingUsers={typingUsers}
  currentUserId={userId}
  isConnected={true}
/>
```

**Features:**
- Send/receive messages instantly
- See who's typing
- Auto-scroll to latest
- User avatars
- Timestamps

---

### InviteCollaborator
User-friendly form for inviting team members.

```tsx
<InviteCollaborator
  onInvite={async (email, role) => { /* ... */ }}
  loading={false}
/>
```

**Features:**
- Email validation
- Role selector with descriptions
- Recently invited list
- Duplicate prevention
- Permission guide

---

### CollaboratorsList
Display and manage team members.

```tsx
<CollaboratorsList
  collaborators={collaborators}
  onRemove={removeUser}
  onUpdateRole={updateRole}
  isOwner={true}
/>
```

**Features:**
- Show all active members
- Change roles with dropdown
- Remove members
- User info (avatar, email, name)

---

### OnlineIndicator
Display online team members.

```tsx
<OnlineIndicator users={onlineUsers} maxShow={6} />
```

**Features:**
- Show online users
- Green presence indicator
- Count badge
- Email on hover

---

### RepositoryCollaborationPage
Ready-to-use page component for repository collaboration.

```tsx
<RepositoryCollaborationPage
  repoId={123}
  repoName="My Repo"
/>
```

---

## 🚀 Quick Start

### 1. Import
```tsx
import { 
  CollaborationPanel,
  CollaborationChat,
  InviteCollaborator,
  CollaboratorsList,
  OnlineIndicator,
  RepositoryCollaborationPage
} from '@/components/collaboration';
```

### 2. Add to Your Page
```tsx
'use client';

import { CollaborationPanel } from '@/components/collaboration';
import { useAuth } from '@/hooks/use-auth';

export default function RepoPage() {
  const { user, token } = useAuth();

  return (
    <CollaborationPanel
      repoId={repoId}
      repoName="My Repository"
      isOwner={user.id === ownerId}
      token={token}
      currentUserId={user.id}
    />
  );
}
```

### 3. Hook Usage
```tsx
import { useCollaboration } from '@/hooks/use-collaboration';

const {
  collaborators,
  messages,
  onlineUsers,
  sendMessage,
  invite,
  // ... more
} = useCollaboration({ repoId, token });
```

---

## 🎨 Styling

All components support:
- ✅ Light/Dark mode
- ✅ Responsive design (mobile-first)
- ✅ Touch-friendly
- ✅ Tailwind CSS
- ✅ Custom theming

---

## 🔧 Props Reference

### CollaborationPanel Props
```typescript
interface CollaborationPanelProps {
  repoId: number;           // Required: Repository ID
  repoName: string;         // Required: Display name
  isOwner?: boolean;        // Show admin features (default: false)
  token?: string;          // Required: JWT auth token
  currentUserId?: number;  // Current user ID for chat
}
```

### useCollaboration Props
```typescript
interface UseCollaborationProps {
  repoId: number;
  token?: string;
  apiUrl?: string;          // Default: http://localhost:4000
}
```

### Return Values
```typescript
{
  // State
  collaborators: Collaborator[];
  onlineUsers: OnlineUser[];
  messages: RealtimeMessage[];
  activityLog: ActivityLog[];
  pendingInvites: PendingInvite[];
  typingUsers: Set<number>;
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;

  // Methods
  loadInitialData: () => Promise<void>;
  invite: (email, role) => Promise<void>;
  removeCollaborator: (userId) => Promise<void>;
  updateRole: (userId, role) => Promise<void>;
  sendMessage: (content) => void;
  setTyping: (isTyping) => void;
}
```

---

## 📊 Roles & Permissions

| Feature | Viewer | Editor | Admin |
|---------|--------|--------|-------|
| View messages | ✅ | ✅ | ✅ |
| Send messages | ✅ | ✅ | ✅ |
| View team | ✅ | ✅ | ✅ |
| Edit content | ❌ | ✅ | ✅ |
| Manage team | ❌ | ❌ | ✅ |
| Change roles | ❌ | ❌ | ✅ |
| Remove members | ❌ | ❌ | ✅ |

---

## 💬 Real-time Features

### Chat
- Instant message delivery
- Typing indicators
- User presence
- Message history
- Auto-reconnection

### WebSocket Events
```
CLIENT → SERVER:
- join-repo(repoId)
- send-message(repoId, content)
- typing(repoId, isTyping)
- leave-repo(repoId)

SERVER → CLIENT:
- user-joined(user)
- user-left(user)
- new-message(message)
- user-typing(user)
```

---

## 🔐 Security

- ✅ JWT authentication required
- ✅ Role-based access control
- ✅ Permission checking on every action
- ✅ Email validation for invites
- ✅ 7-day invitation expiry
- ✅ Secure token generation

---

## 📱 Mobile Support

- ✅ Fully responsive
- ✅ Touch-optimized buttons (48px+)
- ✅ Tab-based navigation on small screens
- ✅ Optimized keyboard input
- ✅ Works on iOS & Android

---

## ⚙️ Configuration

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Socket.io Configuration
```typescript
// Auto-configured in services/realtime.service.ts
// Defaults:
// - API URL: http://localhost:4000
// - Transports: websocket + polling fallback
// - Auto-reconnect: enabled
// - Reconnect delay: 1-5 seconds
```

---

## 🧪 Testing

### Component Testing
```tsx
import { render, screen } from '@testing-library/react';
import { CollaborationPanel } from '@/components/collaboration';

it('renders collaboration panel', () => {
  render(
    <CollaborationPanel
      repoId={1}
      repoName="Test"
      token="test-token"
    />
  );
  expect(screen.getByText('Test')).toBeInTheDocument();
});
```

### Hook Testing
```tsx
import { renderHook, waitFor } from '@testing-library/react';
import { useCollaboration } from '@/hooks/use-collaboration';

it('loads collaborators', async () => {
  const { result } = renderHook(() => 
    useCollaboration({ repoId: 1, token: 'test' })
  );

  await waitFor(() => {
    expect(result.current.collaborators.length).toBeGreaterThan(0);
  });
});
```

---

## 🐛 Troubleshooting

### Messages Not Sending
1. Check WebSocket connection status (look at header indicator)
2. Verify token is valid
3. Ensure user has VIEWER role or higher
4. Check browser console for errors

### Real-time Not Working
1. Verify `NEXT_PUBLIC_API_URL` is correct
2. Check backend API is running
3. Look for Socket.io errors in console
4. Try reloading the page

### Invitations Failing
1. Check email format is valid
2. Verify user is owner/admin
3. Check backend API errors
4. Ensure database connection is working

### Styling Issues
1. Clear cache: `rm -rf .next`
2. Rebuild: `npm run build`
3. Check Tailwind config includes collaboration components
4. Verify dark mode is enabled

---

## 📚 Examples

### Sidebar Layout
```tsx
export default function RepoPage() {
  return (
    <div className="flex gap-4 h-screen">
      <main className="flex-1">
        {/* Repository content */}
      </main>
      
      <aside className="w-96">
        <CollaborationPanel {...props} />
      </aside>
    </div>
  );
}
```

### Modal Layout
```tsx
import { Dialog } from '@/components/ui/dialog';

export default function RepoPage() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>
        Open Collaboration
      </button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <CollaborationPanel {...props} />
      </Dialog>
    </>
  );
}
```

### Custom Layout
```tsx
export default function RepoPage() {
  const { 
    messages, 
    collaborators, 
    onlineUsers,
    sendMessage,
    invite 
  } = useCollaboration({ repoId, token });

  return (
    <div className="grid grid-cols-3 gap-4">
      <div>
        <OnlineIndicator users={onlineUsers} />
        <CollaboratorsList collaborators={collaborators} />
        <InviteCollaborator onInvite={invite} />
      </div>
      
      <div className="col-span-2">
        <CollaborationChat
          messages={messages}
          onSendMessage={sendMessage}
        />
      </div>
    </div>
  );
}
```

---

## 📈 Performance

- ✅ Lazy loading of components
- ✅ Memoized renders
- ✅ Debounced typing indicators
- ✅ Paginated message history
- ✅ Optimized re-renders
- ✅ Efficient Socket.io subscriptions

---

## 🚀 Future Features

Coming soon:
- [ ] Voice/video chat
- [ ] File sharing
- [ ] Code review comments
- [ ] User presence (cursor tracking)
- [ ] Message reactions
- [ ] Mention notifications
- [ ] Message pinning
- [ ] Chat export
- [ ] Custom themes
- [ ] Message search

---

## 📞 Support

Need help?
1. Check COLLABORATION_UI_GUIDE.md for detailed docs
2. Review component props above
3. Search GitHub issues
4. Check browser console for errors
5. Enable debug logging

---

## 📄 License

MIT

---

## 🙏 Contributing

Contributions welcome! Please:
1. Test your changes thoroughly
2. Update documentation
3. Follow code style
4. Add TypeScript types
5. Test on mobile devices
