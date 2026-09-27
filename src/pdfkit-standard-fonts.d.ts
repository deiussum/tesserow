// @types/pdfkit predates pdfkit 0.20's per-font standard-font modules.
declare module 'pdfkit/standard-fonts/*' {
    const font: object;
    export default font;
}
