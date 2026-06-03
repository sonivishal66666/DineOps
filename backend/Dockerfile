FROM node:24-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# Generate Prisma Client if schema exists
RUN npx prisma generate || true

RUN npm run build

EXPOSE 5000

CMD ["npm", "run", "start:prod"]
