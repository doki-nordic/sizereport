

'''
Format:
* allowed alphabet of length N,
* escape characters (must be subset of allowed alphabet) of length M,
* first escape character,
* integer fields, encoded in base-N using allowed alphabet,
  * maximum offset values in two-, three-, four-, and five-character escape encoding (3 characters per field),
  * maximum count values in two-, three-, four-, and five-character escape encoding (2 characters per field),
  * number of escaped literals in two-, three-, four-, and five-character escape encoding (2 characters per field),
  * array of literal values, count is sum of "literal" values above (2 characters per field),
  * length of decompressed string (6 characters long field),

'''

import argparse
import math

parser = argparse.ArgumentParser()

parser.add_argument('filename')
parser.add_argument('-a', '--alphabet', default=None)
parser.add_argument('-o', '--out', default=None)

args = parser.parse_args()

ALPHABET_PRESETS = {
    'js-any': ' !#%&()*+,-./0123456789:;=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_abcdefghijklmnopqrstuvwxyz{|}~',
    'js-single-quote': ' !"#$%&()*+,-./0123456789:;=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~',
    'js-double-quote': ' !#$%&\'()*+,-./0123456789:;=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~',
    'js-template': ' !"#%&\'()*+,-./0123456789:;=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_abcdefghijklmnopqrstuvwxyz{|}~',
    'js-any-unsafe': ' !#%&()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_abcdefghijklmnopqrstuvwxyz{|}~',
    'js-single-quote-unsafe': ' !"#$%&()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~',
    'js-double-quote-unsafe': ' !#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~',
    'js-template-unsafe': ' !"#%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_abcdefghijklmnopqrstuvwxyz{|}~',
}

if args.alphabet is None:
    ALLOWED_ALPHABET = ALPHABET_PRESETS['js-any']
elif args.alphabet in ALPHABET_PRESETS:
    ALLOWED_ALPHABET = ALPHABET_PRESETS[args.alphabet]
else:
    with open(args.alphabet, 'r', encoding='utf-8') as fd:
        ALLOWED_ALPHABET = fd.read().strip()

with open(args.filename, 'r', encoding='utf-8') as fd:
    cnt = fd.read()


FRACTION_TO_USE_AS_ESCAPE = 0.001
LITERALS_FRACTION_PER_CHARS = (0, 0, 0.0001, 0.00001, 0.000002, 0)
LITERALS_MAX_COUNT_PER_CHARS = (0, 0, 8, 32, 128, 65536)
BASE = len(ALLOWED_ALPHABET)


def calculate_max_offsets(max_offset, base, escape_chars_count, literals_count, max_counts, offset_first_gain):
    while True:
        if max_offset < 128:
            return None
        try:
            B = base
            e = escape_chars_count
            (l1, l2, l3, l4) = literals_count
            (c1, c2, c3, c4) = max_counts
            o4 = max_offset
            K2 = offset_first_gain
            K3 = c3 * math.sqrt(K2 * o4 / c2)
            u4 = o4 * c4
            d1 = e * B
            X = d1 * B**3 - l1 * B**3 - l2 * B**2 - l3 * B - l4 - u4
            Y = B**3 + K2 * B**2
            Z = K3 * B
            u1 = (-math.sqrt(4 * X * Y * Z**2 + Z**4) + 2 * X * Y + Z**2) / (2 * Y**2)
            u2 = K2 * u1
            u3 = K3 * math.sqrt(u1)
            if (u1 / c1 >= 10) and (u2 / c2 > u1 / c1) and (u3 / c3 >= u2 / c2) and (u4 / c4 >= u3 / c3):
                break
            max_offset *= 0.8
        except:
            max_offset *= 0.8
    o1 = math.floor(u1 / c1)
    o2 = math.floor(u2 / c2)
    o4 = math.floor(o4)
    u1 = o1 * c1
    u2 = o2 * c2
    u4 = o4 * c4
    d2 = (d1 - l1 - u1) * B
    d3 = (d2 - l2 - u2) * B
    o3 = math.floor((d3 - l3 - (l4 + u4) / B) / c3)
    return (o1, o2, o3, o4)

def encode_simple_int(value, chars_count):
    code = ''
    for i in range(chars_count):
        code = ALLOWED_ALPHABET[value % BASE] + code
        value //= BASE
    return code

char_map = [0] * 128

for c in cnt:
    code = ord(c)
    if code >= 128:
        continue
    char_map[code] += 1

escapes = ''
escape_literals = []

for i in range(128):
    count = char_map[i]
    if (count == 0) and (chr(i) in ALLOWED_ALPHABET):
        escapes += chr(i)
    if (count > 0) and (chr(i) not in ALLOWED_ALPHABET):
        escape_literals.append((chr(i), count))

limit = math.floor(len(cnt) * FRACTION_TO_USE_AS_ESCAPE)
if escapes == '':
    limit = max(limit, min(char_map))

for i in range(128):
    count = char_map[i]
    if (count > 0) and (count <= limit) and (chr(i) in ALLOWED_ALPHABET):
        escape_literals.append((chr(i), count))
        escapes += chr(i)

escape_literals.sort(key=lambda x: x[1], reverse=True)

per_chars_limits = [
    len(cnt) + 1,
    len(cnt) + 1,
    LITERALS_FRACTION_PER_CHARS[2] * len(cnt),
    LITERALS_FRACTION_PER_CHARS[3] * len(cnt),
    LITERALS_FRACTION_PER_CHARS[4] * len(cnt),
    -1,
]

per_chars_limits_mul = [
    1,
    1,
    (per_chars_limits[1] / per_chars_limits[2]) ** (1 / LITERALS_MAX_COUNT_PER_CHARS[2]),
    (per_chars_limits[2] / per_chars_limits[3]) ** (1 / LITERALS_MAX_COUNT_PER_CHARS[3]),
    (per_chars_limits[3] / per_chars_limits[4]) ** (1 / LITERALS_MAX_COUNT_PER_CHARS[4]),
    1,
]

literals_per_chars = [[] for _ in range(6)]

for literal in escape_literals:
    for j in range(6):
        if literal[1] > per_chars_limits[j]:
            literals_per_chars[j].append(literal)
            per_chars_limits[j] *= per_chars_limits_mul[j]
            break

ESCAPES = len(escapes)

# print(f'escapes "{escapes}"')
# print(escape_literals)
# print(per_chars_limits)
# print(per_chars_limits_mul)
# print(literals_per_chars)

output = ALLOWED_ALPHABET + escapes + escapes[0]

HASH_BITS = 20
HASH_MAX = ((1 << HASH_BITS) - 1)
HASH_CONST = 31321
HASH_CONST_POW2 = (HASH_CONST * HASH_CONST) & HASH_MAX
HASH_CONST_POW3 = (HASH_CONST_POW2 * HASH_CONST) & HASH_MAX

def hash_update(hash, input, output):
	return ((hash - HASH_CONST_POW3 * output) * HASH_CONST + input) & HASH_MAX

hash_table:'dict[int, list[int]]' = dict()

if len(cnt) <= 4:
    raise ValueError('String too short to compress')

hash = hash_update(0, ord(cnt[0]), 0)
hash = hash_update(hash, ord(cnt[1]), 0)
hash = hash_update(hash, ord(cnt[2]), 0)
hash = hash_update(hash, ord(cnt[3]), 0)
empty_hash_table_item = []

location = 0

chars_to_max_count = (
    0, # 0
    0, # 1
    4, # 2
    20, # 3
    64, # 4
    256, # 5
)

chars_to_max_offset = (0, 0) + calculate_max_offsets(
    max_offset=65536,
    base=BASE,
    escape_chars_count=ESCAPES,
    literals_count=(len(x) for x in literals_per_chars[2:]),
    max_counts=(x - 3 for x in chars_to_max_count[2:]),
    offset_first_gain=128)

for max_offset in chars_to_max_offset[2:]:
    output += encode_simple_int(max_offset, 3)

for max_count in chars_to_max_count[2:]:
    output += encode_simple_int(max_count, 2)

used_values_per_chars = (
    0, # 0
    0, # 1
    (chars_to_max_count[2] - 3) * chars_to_max_offset[2] + len(literals_per_chars[2]), # 2
    (chars_to_max_count[3] - 3) * chars_to_max_offset[3] + len(literals_per_chars[3]), # 3
    (chars_to_max_count[4] - 3) * chars_to_max_offset[4] + len(literals_per_chars[4]), # 4
    (chars_to_max_count[5] - 3) * chars_to_max_offset[5] + len(literals_per_chars[5]), # 5
)

MAX_COUNT = chars_to_max_count[-1]
MAX_OFFSET = chars_to_max_offset[-1]

escape_literals_dict = {}

escaped_literals_codes_array = ''

for chars in range(2, len(literals_per_chars)): # pylint: disable=consider-using-enumerate
    output += encode_simple_int(len(literals_per_chars[chars]), 2)
    for i in range(len(literals_per_chars[chars])):
        literal = literals_per_chars[chars][i]
        escaped_literals_codes_array += encode_simple_int(ord(literal[0]), 2)
        value = chars_to_max_offset[chars] * (chars_to_max_count[chars] - 3) + i
        code = ''
        if chars == 5:
            code = ALLOWED_ALPHABET[value % BASE]
            value = value // BASE + used_values_per_chars[4]
        if chars >= 4:
            code = ALLOWED_ALPHABET[value % BASE] + code
            value = value // BASE + used_values_per_chars[3]
        if chars >= 3:
            code = ALLOWED_ALPHABET[value % BASE] + code
            value = value // BASE + used_values_per_chars[2]
        code = escapes[value // BASE] + ALLOWED_ALPHABET[value % BASE] + code
        escape_literals_dict[literal[0]] = code

output += escaped_literals_codes_array

output += encode_simple_int(len(cnt), 6)

# print(escape_literals_dict)

def matching(prev, now):
    n = 0
    while (now + n < len(cnt)) and (n < MAX_COUNT):
        if cnt[prev + n] != cnt[now + n]:
            return n
        n += 1
    return n

while location + 4 < len(cnt):

    if hash in hash_table:
        past = hash_table[hash]
        while (len(past) > 0) and (location - past[0] > MAX_OFFSET):
            past.pop(0)
    else:
        past = empty_hash_table_item

    best_score = 1
    best_count = -1
    best_offset = -1
    chars_per_offset = 2
    for past_location in reversed(past):
        offset = location - past_location
        count = matching(past_location, location)
        while offset > chars_to_max_offset[chars_per_offset]:
            chars_per_offset += 1
        chars = chars_per_offset
        while count > chars_to_max_count[chars]:
            chars += 1
        score = count - chars
        if score > best_score:
            best_score = score
            best_count = count
            best_offset = offset

    if location % 200 == 1:
        pass#print(f'{location / 1024 / 1024} / {len(cnt) / 1024 / 1024}    {len(output) / location}')

    if best_count > 0:
        chars = 2
        while best_offset > chars_to_max_offset[chars]:
            chars += 1
        while best_count > chars_to_max_count[chars]:
            chars += 1
        value = best_offset - 1 + chars_to_max_offset[chars] * (best_count - 4)
        code = ''
        if chars == 5:
            code = ALLOWED_ALPHABET[value % BASE]
            value = value // BASE + used_values_per_chars[4]
        if chars >= 4:
            code = ALLOWED_ALPHABET[value % BASE] + code
            value = value // BASE + used_values_per_chars[3]
        if chars >= 3:
            code = ALLOWED_ALPHABET[value % BASE] + code
            value = value // BASE + used_values_per_chars[2]
        code = escapes[value // BASE] + ALLOWED_ALPHABET[value % BASE] + code
        output += code
        new_location = location +  best_count
        if new_location + 4 >= len(cnt):
            location = new_location
            break
    else:
        char = cnt[location]
        new_location = location + 1
        if char in escape_literals_dict:
            output += escape_literals_dict[char]
        else:
            output += char

    while location < new_location:
        if hash in hash_table:
            hash_table[hash].append(location)
        else:
            hash_table[hash] = [location]
        hash = hash_update(hash, ord(cnt[location + 4]), ord(cnt[location]))
        location += 1

while location < len(cnt):
    char = cnt[location]
    location += 1
    if char in escape_literals_dict:
        output += escape_literals_dict[char]
    else:
        output += char


if args.out is None:
    print(output)
else:
    print(f'{len(cnt)} -> {len(output)} = {len(output) / len(cnt) * 100}%')
    with open(args.out, 'w', encoding='utf-8') as fd:
        fd.write(output)
