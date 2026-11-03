# Imagem do servidor do ERASÓ (site + aplicativo + presença/sinalização). Sem dependências npm.
FROM node:22-alpine
WORKDIR /app
COPY package.json ./
COPY server ./server
COPY app ./app
COPY landing ./landing
ENV ERASO_PUBLICO=1 PORT=8780
EXPOSE 8780
USER node
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:${PORT}/saude || exit 1
CMD ["node", "server/servidor.mjs"]
