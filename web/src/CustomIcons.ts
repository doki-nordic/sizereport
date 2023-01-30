
import * as icons16 from './icons16';
import * as icons20 from './icons20';
import { BlueprintIcons_16Id } from "@blueprintjs/icons/lib/esm/generated-icons/16px/blueprint-icons-16";
import { BlueprintIcons_20Id } from "@blueprintjs/icons/lib/esm/generated-icons/20px/blueprint-icons-20";
import { IconSvgPaths16, IconSvgPaths20 } from "@blueprintjs/icons";

export declare type CustomIconsOutput = BlueprintIcons_16Id & BlueprintIcons_20Id;

type CustomIcons = {
    [key in keyof (typeof icons16 | typeof icons20)]: CustomIconsOutput;
};

const icons: CustomIcons = {} as CustomIcons;

export default icons;

let done = false;

export function customizeIcons() {
    function updateIcons(dst: any, src: any) {
        for (let key in dst) {
            if (!src[key]) {
                dst[key].splice(0);
            }
        }
        for (let key in src) {
            (icons as any)[key] = key as CustomIconsOutput;
            if (!dst[key]) {
                dst[key] = src[key];
            }
        }
    }
    updateIcons(IconSvgPaths16, icons16);
    updateIcons(IconSvgPaths20, icons20);
}

customizeIcons();
