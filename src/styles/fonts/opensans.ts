import localFont from 'next/font/local';

const openSansLocal = localFont({
    src: [
        {
            path: '../../../node_modules/atlas-shared-web/assets/fonts/OpenSans-Light.ttf',
            weight: '300',
            style: 'normal',
        },
        {
            path: '../../../node_modules/atlas-shared-web/assets/fonts/OpenSans-LightItalic.ttf',
            weight: '300',
            style: 'italic',
        },
        {
            path: '../../../node_modules/atlas-shared-web/assets/fonts/OpenSans-Regular.ttf',
            weight: '400',
            style: 'normal',
        },
        {
            path: '../../../node_modules/atlas-shared-web/assets/fonts/OpenSans-Italic.ttf',
            weight: '400',
            style: 'italic',
        },
        {
            path: '../../../node_modules/atlas-shared-web/assets/fonts/OpenSans-Medium.ttf',
            weight: '500',
            style: 'normal',
        },
        {
            path: '../../../node_modules/atlas-shared-web/assets/fonts/OpenSans-MediumItalic.ttf',
            weight: '500',
            style: 'italic',
        },
        {
            path: '../../../node_modules/atlas-shared-web/assets/fonts/OpenSans-SemiBold.ttf',
            weight: '600',
            style: 'normal',
        },
        {
            path: '../../../node_modules/atlas-shared-web/assets/fonts/OpenSans-SemiBoldItalic.ttf',
            weight: '600',
            style: 'italic',
        },
        {
            path: '../../../node_modules/atlas-shared-web/assets/fonts/OpenSans-Bold.ttf',
            weight: '700',
            style: 'normal',
        },
        {
            path: '../../../node_modules/atlas-shared-web/assets/fonts/OpenSans-BoldItalic.ttf',
            weight: '700',
            style: 'italic',
        },
        {
            path: '../../../node_modules/atlas-shared-web/assets/fonts/OpenSans-ExtraBold.ttf',
            weight: '800',
            style: 'normal',
        },
        {
            path: '../../../node_modules/atlas-shared-web/assets/fonts/OpenSans-ExtraBoldItalic.ttf',
            weight: '800',
            style: 'italic',
        },
    ],
    display: 'swap', // Optional: 'swap' for Font-Face Observer or 'block' for immediate rendering
});

export { openSansLocal };