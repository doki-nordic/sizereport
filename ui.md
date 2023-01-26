

Show details:
 * Libraries
 * Files
 * Symbols

Select memory:
 * FLASH
 * RAM

Filters, presets `[ Save ]  [ Load ]`:
 * `[x]` Enable
 * Condition:
    * `Symbol` | `File` | `Library` | `Memory` | `Expression` | `JavaScript`
    * if not `exp` or `js`: `equals` | `contains` | `starts with` | `ends with` | `match regex`
    * `[________]` (multiline if `exp` or `js`)
    *  if not `exp` or `js`: `[x]` negate condition
 * Result:
    * `Show matching only`
    * `Colorize`: `color: [_______|v]`

Expressions:
 * Operators: `[do[es]] not` `!` `==` `equal[s]` `!=` `^=` `start[s] [with]` `$=` `end[s] [with]` `~=` `contain[s]` `()` `and` `&` `&&` `or` `|` `||` `if then else` `^^` `^` `xor` `re[gex[p]]` `match[es] [re[gex[p]]]` 
 * Fields: `symbol` `name` `library` `archive` `memory` `file` `object`
 * Literals: `"..."`
 * Regex: `/.../`
 * Example: symbol does not start with "my_"   symbol !^= "my_"

JavaScript:
 * Parameters: `memory`, `library`, `file`, `symbol`
 * Result:
    * `boolean` - show/hide
    * `string` - colorize (HTML hex color)

Simple filters are translated to expressions. Expressions are translated to JavaScript.
JavaScript is always executed as a filter, e.g.:
```
// Simple filter:
Symbol starts with my_ [Colorize: Red]

// Expression
Symbol starts with "my_" [Colorize: Red]

// JavaScript
if (symbol.startWith("my_")) {
    return "#FF0000"
} else {
    return true
}

```
