FROM node:12.22.12

WORKDIR /home/videowiki
COPY . .
RUN npm install
RUN npm run build

CMD ["npm", "start"]

