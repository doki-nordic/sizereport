

export function printAddress(address: number): string {
    let str = '00000000' + address.toString(16);
    return '0x' + str.substring(str.length - 8).toUpperCase();
}

export function printSize(size: number): string {
    let sym = [' Bytes', ' KiB', ' MiB', ' GiB', ' TiB', ' PiB', ' EiB'];
    let i = 0;
    while (Math.round(size) >= 1000) {
        size /= 1024;
        i++;
    }
    if (Math.round(size) >= 100) {
        return Math.round(size).toString() + sym[i];
    } else if (Math.round(size * 10) >= 100) {
        return (Math.round(size * 10) / 10).toString() + sym[i];
    } else {
        return (Math.round(size * 100) / 100).toString() + sym[i];
    }
}

export function printSizeExact(size: number) {
    let sym = [' Bytes', ' KiB', ' MiB', ' GiB', ' TiB', ' PiB', ' EiB'];
    let i = 0;
    let exactSize = size;
    while (Math.round(size) >= 1000) {
        size /= 1024;
        i++;
    }
    let short: string;
    if (Math.round(size) >= 100) {
        short = Math.round(size).toString() + sym[i];
    } else if (Math.round(size * 10) >= 100) {
        short = (Math.round(size * 10) / 10).toString() + sym[i];
    } else {
        short = (Math.round(size * 100) / 100).toString() + sym[i];
    }
    if (i > 0) {
        return (<>{short} <span className="exact-size">({exactSize})</span></>);
    } else {
        return (<>{exactSize + sym[0]}</>);
    }
}
