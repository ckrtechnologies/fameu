const fs = require('fs');

const createStandardToast = (bgColor, iconColor) => `
    <TouchableOpacity 
      style={{
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: colors.surfaceLight,
        borderRadius: 12,
        padding: 12,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
        width: '90%',
        borderLeftWidth: 4,
        borderLeftColor: ${bgColor}
      }}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={{ width: 44, height: 44, borderRadius: 22, marginRight: 12, backgroundColor: ${bgColor}, justifyContent: 'center', alignItems: 'center' }}>
        <Icon name={props.iconName || 'information-circle'} size={24} color={${iconColor}} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ ...typography.h3, color: colors.textMainLight } as any}>{text1 != null ? String(text1) : ''}</Text>
        <Text style={{ ...typography.body, color: colors.textMutedLight, marginTop: 2 } as any} numberOfLines={2}>{text2 != null ? String(text2) : ''}</Text>
      </View>
    </TouchableOpacity>
`;

function patchApp(appPath) {
  let content = fs.readFileSync(appPath, 'utf8');

  // Add ErrorBoundary import
  if (!content.includes('ErrorBoundary')) {
    content = content.replace(
      "import Toast from 'react-native-toast-message';",
      "import Toast from 'react-native-toast-message';\nimport ErrorBoundary from './src/components/core/ErrorBoundary';"
    );
  }

  // Add fameu custom toasts to config
  if (!content.includes('fameuSuccess')) {
    const customToasts = `
  fameuSuccess: ({ text1, text2, props, onPress }: any) => (
${createStandardToast('colors.success', "'#FFF'").replace(/props\.iconName \|\| 'information-circle'/g, "'checkmark-circle'")}  ),
  fameuError: ({ text1, text2, props, onPress }: any) => (
${createStandardToast('colors.danger', "'#FFF'").replace(/props\.iconName \|\| 'information-circle'/g, "'alert-circle'")}  ),
  fameuWarning: ({ text1, text2, props, onPress }: any) => (
${createStandardToast('colors.warning', "'#FFF'").replace(/props\.iconName \|\| 'information-circle'/g, "'warning'")}  ),
  fameuInfo: ({ text1, text2, props, onPress }: any) => (
${createStandardToast('colors.primary', "'#FFF'").replace(/props\.iconName \|\| 'information-circle'/g, "'information-circle'")}  ),
`;
    content = content.replace('customNotification: ({', customToasts + '\n  customNotification: ({');
  }

  // Wrap in ErrorBoundary
  if (!content.includes('<ErrorBoundary>')) {
    content = content.replace(
      /<Provider store={store}>[\s\S]*?<\/Provider>/,
      `<ErrorBoundary>\n    $&  \n    </ErrorBoundary>`
    );
  }

  fs.writeFileSync(appPath, content, 'utf8');
  console.log(`Patched ${appPath}`);
}

patchApp('/Users/chandanmallik/projects/Fameu/artist_app/App.tsx');
patchApp('/Users/chandanmallik/projects/Fameu/hiring_app/App.tsx');
