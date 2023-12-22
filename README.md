# ATP-Server
Server code for ATP Consulting


## Deploying
az acr login --name atpappserver 
docker buildx build --platform linux/amd64 -t atp_server . 
docker tag atp_server atpappserver.azurecr.io/webapp:latest
docker push atpappserver.azurecr.io/webapp:latest