FROM node:20.12.2

WORKDIR /home/videowiki

COPY package*.json ./
RUN npm install

COPY . .

RUN cd client && npm install
RUN npm run build
RUN rm -rf build
RUN mkdir build
RUN mv client/dist/* build/

CMD ["npm", "start"]

