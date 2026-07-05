import os
import re

def process_file(filepath, app_root):
    with open(filepath, 'r') as f:
        content = f.read()

    original_content = content
    
    # Check if Alert is imported
    if not 'Alert' in content:
        return False
        
    # Replacements for Alert.alert('Error', ...)
    # Regex handles single or double quotes
    content = re.sub(
        r"Alert\.alert\(\s*['\"]Error['\"]\s*,\s*(.*?)\s*\);",
        r"showError('', \1);",
        content,
        flags=re.DOTALL
    )
    
    # Replacements for Alert.alert('Success', ...)
    content = re.sub(
        r"Alert\.alert\(\s*['\"]Success['\"]\s*,\s*(.*?)\s*\);",
        r"showSuccess('', \1);",
        content,
        flags=re.DOTALL
    )

    if content != original_content:
        # Need to add import
        # Calculate relative path to utils/toast
        file_dir = os.path.dirname(filepath)
        utils_dir = os.path.join(app_root, 'src', 'utils')
        rel_path = os.path.relpath(utils_dir, file_dir)
        import_stmt = f"import {{ showError, showSuccess }} from '{rel_path}/toast';"
        
        if import_stmt not in content:
            # Insert after the last import
            lines = content.split('\n')
            last_import = -1
            for i, line in enumerate(lines):
                if line.startswith('import '):
                    last_import = i
                    
            if last_import != -1:
                lines.insert(last_import + 1, import_stmt)
            else:
                lines.insert(0, import_stmt)
            
            content = '\n'.join(lines)
            
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Refactored {filepath}")
        return True
    return False

apps = [
    '/Users/chandanmallik/projects/Fameu/artist_app',
    '/Users/chandanmallik/projects/Fameu/hiring_app'
]

for app in apps:
    screens_dir = os.path.join(app, 'src', 'screens')
    for root, dirs, files in os.walk(screens_dir):
        for file in files:
            if file.endswith('.js') or file.endswith('.tsx'):
                process_file(os.path.join(root, file), app)

