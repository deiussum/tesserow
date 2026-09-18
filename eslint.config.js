import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';

export default tseslint.config(
    {
        ignores: ['dist/**', 'node_modules/**', 'src-tauri/target/**', '.pnp.*'],
    },
    js.configs.recommended,
    // eslint-disable-next-line import/no-named-as-default-member -- this is typescript-eslint's own documented usage
    ...tseslint.configs.recommended,
    importPlugin.flatConfigs.recommended,
    importPlugin.flatConfigs.typescript,
    {
        languageOptions: {
            globals: {
                window: 'readonly',
                document: 'readonly',
                console: 'readonly',
                navigator: 'readonly',
                Buffer: 'readonly',
                process: 'readonly',
                __dirname: 'readonly',
                module: 'readonly',
                require: 'readonly',
            },
        },
        settings: {
            'import/resolver': {
                typescript: true,
            },
        },
    },
);
