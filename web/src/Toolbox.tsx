
import icons from "./CustomIcons";
import { ContentType } from "./store";


export function getMemoryIcon(memoryName: string) {
    switch (memoryName.toUpperCase()) {
        case 'RAM':
            return icons.Ram;
        case 'FLASH':
            return icons.Database; // TODO: Custom icon for flash (e.g. like SD card)
        default:
            return icons.Database;
    }
}

export function getItemIcon(kind: string | ContentType) {
    if (typeof kind === 'string') {
        let k = kind.toUpperCase();
        if (k.startsWith('LIB')) {
            return icons.FolderClose;
        } else if (k.startsWith('FILE')) {
            return icons.Document;
        } else {
            return icons.SmallSquare;
        }
    } else {
        switch (kind) {
            case ContentType.LIBRARY:
                return icons.FolderClose;
            case ContentType.FILE:
                return icons.Document;
            default:
                return icons.SmallSquare;
        }
    }
}
