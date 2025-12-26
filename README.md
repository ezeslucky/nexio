<!--  nvm use 20
yarn run affine @affine/server prisma migrate deploy
nvm use 20
export NODE_OPTIONS="--max-old-space-size=24576"

yarn run affine dev -p @affine/server



wab
pkill -f webpack || true
pkill -f node || true

nvm use 20
node -v

export NODE_OPTIONS="--max-old-space-size=24576"
export GENERATE_SOURCEMAP=false
export CI=true
echo $NODE_OPTIONS

yarn run affine dev -p @affine/web
 -->