import { parse } from './src/parse.js';
import config from './src/config.js';

import { exec } from 'child_process';
import chokidar from 'chokidar';
import signale from 'signale';

import fs from 'fs';
import path from 'path';
import glob from 'glob';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { Command } from 'commander';
const program = new Command();

program
    .name('MarkTex')
    .description('MarkTex -> HTML compiler')
    .version('1.0.0');

program
    .requiredOption('-i, --input <input dir>', 'Input directory to convert', process.cwd())
    .requiredOption('-o, --output <output dir>', 'Output directory for HTML', path.join(process.cwd(), './out'))
    .option('--live <true | false>', 'Keep listening for file changes', true)
    .option('-p, --port <assets port>', 'Port for static assets server', config.assetsPort);
program.parse();

const options = program.opts();

// Validate some parameters
if (![true, false].includes(options.live)) {
    signale.error(`--live flag must be true or false`);
    process.exit(1);
}
if (Number.isNaN(options.port) || !Number.isInteger(options.port) || options.port <= 0) {
    signale.info(`--port flag must be an integer > 0`);
    process.exit(1);
}


/**
 * Convert a file to HTML and write to output
 * Will keep relative folders, ie if you had a file in input/hw1/text.mtx,
 * it will be written to output/hw1/text.html (folders will be created if missing)
 *
 * @param {string} filename Path to file to parse, must be under options.input
 */
function outFile(filename) {
    // Parse file and save to output
    fs.readFile(filename, 'utf-8', (err, data) => {
        if (err) {
            signale.fatal(`Error reading file "${filename}":\n  ${err}`);
            return;
        }

        const relativePath = path.relative(options.input, filename);
        const outPath = path.join(options.output, relativePath.replace('.' + config.fileExt, '.html'));
        const outDir = path.parse(outPath).dir;

        // Create out dir if it doesn't exist
        if (!fs.existsSync(outDir))
            fs.mkdirSync(outDir, { recursive: true });

        const html = `
<head>
    <link rel="stylesheet" href="http://localhost:${options.port}/css/index.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.1/dist/katex.min.css" integrity="sha384-pe7s+HmY6KvqRkrRRUr4alQJ0SkmzCft3RpK1ttGMa7qk8Abp/MEa/4wgceRHloO" crossorigin="anonymous">
    <link rel="stylesheet"
    href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/11.6.0/styles/default.min.css">
    <!--<script src="//cdnjs.cloudflare.com/ajax/libs/highlight.js/11.6.0/highlight.min.js"></script>-->
</head>

<body>
    <div class="content">
        ${parse(data)}
    </div>
</body>`;

        fs.writeFile(outPath, html, err2 => {
            if (err2)
                signale.fatal(`Error writing file "${outPath}":\n   ${err2}`);
        });
    });
}

// Write all files in folder on start
glob(path.join(options.input, `/**/*.${config.fileExt}`), {}, (err, files)=>{
    files.forEach(file => outFile(file));
    signale.success(`Parsed ${files.length} files in ${options.input}`);
});


if (options.live) {
    // Location of the public assets folder
    const publicPath = path.join(__dirname, 'public');

    // Start assets server
    exec(`npx http-server ${publicPath} -p ${options.port} --cors`, (error, stdout, stderr) => {
        if (error) {
            signale.fatal(`Asset server error: ${error.message}`);
            return;
        }
        if (stderr) {
            signale.warn(`Asset server stderr: ${stderr}`);
            return;
        }
        signale.info(`Assets server: ${stdout}`);
    });

    // Watch for file changes
    chokidar.watch(options.input).on('change', (filename, stats) => {
        if (!filename || !filename.endsWith(config.fileExt))
            return;
        outFile(filename);
        signale.success(`Updated file: ${filename}`);
    });

    signale.complete(`Live server started, assets server on port ${options.port}`);
}
