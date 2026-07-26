import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { spacing } from '../../theme/theme';
import Typography from './Typography';
import CustomButton from '../forms/CustomButton';
import { useTheme } from '../../theme/ThemeProvider';

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
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginBottom: spacing.m,
    color: '#ef4444',
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    marginBottom: spacing.xl,
    color: '#6b7280',
  },
  devErrorBox: {
    backgroundColor: '#f3f4f6',
    padding: spacing.m,
    borderRadius: 8,
    marginBottom: spacing.xl,
    width: '100%',
  },
  devErrorText: {
    color: '#374151',
    fontSize: 12,
  },
  button: {
    width: '100%',
  }
});

export default ErrorBoundary;
