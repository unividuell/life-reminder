/// <reference types="vitest" />
import {defineConfig, UserConfig} from "vite";
import createVuePlugin from "@vitejs/plugin-vue";
import {fileURLToPath, URL} from "node:url";
import vuetify, {transformAssetUrls} from "vite-plugin-vuetify";

// kudos and inspiration by https://github.com/logue/vite-vuetify-ts-starter/blob/master/vite.config.ts
export default defineConfig(async ({command}): Promise<UserConfig> => {
    return {
        resolve: {
            alias: {
                // you can use these alias to resolve files (via import-statements)
                "@": fileURLToPath(new URL("./src", import.meta.url)),
                "~": fileURLToPath(new URL("./node_modules", import.meta.url)),
            },
            // you can omit file extensions in your import-statements
            extensions: [".js", ".json", ".jsx", ".mjs", ".ts", ".tsx", ".vue"],
        },
        plugins: [
            createVuePlugin({
                template: {
                    // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin#image-loading
                    transformAssetUrls,
                },
            }),
            vuetify({
                autoImport: true,
            }),
        ],
        // Build Options
        // https://vitejs.dev/config/build-options.html
        build: {
            // Build Target
            // https://vitejs.dev/config/build-options.html#build-target
            target: "esnext",
            // Minify option
            // https://vitejs.dev/config/build-options.html#build-minify
            minify: "esbuild",
        },
        // https://vitejs.dev/config/server-options.html
        server: {
            port: 8080,
        },
        test: {
            globals: true,
            environment: "happy-dom",
            server: {
                deps: {
                    inline: ["vuetify"],
                },
            },
        },
    };
});
