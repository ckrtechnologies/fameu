import React from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import { spacing } from '../../theme/theme';
import Typography from './Typography';
import CustomButton from '../forms/CustomButton';
import { useTheme } from '../../theme/ThemeProvider';

const CustomAlert = ({
  visible,
  title,
  message,
  onClose,
  buttons = [], 
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.alertBox}>
          <Typography variant="h2" style={styles.title}>{title}</Typography>
          <Typography variant="body" style={styles.message}>{message}</Typography>
          
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
                title="OK"
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.l,
  },
  alertBox: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderDark,
    alignItems: 'center',
  },
  title: {
    color: colors.primary,
    marginBottom: spacing.s,
    textAlign: 'center',
  },
  message: {
    color: colors.textMain,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  buttonContainerVertical: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
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
    minWidth: 120,
  }
});

export default CustomAlert;
