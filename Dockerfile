FROM node:12.22.12

WORKDIR /home/videowiki
COPY . .
RUN npm install
RUN npm run build
RUN rm -rf build
RUN mkdir build
RUN mv client/dist/* build/

CMD ["npm", "start"]

