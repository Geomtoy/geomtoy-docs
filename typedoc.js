const typeDoc = require("typedoc");
const fs = require("fs/promises");
const path = require("path");

const pkgConfig = {
    entryPoints: ["./geomtoy/packages/util", "./geomtoy/packages/core", "./geomtoy/packages/view"],
    docsGenDir: "./dist"
};

async function main() {
    const app = new typeDoc.Application();

    app.bootstrap({
        name: "Geomtoy",
        entryPointStrategy: "packages",
        cleanOutputDir: true,
        entryPoints: pkgConfig.entryPoints,
        includeVersion: false,
        excludePrivate: true,
        excludeProtected: true,
        excludeInternal: true,
        disableSources: true,
        readme: "none",
        out: pkgConfig.docsGenDir,
        sort: ["static-first"],
        markedOptions: {
            mangle: false,
            walkTokens(token) {
                if (token.type === "escape" && token.text === "\\") {
                    // unescape "\\" for latex
                    token.text = "\\\\";
                }
                if (token.type === "em" && token.raw.match(/^_[^_]+_$/)) {
                    // unescape "_" for latex, so we should not use "_" to make italic in markdown nor use "*" to multiply in latex
                    token.text = token.raw;
                    token.type = "text";
                    delete token.tokens;
                }
            }
        },
        categorizeByGroup: true,
        categoryOrder: ["Entry", "Base", "Adaptor", "*"]
    });

    // options for `typedoc-plugin-extras`, must after `app.bootstrap`
    app.options.setValue("favicon", "./favicon.ico");
    app.options.setValue("customDescription", "A 2D geometry responsive computing, visualizing and interacting library.");
    app.options.setValue("footerDate", true);
    app.options.setValue("footerTime", true);

    const project = app.convert();
    // project may not have converted correctly
    if (project) {
        // render docs
        await app.generateDocs(project, app.options.getValue("out"));
        // do some css/js modify
        const docCssPath = path.resolve(pkgConfig.docsGenDir, "assets/style.css");
        const docJsPath = path.resolve(pkgConfig.docsGenDir, "assets/main.js");
        const docAssetDir = path.resolve(pkgConfig.docsGenDir, "assets/");

        const katexDistPath = path.dirname(require.resolve("katex"));
        const katexCssPath = path.resolve(katexDistPath, "katex.min.css");
        const katexJsPath = path.resolve(katexDistPath, "katex.min.js");
        const katexAutoRenderPath = path.resolve(katexDistPath, "contrib/auto-render.min.js");
        const katexFontDir = path.resolve(katexDistPath, "fonts");

        let docCss = await fs.readFile(docCssPath, "utf-8");
        let docJs = await fs.readFile(docJsPath, "utf-8");
        // modify `comment` classes
        docCss += `
            dl.tsd-comment-tags dt {
                display: inline-block;
                float: none !important;
                margin: 0 0 10px 0 !important;
            }
        `;
        // add `katex` css and js
        let katexCss = await fs.readFile(katexCssPath, "utf-8");
        let katexJs = await fs.readFile(katexJsPath, "utf-8");
        let katexAutoRenderJs = await fs.readFile(katexAutoRenderPath, "utf-8");
        docCss += katexCss;
        docJs +=
            katexJs +
            katexAutoRenderJs +
            `;(function(){
            renderMathInElement(document.body, {
                delimiters: [
                    {left: '$$', right: '$$', display: true},
                    {left: '$', right: '$', display: false},
                ]
            })
            })()`;
        await fs.writeFile(docCssPath, docCss);
        await fs.writeFile(docJsPath, docJs);
        // copy `katex` fonts
        await fs.mkdir(path.resolve(docAssetDir, "fonts"));
        const fonts = await fs.readdir(katexFontDir);
        fonts.forEach(async fontName => {
            await fs.copyFile(path.resolve(katexFontDir, fontName), path.resolve(docAssetDir, "fonts", fontName));
        });
    }
}

main().catch(console.error);
