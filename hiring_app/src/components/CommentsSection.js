import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Image, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { useGetCommentsQuery, useAddCommentMutation, useUpdateCommentMutation, useDeleteCommentMutation } from '../services/commentsApi';
import { colors, typography, spacing } from '../theme/theme';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const CommentItem = ({ comment, depth = 0, onReply, onEdit, onDelete, currentUserId, onPressProfile }) => {
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

export default function CommentsSection({ targetType, targetId, disableComment = false }) {
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
      Alert.alert('Error', 'Failed to post comment.');
    }
  };

  const handleDelete = (comment) => {
    Alert.alert('Delete Comment', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await deleteComment({ type: targetType, commentId: comment.id, targetId }).unwrap();
        } catch (e) {
          Alert.alert('Error', 'Failed to delete comment.');
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

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'artists' && styles.activeTab]} 
          onPress={() => setActiveTab('artists')}
        >
          <Text style={[styles.tabText, activeTab === 'artists' && styles.activeTabText]}>Artists</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'recruiters' && styles.activeTab]} 
          onPress={() => setActiveTab('recruiters')}
        >
          <Text style={[styles.tabText, activeTab === 'recruiters' && styles.activeTabText]}>Recruiters</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Comments ({filteredComments.length})</Text>

      {/* Input Area */}
      {(!disableComment || replyingTo || editing) && (
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
              placeholder="Write a comment..."
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
      )}

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
        <Text style={styles.emptyText}>No comments yet. Be the first!</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.m,
  },
  title: {
    ...typography.h3,
    color: colors.textMainLight,
    marginBottom: spacing.m,
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
  emptyText: {
    ...typography.body,
    color: colors.textMutedLight,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: spacing.m,
  }
});
