import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { spacing, typography } from '../../theme/theme';
import Typography from './Typography';
import CustomButton from '../forms/CustomButton';
import { useTheme } from '../../theme/ThemeProvider';

const CustomAlert = ({
  visible,
  title,
  message,
  onClose,
  buttons = [],
  type = 'info',
  reason = null,
  guidance = null,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const getIconConfig = () => {
    switch (type) {
      case 'error':
        return {
          name: 'alert-circle',
          color: colors.danger || '#EF4444',
          bgColor: (colors.danger || '#EF4444') + '18',
        };
      case 'warning':
        return {
          name: 'warning',
          color: colors.warning || '#F59E0B',
          bgColor: (colors.warning || '#F59E0B') + '18',
        };
      case 'success':
        return {
          name: 'checkmark-circle',
          color: colors.success || '#10B981',
          bgColor: (colors.success || '#10B981') + '18',
        };
      default:
        return {
          name: 'information-circle',
          color: colors.accent || colors.primary || '#E3B04B',
          bgColor: (colors.accent || colors.primary || '#E3B04B') + '18',
        };
    }
  };

  const iconConfig = getIconConfig();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.alertBox}>
          {/* Top Status Icon Badge */}
          <View style={[styles.iconBadge, { backgroundColor: iconConfig.bgColor }]}>
            <Icon name={iconConfig.name} size={32} color={iconConfig.color} />
          </View>

          <Typography variant="h2" style={styles.title}>{title}</Typography>
          
          {Boolean(message) && (
            <Typography variant="body" style={styles.message}>{message}</Typography>
          )}

          {/* Educational Reason & Next Steps Card */}
          {(Boolean(reason) || Boolean(guidance)) && (
            <View style={styles.educationalCard}>
              <View style={styles.educationalHeader}>
                <Icon name="bulb-outline" size={16} color={colors.accent || '#E3B04B'} style={{ marginRight: 6 }} />
                <Text style={styles.educationalHeaderTitle}>Why this happened & Next steps</Text>
              </View>

              {Boolean(reason) && (
                <View style={styles.educationalItem}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.educationalText}>
                    <Text style={styles.boldLabel}>Reason: </Text>{reason}
                  </Text>
                </View>
              )}

              {Boolean(guidance) && (
                <View style={[styles.educationalItem, { marginTop: 6 }]}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.educationalText}>
                    <Text style={styles.boldLabel}>Action: </Text>{guidance}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Buttons */}
          <View style={buttons.length > 2 ? styles.buttonContainerVertical : styles.buttonContainer}>
            {buttons.length > 0 ? (
              buttons.map((btn, index) => (
                <CustomButton
                  key={index}
                  title={btn.text}
                  onPress={() => {
                    btn.onPress && btn.onPress();
                    onClose();
                  }}
                  variant={btn.variant || (btn.style === 'cancel' ? 'outline' : 'primary')}
                  style={[
                    buttons.length > 2 ? { width: '100%' } : styles.button,
                    index > 0 && (buttons.length > 2 ? styles.buttonMarginVertical : styles.buttonMargin)
                  ]}
                />
              ))
            ) : (
              <CustomButton
                title="Understood"
                onPress={onClose}
                style={styles.singleButton}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (colors) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.l,
  },
  alertBox: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.surfaceLight || colors.card || '#FFFFFF',
    borderRadius: 20,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderLight || '#E8E4DA',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  iconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  title: {
    color: colors.textMainLight || colors.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 20,
  },
  message: {
    color: colors.textSecondaryLight || colors.textMutedLight || '#6B7280',
    textAlign: 'center',
    marginBottom: spacing.m,
    fontSize: 14,
    lineHeight: 20,
  },
  educationalCard: {
    width: '100%',
    backgroundColor: colors.backgroundLight || '#F8F6F1',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight || '#E8E4DA',
    padding: spacing.m,
    marginBottom: spacing.l,
  },
  educationalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight || '#E8E4DA',
    paddingBottom: 6,
  },
  educationalHeaderTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent || colors.primary || '#C8952B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  educationalItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletDot: {
    fontSize: 14,
    color: colors.accent || colors.primary || '#C8952B',
    marginRight: 6,
    lineHeight: 18,
  },
  educationalText: {
    flex: 1,
    fontSize: 13,
    color: colors.textMainLight || '#1A1C1F',
    lineHeight: 18,
  },
  boldLabel: {
    fontWeight: '700',
    color: colors.textMainLight || '#1A1C1F',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 4,
  },
  buttonContainerVertical: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 4,
  },
  button: {
    flex: 1,
  },
  buttonMargin: {
    marginLeft: spacing.m,
  },
  buttonMarginVertical: {
    marginTop: spacing.m,
  },
  singleButton: {
    minWidth: 140,
    width: '100%',
  }
});

export default CustomAlert;
