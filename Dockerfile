########
# BASE #
########
FROM public.ecr.aws/lambda/nodejs:20 AS base
# RUN yum update -y && yum install -y gcc gcc-c++ make python3 which
# RUN export PATH=$PATH:$(which python3)
# RUN npm i -g add npm 

#########
# RAW #
#########
FROM base AS raw
WORKDIR /app

COPY . .

#########
# BUILD #
#########
FROM base AS build
WORKDIR /app

COPY .gitignore .gitignore
COPY --from=raw /app/package.json ./package.json
COPY --from=raw /app/package-lock.json ./package-lock.json
RUN npm ci

COPY --from=raw /app/ .
RUN npm run build 
RUN mkdir -p ./out && cp -LR ./node_modules ./out/node_modules && cp -LR ./dist ./out

##########
# LAMBDA #
##########
FROM public.ecr.aws/lambda/nodejs:20 AS app
WORKDIR ${LAMBDA_TASK_ROOT}

COPY --from=build /app/out/node_modules/ ./node_modules
COPY --from=build /app/out/dist .

# This CMD is overridden in terraform for the various lambdas.
CMD ["index.handler"] 
