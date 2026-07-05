import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { colors, spacing } from '../../theme/theme';
import Typography from './Typography';
import CustomButton from '../forms/CustomButton';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <Typography variant="h1" style={styles.title}>
              Oops! Something went wrong.
            </Typography>
            <Typography variant="body" style={styles.message}>
              The app encountered an unexpected error.
            </Typography>
            {__DEV__ && this.state.error && (
              <View style={styles.devErrorBox}>
                <Typography variant="body" style={styles.devErrorText}>
                  {this.state.error.toString()}
                </Typography>
              </View>
            )}
            <CustomButton
              title="Try Again"
              onPress={this.handleReset}
              style={styles.button}
            />
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  title: {
    color: colors.primary,
    marginBottom: spacing.m,
    textAlign: 'center',
  },
  message: {
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  button: {
    minWidth: 200,
  },
  devErrorBox: {
    backgroundColor: '#FFE5E5',
    padding: spacing.m,
    borderRadius: 8,
    marginBottom: spacing.xl,
    width: '100%',
  },
  devErrorText: {
    color: '#D8000C',
    fontSize: 12,
  },
});

export default ErrorBoundary;
