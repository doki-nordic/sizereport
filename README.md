# sizereport

Parse GCC-generated map file and show memory usage report.

## Install dependencies

Install **Node.js** with the following command:

```sh
sudo apt install nodejs
```

## Usage

Run the following command to show usage:

```sh
node sizereport.js --help
```

## Filter script

Filter script allows users to remove unneeded symbols from the report
and optionally categorize them. It is a JavaScript file with a single
function `filter()`.

See [filter-sample.js](filter-sample.js) for details.
