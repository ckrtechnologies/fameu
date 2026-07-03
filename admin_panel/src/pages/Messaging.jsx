import React, { useState, useEffect, useRef } from 'react';
import { useGetConversationsQuery, useGetConversationMessagesQuery } from '../store/api/adminEndpoints';
import { Search, MessageSquare, User, Clock } from 'lucide-react';

export default function Messaging() {
  const { data: response, isLoading } = useGetConversationsQuery();
  const conversations = response?.data || [];
  
  const [selectedConv, setSelectedConv] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(conv => {
    const p1Name = conv.participant1?.display_name || '';
    const p2Name = conv.participant2?.display_name || '';
    const query = searchQuery.toLowerCase();
    return p1Name.toLowerCase().includes(query) || p2Name.toLowerCase().includes(query);
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', height: 'calc(100vh - 80px)', background: 'var(--bg-dark)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
      {/* Sidebar - Conversation List */}
      <div style={{ width: '350px', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={20} className="text-primary" />
            Messaging Logs
          </h2>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="form-control" 
                placeholder="Search conversations..." 
                style={{ paddingLeft: '40px', background: 'var(--bg-light)', border: 'none' }}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {isLoading ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>
          ) : filteredConversations.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>No conversations found.</div>
          ) : (
            filteredConversations.map(conv => {
              const isSelected = selectedConv?.id === conv.id;
              return (
                <div 
                  key={conv.id}
                  onClick={() => setSelectedConv(conv)}
                  style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    background: isSelected ? 'var(--bg-light)' : 'transparent',
                    borderLeft: isSelected ? '4px solid var(--primary)' : '4px solid transparent',
                    transition: 'all 0.2s ease'
                  }}
                  className="hover-bg-light"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                      {conv.participant1?.display_name || 'Unknown'} & {conv.participant2?.display_name || 'Unknown'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <Clock size={12} />
                    {new Date(conv.updated_at).toLocaleString()}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-light)' }}>
        {selectedConv ? (
          <ChatView conversation={selectedConv} />
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <MessageSquare size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p style={{ fontSize: '1.1rem' }}>Select a conversation to view the chat log</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ChatView({ conversation }) {
  const { data: response, isLoading } = useGetConversationMessagesQuery(conversation.id);
  const messages = response?.data || [];
  const scrollRef = useRef(null);

  // Auto-scroll to bottom when messages load
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // We assign left/right sides based on participant IDs for visual separation
  const p1Id = conversation.participant1?.id;

  return (
    <>
      <div style={{ padding: '20px 24px', background: 'var(--bg-dark)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <UsersIcon />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>
            {conversation.participant1?.display_name || 'Unknown'} and {conversation.participant2?.display_name || 'Unknown'}
          </h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            ID: {conversation.id}
          </p>
        </div>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '32px' }}>Loading messages...</div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '32px', background: 'var(--bg-dark)', borderRadius: '12px', margin: 'auto' }}>
            No messages have been sent yet.
          </div>
        ) : (
          messages.map((msg, index) => {
            const isP1 = msg.sender_id === p1Id;
            const isSystem = !msg.sender_id; // in case of system messages
            
            if (isSystem) {
               return (
                 <div key={msg.id} style={{ alignSelf: 'center', background: 'var(--bg-dark)', padding: '8px 16px', borderRadius: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {msg.content}
                 </div>
               )
            }

            return (
              <div 
                key={msg.id} 
                style={{
                  alignSelf: isP1 ? 'flex-start' : 'flex-end',
                  maxWidth: '70%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isP1 ? 'flex-start' : 'flex-end'
                }}
              >
                {/* Show sender name if it's the first message or sender changed */}
                {(index === 0 || messages[index - 1].sender_id !== msg.sender_id) && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', marginLeft: '4px', marginRight: '4px' }}>
                    {msg.sender?.display_name || 'Unknown'}
                  </span>
                )}
                
                <div style={{
                  background: isP1 ? 'var(--bg-dark)' : 'var(--primary)',
                  color: isP1 ? 'var(--text-primary)' : '#fff',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  borderBottomLeftRadius: isP1 ? '4px' : '16px',
                  borderBottomRightRadius: isP1 ? '16px' : '4px',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                  position: 'relative'
                }}>
                  <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{msg.content}</p>
                  <div style={{ 
                    fontSize: '0.7rem', 
                    color: isP1 ? 'var(--text-muted)' : 'rgba(255,255,255,0.7)', 
                    textAlign: 'right',
                    marginTop: '8px'
                  }}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

// Simple users icon for the header
const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);
