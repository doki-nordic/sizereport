# Simple and fast text compression

It it primarily designed to compress text inside a big HTML files.
It is able to compress between string and string - no binary representation is needed, so there is no need to encode it e.g. in base64 encoding.

## html-compress.py

Tool that finds long `<script>` and `<style>` tags and replaces them with a JavaScript containing compressed representation of it contents.
It also embeds `decompress-string.min.js` to decompress them.

## string-compress.py

Compress a file.

## decompress-string.ts

TypeScript code containing single function that decompresses an input string and returns a decompressed string.
Compiled and minified version is `decompress-string.min.js`.
