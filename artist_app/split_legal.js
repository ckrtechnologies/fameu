const fs = require('fs');
const text = fs.readFileSync('/Users/chandanmallik/projects/Fameu/artist_app/src/constants/LegalText.js', 'utf8');
const termsStart = text.indexOf('ANNEXURE 1: GENERAL TERMS OF USE');
const privacyStart = text.indexOf('ANNEXURE 2: PRIVACY POLICY');

const termsText = text.substring(termsStart, privacyStart);
const privacyText = text.substring(privacyStart, text.length - 2);

fs.writeFileSync('/Users/chandanmallik/.gemini/antigravity-ide/brain/349a5e77-a8ea-4e40-882d-2adc09ebabc9/terms_of_service.md', '# Terms of Service\n\n' + termsText);
fs.writeFileSync('/Users/chandanmallik/.gemini/antigravity-ide/brain/349a5e77-a8ea-4e40-882d-2adc09ebabc9/privacy_policy.md', '# Privacy Policy\n\n' + privacyText);
console.log('Done');
