// vite.config.ts
import { defineConfig } from "file:///home/mega/savitri/node_modules/vite/dist/node/index.js";
import path from "path";
import vue from "file:///home/mega/savitri/packages/ui/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import dts from "file:///home/mega/savitri/node_modules/vite-plugin-dts/dist/index.mjs";
import { viteStaticCopy } from "file:///home/mega/savitri/node_modules/vite-plugin-static-copy/dist/index.js";
var __vite_injected_original_dirname = "/home/mega/savitri/packages/ui";
var vite_config_default = defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true
    }),
    viteStaticCopy({
      targets: [
        {
          src: "./src/less",
          dest: "."
        }
      ]
    })
  ],
  build: {
    lib: {
      entry: "src/index.ts",
      name: "aeria-ui",
      formats: [
        "es"
      ]
    },
    rollupOptions: {
      input: {
        main: path.resolve(__vite_injected_original_dirname, "src/index.ts")
      },
      output: {
        exports: "named"
      },
      external: [
        "vue",
        "vue-router",
        "maska",
        /@aeria-ui\//,
        /@aeriajs\//
      ]
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9tZWdhL3Nhdml0cmkvcGFja2FnZXMvdWlcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL21lZ2Evc2F2aXRyaS9wYWNrYWdlcy91aS92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9tZWdhL3Nhdml0cmkvcGFja2FnZXMvdWkvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJ1xuaW1wb3J0IGR0cyBmcm9tICd2aXRlLXBsdWdpbi1kdHMnXG5pbXBvcnQgeyB2aXRlU3RhdGljQ29weSB9IGZyb20gJ3ZpdGUtcGx1Z2luLXN0YXRpYy1jb3B5J1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgdnVlKCksXG4gICAgZHRzKHtcbiAgICAgIGluc2VydFR5cGVzRW50cnk6IHRydWVcbiAgICB9KSxcbiAgICB2aXRlU3RhdGljQ29weSh7XG4gICAgICB0YXJnZXRzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBzcmM6ICcuL3NyYy9sZXNzJyxcbiAgICAgICAgICBkZXN0OiAnLidcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0pXG4gIF0sXG4gIGJ1aWxkOiB7XG4gICAgbGliOiB7XG4gICAgICBlbnRyeTogJ3NyYy9pbmRleC50cycsXG4gICAgICBuYW1lOiAnYWVyaWEtdWknLFxuICAgICAgZm9ybWF0czogW1xuICAgICAgICAnZXMnXG4gICAgICBdXG4gICAgfSxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBpbnB1dDoge1xuICAgICAgICBtYWluOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnc3JjL2luZGV4LnRzJylcbiAgICAgIH0sXG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgZXhwb3J0czogJ25hbWVkJ1xuICAgICAgfSxcbiAgICAgIGV4dGVybmFsOiBbXG4gICAgICAgICd2dWUnLFxuICAgICAgICAndnVlLXJvdXRlcicsXG4gICAgICAgICdtYXNrYScsXG4gICAgICAgIC9AYWVyaWEtdWlcXC8vLFxuICAgICAgICAvQGFlcmlhanNcXC8vLFxuICAgICAgXVxuICAgIH1cbiAgfSxcbn0pXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTRRLFNBQVMsb0JBQW9CO0FBQ3pTLE9BQU8sVUFBVTtBQUNqQixPQUFPLFNBQVM7QUFDaEIsT0FBTyxTQUFTO0FBQ2hCLFNBQVMsc0JBQXNCO0FBSi9CLElBQU0sbUNBQW1DO0FBTXpDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLElBQUk7QUFBQSxJQUNKLElBQUk7QUFBQSxNQUNGLGtCQUFrQjtBQUFBLElBQ3BCLENBQUM7QUFBQSxJQUNELGVBQWU7QUFBQSxNQUNiLFNBQVM7QUFBQSxRQUNQO0FBQUEsVUFDRSxLQUFLO0FBQUEsVUFDTCxNQUFNO0FBQUEsUUFDUjtBQUFBLE1BQ0Y7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxLQUFLO0FBQUEsTUFDSCxPQUFPO0FBQUEsTUFDUCxNQUFNO0FBQUEsTUFDTixTQUFTO0FBQUEsUUFDUDtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxlQUFlO0FBQUEsTUFDYixPQUFPO0FBQUEsUUFDTCxNQUFNLEtBQUssUUFBUSxrQ0FBVyxjQUFjO0FBQUEsTUFDOUM7QUFBQSxNQUNBLFFBQVE7QUFBQSxRQUNOLFNBQVM7QUFBQSxNQUNYO0FBQUEsTUFDQSxVQUFVO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
