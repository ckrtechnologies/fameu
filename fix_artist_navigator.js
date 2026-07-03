const fs = require('fs');
const path = './artist_app/src/navigation/MainNavigator.js';

let content = fs.readFileSync(path, 'utf8');

// 1. Add imports
const imports = `import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';

const withSafeArea = (Component) => (props) => {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDarkMode ? '#000' : '#FFF' }}>
      <Component {...props} />
    </SafeAreaView>
  );
};
`;

content = content.replace('const Stack = createNativeStackNavigator();', imports + '\nconst Stack = createNativeStackNavigator();');

// 2. Wrap screens
content = content.replace(/<Stack\.Screen name="([^"]+)" component=\{([^}]+)\}\s*\/>/g, (match, name, component) => {
  if (name === 'MainTabs') {
    return match; // Don't wrap DrawerNavigator
  }
  return `<Stack.Screen name="${name}" component={withSafeArea(${component})} />`;
});

fs.writeFileSync(path, content);
console.log('Done');
