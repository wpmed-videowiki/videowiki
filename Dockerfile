FROM node:20.12.2

WORKDIR /home/videowiki
COPY . .
RUN npm install
RUN cd client && npm install
RUN npm run build
RUN rm -rf build
RUN mkdir build
RUN mv client/dist/* build/

CMD ["npm", "start"]

