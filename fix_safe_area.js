const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('SafeAreaView')) {
        // Only replace if it's imported from react-native-safe-area-context
        if (content.includes('react-native-safe-area-context')) {
          content = content.replace(/import\s+{([^}]*?)}\s+from\s+['"]react-native-safe-area-context['"];?/g, (match, p1) => {
            const imports = p1.split(',').map(s => s.trim()).filter(s => s !== 'SafeAreaView' && s !== 'SafeAreaProvider');
            if (imports.length === 0) return '';
            return `import { ${imports.join(', ')} } from 'react-native-safe-area-context';`;
          });
        }
        
        // Remove SafeAreaView from react-native if it was imported there
        content = content.replace(/import\s+{([^}]*?)}\s+from\s+['"]react-native['"];?/g, (match, p1) => {
          const imports = p1.split(',').map(s => s.trim()).filter(s => s !== 'SafeAreaView');
          if (imports.length === 0) return "import 'react-native';";
          return `import { ${imports.join(', ')} } from 'react-native';`;
        });

        // Replace <SafeAreaView ...> with <View ...> and </SafeAreaView> with </View>
        // and remove edges={...}
        content = content.replace(/<SafeAreaView([^>]*)edges=\{[^}]+\}([^>]*)>/g, '<View$1$2>');
        content = content.replace(/<SafeAreaView/g, '<View');
        content = content.replace(/<\/SafeAreaView>/g, '</View>');

        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDir('./artist_app/src/screens');
processDir('./hiring_app/src/screens');
console.log('Done replacing SafeAreaView in screens.');
