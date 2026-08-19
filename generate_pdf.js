const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { mdToPdf } = require('md-to-pdf');

async function main() {
    console.log("Parsing SCREEN-MAP.md...");
    const screenMap = fs.readFileSync('./docs/SCREEN-MAP.md', 'utf8');
    
    // Regex to match table rows: | ID | Name | Purpose |
    const regex = /\|\s*([\w\-]+)\s*\|\s*([^\|]+)\s*\|\s*([^\|]+)\s*\|/g;
    
    const metadata = {};
    let match;
    while ((match = regex.exec(screenMap)) !== null) {
        const id = match[1].trim();
        const name = match[2].replace(/\*(new, L2)\*/g, '').replace(/\*(new, L2)\*/, '').trim(); 
        const desc = match[3].trim();
        if (id.length > 0 && id !== 'n-0' && id !== '#') {
            metadata[id] = { name, desc };
        }
    }
    
    // For n-0 to n-7, it translates to AA-0..AA-7 and HA-0..HA-7
    for (let i=0; i<=7; i++) {
        const base = metadata[`n-${i}`];
        if (base) {
            metadata[`AA-${i}`] = { name: "Artist Auth: " + base.name, desc: base.desc };
            metadata[`HA-${i}`] = { name: "Hiring Auth: " + base.name, desc: base.desc };
        }
    }

    // Now gather all HTML files
    const folders = ['artist', 'hiring', 'admin'];
    const filesToProcess = [];
    
    for (const folder of folders) {
        const dirPath = path.join('./prototypes', folder);
        if (fs.existsSync(dirPath)) {
            const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.html'));
            for (const file of files) {
                const idMatch = file.match(/^([A-Z]+-\d+)/);
                const id = idMatch ? idMatch[1] : null;
                filesToProcess.push({
                    id,
                    file,
                    folder,
                    fullPath: `file://${path.resolve(dirPath, file)}`
                });
            }
        }
    }

    console.log(`Found ${filesToProcess.length} HTML files.`);
    
    // Sort logically by folder then by ID
    filesToProcess.sort((a, b) => {
        if (a.folder !== b.folder) return a.folder.localeCompare(b.folder);
        return a.id && b.id ? a.id.localeCompare(b.id, undefined, {numeric: true}) : 0;
    });

    // Take screenshots
    console.log("Launching browser to capture screenshots...");
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 900 });

    const screenshotsDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir);

    let markdownContent = `<div style="text-align: center; margin-top: 150px;">\n\n# Fameu Platform\n\n## Full UI Prototype Reference\n\n*Generated automatically with AI*\n\n</div>\n\n<div class="page-break"></div>\n\n`;

    for (let i = 0; i < filesToProcess.length; i++) {
        const item = filesToProcess[i];
        console.log(`[${i+1}/${filesToProcess.length}] Screenshotting ${item.file}...`);
        
        await page.goto(item.fullPath, { waitUntil: 'networkidle' });
        const screenshotPath = path.join(screenshotsDir, `${item.id || i}.png`);
        
        // Wait an extra 500ms to allow animations or fonts to render
        await page.waitForTimeout(500); 

        // If it's admin, screenshot the whole thing, otherwise just the bounding box of the mobile frame
        // Admin screens are full width. Artist/Hiring have the 390x844 box.
        if (item.folder === 'admin') {
            await page.screenshot({ path: screenshotPath, fullPage: true });
        } else {
            // Find the mobile frame
            const elementHandle = await page.$('.max-w-\\[390px\\]');
            if (elementHandle) {
                await elementHandle.screenshot({ path: screenshotPath });
            } else {
                await page.screenshot({ path: screenshotPath, fullPage: true });
            }
        }

        const meta = metadata[item.id] || { name: item.file.replace('.html', ''), desc: "No description provided." };
        
        markdownContent += `### ${item.folder.toUpperCase()} | ${item.id ? item.id + " : " : ""}${meta.name.replace(/\*\*/g, '')}\n\n`;
        markdownContent += `**Purpose:** ${meta.desc.replace(/\*\*/g, '')}\n\n`;
        
        // Use HTML img tag for resizing to fit page nicely
        markdownContent += `<img src="./screenshots/${item.id || i}.png" style="max-height: 800px; max-width: 100%; border: 1px solid #ccc; border-radius: 8px;" />\n\n`;
        markdownContent += `<div class="page-break"></div>\n\n`; 
    }

    await browser.close();

    console.log("Writing Markdown...");
    const css = `
        .page-break { page-break-after: always; }
        body { font-family: -apple-system, sans-serif; color: #333; }
        h3 { border-bottom: 2px solid #E3B04B; padding-bottom: 8px; margin-top: 30px; }
        img { box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
    `;
    
    fs.writeFileSync('./Fameu_Screen_Reference.md', markdownContent);

    console.log("Converting to PDF...");
    try {
        const pdf = await mdToPdf({ path: './Fameu_Screen_Reference.md' }, {
            dest: './Fameu_Screen_Reference.pdf',
            css: css,
            pdf_options: {
                format: 'A4',
                margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
                printBackground: true
            }
        });
        console.log("PDF generated successfully at /Users/chandanmallik/projects/Fameu/Fameu_Screen_Reference.pdf");
    } catch (e) {
        console.error("PDF Generation failed:", e);
    }
}

main().catch(console.error);
