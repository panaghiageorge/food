/* @flow */

import { ImageSourcePropType } from 'react-native';

export type IconConfig = {
    font: string;
    name: string;
};

export type CustomIconConfig = {
    image: ImageSourcePropType;
};

export type IconMap = {
    [key: string]: IconConfig | CustomIconConfig;
};
