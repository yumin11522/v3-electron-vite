import { defineConfig } from "vite"
import { resolve } from "path"
import vue from "@vitejs/plugin-vue"
import vueJsx from "@vitejs/plugin-vue-jsx"
import { createSvgIconsPlugin } from "vite-plugin-svg-icons"
import svgLoader from "vite-svg-loader"
import UnoCSS from "unocss/vite"
import electron from "vite-electron-plugin"
import { rmSync } from "fs"
import pkg from "./package.json"

/** 清空dist */
rmSync("dist", { recursive: true, force: true })

/** 配置项文档：https://cn.vitejs.dev/config */
export default defineConfig({
  resolve: {
    alias: {
      /** @ 符号指向 src 目录 */
      "@": resolve(__dirname, "./src")
    }
  },
  server: {
    /** 是否自动打开浏览器 */
    open: false,
    /** 设置 host: true 才可以使用 Network 的形式，以 IP 访问项目 */
    host: pkg.env.host,
    /** 端口号 */
    port: pkg.env.port
  },
  build: {
    /** 消除打包大小超过 500kb 警告 */
    chunkSizeWarningLimit: 2048,
    /** 禁用 gzip 压缩大小报告 */
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        /**
         * 分块策略
         * 1. 注意这些包名必须存在，否则打包会报错
         * 2. 如果你不想自定义 chunk 分割策略，可以直接移除这段配置
         */
        manualChunks: {
          vue: ["vue", "vue-router", "pinia"],
          element: ["element-plus", "@element-plus/icons-vue"],
          vxe: ["vxe-table", "vxe-table-plugin-element", "xe-utils"]
        }
      }
    }
  },
  /** 混淆器 */
  esbuild: {
    // /** 打包时移除 console.log */
    pure: ["console.log"],
    /** 打包时移除 debugger */
    drop: ["debugger"],
    /** 打包时移除所有注释 */
    legalComments: "none"
  },
  /** Vite 插件 */
  plugins: [
    vue(),
    vueJsx(),
    /** 将 SVG 静态图转化为 Vue 组件 */
    svgLoader({ defaultImport: "url" }),
    /** SVG 插件 */
    createSvgIconsPlugin({
      // Specify the icon folder to be cached
      iconDirs: [resolve(process.cwd(), "./src/icons/svg")],
      // Specify symbolId format
      symbolId: "icon-[dir]-[name]",
      inject: "body-first"
    }),
    /** UnoCSS */
    UnoCSS(),
    electron({
      outDir: "dist",
      include: ["script"],
      transformOptions: {
        sourcemap: false
      }
    })
  ],
  css: {
    postcss: {
      plugins: [
        {
          postcssPlugin: "internal:charset-removal",
          AtRule: {
            charset: (atRule) => {
              if (atRule.name === "charset") {
                atRule.remove()
              }
            }
          }
        }
      ]
    }
  },
  clearScreen: false
})
