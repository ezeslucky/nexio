# NEXIO 
Is a next-generation all-in-one workspace and knowledge operating system that unifies wikis, knowledge management, presentations, and digital assets into a single platform — built to outperform tools like Notion and Miro.


<!--  
nvm use 20
yarn run nexio @nexio/server prisma migrate deploy
nvm use 20
export NODE_OPTIONS="--max-old-space-size=24576"

yarn run nexio dev -p @nexio/server

yarn nexio dev -p @nexio/server


wab
pkill -f webpack || true
pkill -f node || true

nvm use 20
node -v

export NODE_OPTIONS="--max-old-space-size=24576"
export GENERATE_SOURCEMAP=false
export CI=true
echo $NODE_OPTIONS
yarn run nexio dev -p @nexio/web

nvm use 20 
export NODE_OPTIONS="--max-old-space-size=12288" 
yarn nexio build -p @nexio/web --deps --wait-deps


yarn nexio build -p @nexio/electron --deps --wait-deps

yarn nexio build -p @nexio/admin --deps --wait-deps


yarn run nexio dev -p @nexio/web


docker start nexio-postgres
docker start postgres
docker start redis



DB 

docker run -d \
  --name nexio-postgres \
  -e POSTGRES_USER=nexio \
  -e POSTGRES_PASSWORD=nexio \
  -e POSTGRES_DB=nexio \
  -p 5432:5432 \
  postgres:15


  docker ps
  docker start redis
 -->