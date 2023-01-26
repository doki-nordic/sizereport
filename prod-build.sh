#!/bin/bash
set -e

rm -Rf web-build
mkdir -p web-build
cd web-build
find ../web -mindepth 1 -maxdepth 1 ! -name '.*' ! -name build -exec cp -R {} ./ \;
npm install --save-dev html-inline-css-webpack-plugin html-inline-script-webpack-plugin
npm update
npm run eject << 'EOF'
y
y
y
y
y

EOF
npm update

line=`grep -n 'InlineChunkHtmlPlugin(' config/webpack.config.js | cut -f1 -d:`
head -n $line config/webpack.config.js > tmp.tmp
echo "new HTMLInlineCSSWebpackPlugin()," >> tmp.tmp
echo "new HtmlInlineScriptPlugin()," >> tmp.tmp
echo "new webpack.NormalModuleReplacementPlugin(/.*\\/generated-icons\\/16px\\/paths$/, path.resolve(__dirname, '../src/icons16.ts'))," >> tmp.tmp
echo "new webpack.NormalModuleReplacementPlugin(/.*\\/generated-icons\\/20px\\/paths$/, path.resolve(__dirname, '../src/icons20.ts'))," >> tmp.tmp
echo "new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 })," >> tmp.tmp
tail -n +$((line+1)) config/webpack.config.js >> tmp.tmp

line=`grep -m 1 -n const tmp.tmp | cut -f1 -d:`
head -n $line tmp.tmp > tmp2.tmp
echo "const HTMLInlineCSSWebpackPlugin = require('html-inline-css-webpack-plugin').default;" >> tmp2.tmp
echo "const HtmlInlineScriptPlugin = require('html-inline-script-webpack-plugin');" >> tmp2.tmp
tail -n +$((line+1)) tmp.tmp >> tmp2.tmp

sed -i 's/inject: true/scriptLoading: "blocking", inject: "body"/' tmp2.tmp

cp tmp2.tmp config/webpack.config.js
rm -f tmp.tmp tmp2.tmp

npm run build

python ../strings-compress/html-compress.py -o ../main.html build/index.html
