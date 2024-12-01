FROM node:20.12.2-slim as base

FROM base as builder

WORKDIR /home/videowiki
COPY ./client ./

RUN npm install
RUN npm run build

FROM base
WORKDIR /home/videowiki

COPY . .
RUN rm -rf client build

RUN npm install
COPY --from=builder /home/videowiki/dist /home/videowiki/build
COPY ./client/public ./client/public

CMD ["npm", "start"]

