## Build with 'docker build . -t xxxxxx'
## Replace xxxxxx with your imagename above and below
## Run with 'docker run -d -p xx:80 --restart=unless-stopped --name=trtl-resolver xxxxxx'
## You can choose your port   ^ here.                                 imagename  ^ here
## To test your resolver 
## curl -X GET "http://xxxxxx:xx/edu.trtl" -H "accept: application/json"
##       your resolver ^^     ^^ your port
## See Docs https://docs.trtlnic.com/
## TRTL power

FROM node:lts-alpine

RUN apk add git && \
    git clone https://github.com/turtlecoin/.trtl-resolver && \
    cd .trtl-resolver && npm install && \
    apk del git
    
WORKDIR /.trtl-resolver

ENTRYPOINT node index.js
