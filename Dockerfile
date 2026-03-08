# 使用 Node.js 18
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY package-lock.json* ./

# 安装根目录依赖
RUN npm install

# 安装后端依赖
RUN cd backend && npm install

# 复制源代码
COPY . .

# 构建前端
RUN npm run build

# 暴露端口
EXPOSE 5000

# 启动服务器
CMD ["node", "backend/server.js"]
