import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Image, Alert } from 'react-native';
import { GlobalAlert } from './core/GlobalAlert';
import Icon, { CommentsSectionIcon } from './icons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { useGetCommentsQuery, useAddCommentMutation, useUpdateCommentMutation, useDeleteCommentMutation } from '../services/commentsApi';
import { useTheme } from '../theme/ThemeProvider';
import { typography, spacing } from '../theme/theme';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const CommentItem = ({ comment, depth = 0, onReply, onEdit, onDelete, currentUserId, onPressProfile }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const isOwner = comment.user_id === currentUserId;

  return (
    <View style={[styles.commentWrapper, { marginTop: depth > 0 ? spacing.s : 0 }]}>
      <View style={styles.commentHeader}>
        <TouchableOpacity onPress={() => onPressProfile(comment.user?.username)}>
          {comment.user?.avatar_url ? (
            <Image source={{ uri: comment.user.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Icon name="person" size={16} color={colors.textMutedLight} />
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.commentMeta}>
          <TouchableOpacity onPress={() => onPressProfile(comment.user?.username)}>
            <Text style={styles.userName}>
            {comment.user?.display_name || 
             (Array.isArray(comment.user?.artist_profiles) ? comment.user.artist_profiles[0]?.full_name : comment.user?.artist_profiles?.full_name) || 
             (Array.isArray(comment.user?.hiring_profiles) ? comment.user.hiring_profiles[0]?.company_name : comment.user?.hiring_profiles?.company_name) || 
             'User'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.timestamp}>{dayjs(comment.created_at).fromNow()}</Text>
        </View>
      </View>
      <View style={{ marginLeft: 36 }}>
        <Text style={styles.commentContent}>{comment.content}</Text>
        
        <View style={styles.actionsRow}>
          {depth < 2 && (
            <TouchableOpacity onPress={() => onReply(comment)} style={styles.actionBtn}>
              <Text style={styles.actionText}>Reply</Text>
            </TouchableOpacity>
          )}
          {isOwner && (
            <>
              <TouchableOpacity onPress={() => onEdit(comment)} style={styles.actionBtn}>
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onDelete(comment)} style={styles.actionBtn}>
                <Text style={[styles.actionText, { color: colors.danger }]}>Delete</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {comment.replies && comment.replies.length > 0 && (
        <View style={[styles.repliesContainer, { borderLeftWidth: 1, borderLeftColor: colors.borderLight, marginLeft: 12, paddingLeft: 12, marginTop: 4 }]}>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              currentUserId={currentUserId}
              onPressProfile={onPressProfile}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default function CommentsSection({ targetType, targetId, disableComment = false, isOwnProfile = false }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation();
  const user = useSelector(state => state.auth.user);
  const { data: response, isLoading } = useGetCommentsQuery({ type: targetType, targetId }, { skip: !targetId, refetchOnMountOrArgChange: true });
  const [addComment, { isLoading: isAdding }] = useAddCommentMutation();
  const [updateComment] = useUpdateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();

  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [editing, setEditing] = useState(null);
  const [activeTab, setActiveTab] = useState('artists'); // 'artists' | 'recruiters'

  const comments = response?.data || [];
  
  // Filter by role and sort top-level comments descending (newest first)
  const filteredComments = comments
    .filter(c => {
      if (activeTab === 'artists') return c.user?.role === 'artist';
      if (activeTab === 'recruiters') return c.user?.role === 'hiring';
      return true;
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const handleSubmit = async () => {
    if (!inputText.trim()) return;

    try {
      if (editing) {
        await updateComment({ type: targetType, commentId: editing.id, content: inputText, targetId }).unwrap();
        setEditing(null);
      } else {
        await addComment({ type: targetType, targetId, content: inputText, parentId: replyingTo?.id || null }).unwrap();
        setReplyingTo(null);
      }
      setInputText('');
    } catch (error) {
      GlobalAlert.show('Error', 'Failed to post comment.');
    }
  };

  const handleDelete = (comment) => {
    GlobalAlert.show('Delete Comment', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await deleteComment({ type: targetType, commentId: comment.id, targetId }).unwrap();
        } catch (e) {
          GlobalAlert.show('Error', 'Failed to delete comment.');
        }
      }}
    ]);
  };

  const handlePressProfile = (username) => {
    if (username) {
      navigation.push('PublicProfile', { username });
    }
  };

  if (isLoading) return <ActivityIndicator style={{ margin: 20 }} color={colors.primary} />;

  const artistCommentsCount = comments.filter(c => c.user?.role === 'artist').length;
  const recruiterCommentsCount = comments.filter(c => c.user?.role === 'hiring').length;

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionHeaderIconBadge}>
          <CommentsSectionIcon size={24} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.sectionHeaderTitle}>Comments & Reviews</Text>
            <View style={styles.headerCountBadge}>
              <Text style={styles.headerCountText}>{comments.length}</Text>
            </View>
          </View>
          <Text style={styles.sectionHeaderSubtitle}>
            Feedback and notes from artists & casting recruiters
          </Text>
        </View>
      </View>

      {/* Segmented Filter Pills */}
      <View style={styles.segmentedFilterRow}>
        <TouchableOpacity 
          style={[styles.filterPill, activeTab === 'artists' && styles.filterPillActive]} 
          onPress={() => setActiveTab('artists')}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterPillText, activeTab === 'artists' && styles.filterPillTextActive]}>
            🎭 Artists ({artistCommentsCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterPill, activeTab === 'recruiters' && styles.filterPillActive]} 
          onPress={() => setActiveTab('recruiters')}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterPillText, activeTab === 'recruiters' && styles.filterPillTextActive]}>
            🏢 Recruiters ({recruiterCommentsCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Input Area — blocked on own profile unless replying/editing */}
      {((!disableComment && !isOwnProfile) || replyingTo || editing) ? (
        <View style={styles.inputContainer}>
          {(replyingTo || editing) && (
            <View style={styles.replyingIndicator}>
              <Text style={styles.replyingText}>
                {editing ? 'Editing your comment' : `Replying to ${replyingTo.user?.display_name || (Array.isArray(replyingTo.user?.artist_profiles) ? replyingTo.user.artist_profiles[0]?.full_name : replyingTo.user?.artist_profiles?.full_name) || (Array.isArray(replyingTo.user?.hiring_profiles) ? replyingTo.user.hiring_profiles[0]?.company_name : replyingTo.user?.hiring_profiles?.company_name) || 'User'}`}
              </Text>
              <TouchableOpacity onPress={() => { setReplyingTo(null); setEditing(null); setInputText(''); }}>
                <Icon name="close-circle" size={16} color={colors.textMutedLight} />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Write a review or comment..."
              placeholderTextColor={colors.textMutedLight}
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity onPress={handleSubmit} disabled={isAdding || !inputText.trim()} style={[styles.sendBtn, (!inputText.trim() || isAdding) && styles.sendBtnDisabled]}>
              {isAdding ? <ActivityIndicator size="small" color="#FFF" /> : <Icon name="send" size={20} color="#FFF" />}
            </TouchableOpacity>
          </View>
        </View>
      ) : isOwnProfile && !replyingTo && !editing ? (
        <View style={styles.ownProfileNoteCard}>
          <Text style={styles.ownProfileNoteText}>
            💬 You can reply to feedback, but cannot post top-level comments on your own profile.
          </Text>
        </View>
      ) : null}

      {/* Comments List */}
      {filteredComments.map(comment => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onReply={(c) => { setReplyingTo(c); setEditing(null); setInputText(''); }}
          onEdit={(c) => { setEditing(c); setReplyingTo(null); setInputText(c.content); }}
          onDelete={handleDelete}
          currentUserId={user?.id}
          onPressProfile={handlePressProfile}
        />
      ))}
      {filteredComments.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No comments from {activeTab === 'artists' ? 'artists' : 'recruiters'} yet.</Text>
        </View>
      )}
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: {
    marginTop: spacing.l,
    marginHorizontal: spacing.xl,
    paddingHorizontal: 0,
    marginBottom: spacing.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionHeaderIconBadge: {
    backgroundColor: colors.primary + '15',
    padding: 8,
    borderRadius: 14,
    marginRight: 12,
  },
  sectionHeaderTitle: {
    ...typography.h3,
    color: colors.textMainLight,
    fontWeight: 'bold',
  },
  sectionHeaderSubtitle: {
    fontSize: 12,
    color: colors.textMutedLight,
    marginTop: 2,
  },
  headerCountBadge: {
    backgroundColor: colors.primary + '18',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  headerCountText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  segmentedFilterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    backgroundColor: colors.surfaceLight,
    padding: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  filterPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMutedLight,
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  ownProfileNoteCard: {
    padding: 12,
    marginBottom: 14,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 12,
  },
  ownProfileNoteText: {
    color: '#1E40AF',
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18,
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginTop: 4,
  },
  emptyText: {
    color: colors.textMutedLight,
    fontSize: 13,
  },
  inputContainer: {
    marginBottom: spacing.l,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: colors.surfaceLight,
    color: colors.textMainLight,
    ...typography.body,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.s,
  },
  sendBtnDisabled: {
    backgroundColor: colors.textMutedLight,
  },
  replyingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundLight,
    padding: spacing.s,
    borderRadius: 8,
    marginBottom: spacing.s,
  },
  replyingText: {
    ...typography.caption,
    color: colors.textMainLight,
    fontWeight: '600',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.s,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    ...typography.body,
    color: colors.textMutedLight,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  commentWrapper: {
    marginBottom: spacing.m,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  avatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentMeta: {
    marginLeft: spacing.s,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMainLight,
  },
  timestamp: {
    ...typography.caption,
    color: colors.textMutedLight,
    marginLeft: spacing.s,
  },
  commentContent: {
    ...typography.body,
    fontSize: 14,
    color: colors.textMainLight,
    marginTop: 2,
    marginLeft: 32,
  },
  actionsRow: {
    flexDirection: 'row',
    marginLeft: 32,
    marginTop: 4,
  },
  actionBtn: {
    marginRight: spacing.m,
  },
  actionText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '500',
  },
  repliesContainer: {
    marginTop: spacing.s,
    borderLeftWidth: 1,
    borderLeftColor: colors.borderLight,
    paddingLeft: spacing.s,
    marginLeft: 12,
  },
});
