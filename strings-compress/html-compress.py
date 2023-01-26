
import argparse
import re
import sys
from pathlib import Path
import subprocess
import tempfile

parser = argparse.ArgumentParser()

parser.add_argument('filename')
parser.add_argument('-o', '--out', default=None)

args = parser.parse_args()

with open(args.filename, 'r', encoding='utf-8') as fd:
    html = fd.read()

tags_re = re.compile(r'(<style(?:\s+.*?)?>.+?</style>)|(<script(?:\s+.*?)?>)(.+?)(</script>)', flags=re.IGNORECASE|re.DOTALL)

match_count = 0

def get_code(add_tags: bool) -> str:
    global match_count
    match_count += 1
    if match_count > 1:
        return ''
    script_dir = Path(__file__).parent
    try_paths = [
        'decompress-string.min.js',
        '../decompress-string.min.js',
        '../dist/decompress-string.min.js',
    ]
    file: 'Path|None' = None
    for path in try_paths:
        if (script_dir / path).exists():
            file = script_dir / path
            break
    else:
        raise Exception('Could not find "decompress-string.min.js"')
    result = file.read_text()
    if add_tags:
        result = f'<script>{result}</script>'
    return result

def compress_string(string: str) -> str:
    input_file = tempfile.NamedTemporaryFile('w', delete=False)
    output_file = tempfile.NamedTemporaryFile('w', delete=False)
    input_name = input_file.name
    output_name = output_file.name
    output_file.close()
    input_file.write(string)
    input_file.close()
    subprocess.run([
        sys.executable,
        str(Path(__file__).parent / 'strings-compress.py'),
        '-a', 'js-single-quote',
        '-o', output_name,
        input_name], check=True)
    result = Path(output_name).read_text()
    Path(input_name).unlink()
    Path(output_name).unlink()
    if len(result.strip()) < 16:
        raise Exception('Could not execute "strings-compress.py" or execution failed.')
    return result

def compress_style(text: str) -> str:
    if len(text.strip()) < 256:
        print('Skipping style compression - content too short.')
        return text
    print('Found long style tag - compressing...')
    compressed = compress_string(text)
    if len(compressed) + 53 > len(text):
        print('Skipping style compression - content uncompressible.')
        return text
    return f'<script>{get_code(False)}document.write(decompressString(\'{compressed}\'))</script>'

def compress_script(open_tag: str, source_code: str, close_tag: str) -> str:
    if len(source_code.strip()) < 256:
        print('Skipping script compression - content too short.')
        return f'{open_tag}{source_code}{close_tag}'
    print('Found long script - compressing...')
    compressed = compress_string(source_code)
    if len(compressed) + 27 > len(source_code):
        print('Skipping script compression - content uncompressible.')
        return f'{open_tag}{source_code}{close_tag}'
    return f'{get_code(True)}{open_tag}eval(decompressString(\'{compressed}\')){close_tag}'

def compress_tags(match: re.Match) -> str:
    if match.group(1):
        return compress_style(match.group(1))
    else:
        return compress_script(match.group(2), match.group(3), match.group(4))

out = tags_re.sub(compress_tags, html)

if args.out is None:
    print(out)
else:
    print(f'Compression done.')
    print(f'Size before: {len(html)}')
    print(f'Size after:  {len(out)}')
    print(f'Ratio:       {round(len(out) / len(html) * 1000) / 10}%')
    with open(args.out, 'w', encoding='utf-8') as fd:
        fd.write(out)
