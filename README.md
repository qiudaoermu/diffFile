1.执行 `node build/index.js`,dist 目录是 src 打包后的文件

2.修改 src 的文件，再执行 `node build/index.js`

3.dist 目录只有被修改的文件被覆盖

检测：使用 `fswatch`, 可以检测 dist 目录的变化情况

```
fswatch -l 2 /Users/xxx/diffFile/dist
```
