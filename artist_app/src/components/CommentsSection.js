import { GlobalAlert } from './core/GlobalAlert';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Image, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { useGetCommentsQuery, useAddCommentMutation, useUpdateCommentMutation, useDeleteCommentMutation } from '../services/commentsApi';
import { typography, spacing } from '../theme/theme';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useTheme } from '../theme/ThemeProvider';

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
        <View style={styles.repliesContainer}>
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

export default function CommentsSection({ targetType, targetId, disableComment = false, isOwnProfile = false, profileUserId = null }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation();
  const user = useSelector(state => state.auth.user);
  const { data: response, isLoading } = useGetCommentsQuery({ type: targetType, targetId }, { skip: !targetId, refetchOnMountOrArgChange: true });
  const [addComment, { isLoading: isAdding }] = useAddCommentMutation();
  const [updateComment, { isLoading: isUpdating }] = useUpdateCommentMutation();
  const [deleteComment, { isLoading: isDeleting }] = useDeleteCommentMutation();

  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [editing, setEditing] = useState(null);
  const [activeTab, setActiveTab] = useState('artists'); // 'artists' | 'recruiters'

  const comments = response?.data || [];
  
  const isSelfProfile = Boolean(isOwnProfile || (profileUserId && user?.id && profileUserId === user.id));
  const showCommentInput = (!isSelfProfile && !disableComment) || replyingTo || editing;

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
      GlobalAlert.showError('Unable to Post Comment', error, 'Your comment could not be submitted.');
    }
  };

  const handleDelete = (comment) => {
    GlobalAlert.show('Delete Comment', 'Are you sure you want to delete this comment? This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await deleteComment({ type: targetType, commentId: comment.id, targetId }).unwrap();
        } catch (e) {
          GlobalAlert.showError('Unable to Delete Comment', e, 'Your comment could not be deleted.');
        }
      }}
    ]);
  };

  const handlePressProfile = (username) => {
    if (username) {
      navigation.push('PublicProfile', { username });
    }
  };

  const artistCommentsCount = comments.filter(c => c.user?.role === 'artist').length;
  const recruiterCommentsCount = comments.filter(c => c.user?.role === 'hiring').length;

  if (isLoading) return <ActivityIndicator style={{ margin: 20 }} color={colors.primary} />;

  return (
    <View style={styles.container}>
      {/* 1. Comments Box Section (Top) - Only shown if not self profile or actively replying/editing */}
      {showCommentInput && (
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBadge, { backgroundColor: colors.primary + '15' }]}>
              <Icon name={replyingTo ? "return-down-forward" : "chatbubble-ellipses"} size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>{replyingTo ? 'Reply to Comment' : editing ? 'Edit Comment' : 'Add Comment'}</Text>
              <Text style={styles.sectionSubtitle}>
                {replyingTo ? 'Reply directly to this feedback' : editing ? 'Update your comment' : 'Share public questions or feedback'}
              </Text>
            </View>
          </View>

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
                placeholder={replyingTo ? "Write a reply..." : "Write a comment..."}
                placeholderTextColor={colors.textMutedLight}
                value={inputText}
                onChangeText={setInputText}
                multiline
              />
              <TouchableOpacity onPress={handleSubmit} disabled={isAdding || isUpdating || !inputText.trim()} style={[styles.sendBtn, (!inputText.trim() || isAdding || isUpdating) && styles.sendBtnDisabled]}>
                {(isAdding || isUpdating) ? <ActivityIndicator size="small" color="#FFF" /> : <Icon name="send" size={18} color="#FFF" />}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* 2. Historical Comments Section (Below) */}
      <View style={[styles.sectionBlock, styles.historicalBlock]}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconBadge, { backgroundColor: colors.borderLight + '60' }]}>
            <Icon name="time-outline" size={18} color={colors.textMainLight} />
          </View>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.sectionTitle}>What others say?</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{comments.length}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.historicalSubtitle}>Browse previous discussions and responses from artists & recruiters</Text>

        {/* Filter Tabs strictly inside Historical Comments */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'artists' && styles.activeTab]} 
            onPress={() => setActiveTab('artists')}
          >
            <Text style={[styles.tabText, activeTab === 'artists' && styles.activeTabText]}>
              Artists ({artistCommentsCount})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'recruiters' && styles.activeTab]} 
            onPress={() => setActiveTab('recruiters')}
          >
            <Text style={[styles.tabText, activeTab === 'recruiters' && styles.activeTabText]}>
              Recruiters ({recruiterCommentsCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Historical Comments List */}
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
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: {
    marginTop: spacing.l,
    width: '100%',
    paddingHorizontal: 0,
  },
  sectionBlock: {
    width: '100%',
    backgroundColor: colors.surfaceLight || '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight || '#E5E7EB',
    padding: spacing.m,
    marginBottom: spacing.l,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  historicalBlock: {
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  sectionIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sectionTitle: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMainLight,
  },
  sectionSubtitle: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textMutedLight,
    marginTop: 1,
  },
  historicalSubtitle: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textMutedLight,
    marginBottom: spacing.m,
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: colors.primary + '18',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  countBadgeText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  inputContainer: {
    marginTop: spacing.s,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 110,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: colors.backgroundLight || '#F9FAFB',
    color: colors.textMainLight,
    ...typography.body,
    fontSize: 14,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
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
    backgroundColor: colors.primary + '10',
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    padding: spacing.s,
    borderRadius: 8,
    marginBottom: spacing.s,
  },
  replyingText: {
    ...typography.caption,
    color: colors.textMainLight,
    fontWeight: '600',
    flex: 1,
    marginRight: spacing.s,
  },
  disabledCard: {
    padding: spacing.m,
    borderRadius: 12,
    backgroundColor: colors.backgroundLight,
    marginTop: spacing.s,
    alignItems: 'center',
  },
  disabledText: {
    ...typography.caption,
    color: colors.textMutedLight,
    fontStyle: 'italic',
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
    fontSize: 13,
    color: colors.textMutedLight,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '700',
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
    lineHeight: 20,
  },
  actionsRow: {
    flexDirection: 'row',
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
  emptyContainer: {
    paddingVertical: spacing.l,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    fontSize: 13,
    color: colors.textMutedLight,
    textAlign: 'center',
    fontStyle: 'italic',
  }
});
