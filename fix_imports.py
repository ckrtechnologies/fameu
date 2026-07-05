import os
import re

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Find all toast import variations that the previous script might have inserted
    # It inserted: import { showError, showSuccess } from '../../utils/toast';
    
    pattern = r"import \{ showError, showSuccess \} from '\.\./\.\./utils/toast';"
    
    # If the file doesn't have the import, skip
    if not re.search(pattern, content):
        return

    # Remove all instances of the import
    clean_content = re.sub(pattern + r"\n*", "", content)
    
    # If we actually removed something, add it back to the very top (after first import to be safe, or just at line 0)
    if clean_content != content:
        # Just prepend it to the file
        new_content = "import { showError, showSuccess } from '../../utils/toast';\n" + clean_content
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Fixed imports in {filepath}")

apps = [
    '/Users/chandanmallik/projects/Fameu/artist_app',
    '/Users/chandanmallik/projects/Fameu/hiring_app'
]

for app in apps:
    screens_dir = os.path.join(app, 'src', 'screens')
    for root, dirs, files in os.walk(screens_dir):
        for file in files:
            if file.endswith('.js') or file.endswith('.tsx'):
                fix_file(os.path.join(root, file))

